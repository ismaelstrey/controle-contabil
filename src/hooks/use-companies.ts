'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToastContext } from '@/contexts/toast-context'

export interface CreateCompanyPayload {
  cnpj: string
  razaoSocial?: string
  tipoEmpresa?: 'MEI' | 'EI' | 'LTDA' | 'SLU' | 'SA' | 'SociedadeSimples' | 'Cooperativa'
  porte?: 'ME' | 'EPP' | 'Media' | 'Grande'
  regimeTributario?: 'SimplesNacional' | 'LucroPresumido' | 'LucroReal'
  cnaePrincipal?: string
}

export interface SyncDasPayload {
  periodo?: string
  data_pagamento?: string
  force?: boolean
}

export const useCompanies = () => {
  const queryClient = useQueryClient()
  const { show } = useToastContext()

  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await fetch('/api/companies')
      if (!res.ok) throw new Error('Falha ao carregar empresas')
      return await res.json()
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: async (payload: CreateCompanyPayload) => {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Falha ao criar empresa')
      }
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      show('Empresa criada!', 'success')
    },
    onError: (e: any) => {
      show(e.message || 'Erro ao criar empresa', 'error')
    }
  })

  const syncMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: SyncDasPayload }) => {
      const res = await fetch(`/api/companies/${id}/sync-das`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Falha ao sincronizar DAS')
      }
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      show('Sincronização concluída!', 'success')
    },
    onError: (e: any) => {
      show(e.message || 'Erro ao sincronizar DAS', 'error')
    }
  })

  return {
    companies,
    loading: isLoading,
    error: error?.message || null,
    createCompany: createMutation.mutateAsync,
    syncDas: (id: string, payload: SyncDasPayload) => syncMutation.mutateAsync({ id, payload })
  }
}