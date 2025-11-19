'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToastContext } from '@/contexts/toast-context'

export interface AnnualServicePayload {
  clientId: string
  type?: string
  observation?: string
  year?: number
}

export interface UseAnnualServicesReturn {
  services: any[]
  loading: boolean
  error: string | null
  createAnnualService: (payload: AnnualServicePayload) => Promise<void>
  updateAnnualService: (id: string, payload: Partial<AnnualServicePayload>) => Promise<void>
  deleteAnnualService: (id: string) => Promise<void>
  invalidateCache: () => void
}

const QUERY_KEY = ['annual-services']

export const useAnnualServices = (filters?: { clientId?: string; year?: string; search?: string }): UseAnnualServicesReturn => {
  const queryClient = useQueryClient()
  const { show } = useToastContext()

  const { data: services = [], isLoading, error } = useQuery({
    queryKey: [...QUERY_KEY, filters || {}],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.clientId) params.set('clientId', filters.clientId)
      if (filters?.year) params.set('year', filters.year)
      if (filters?.search) params.set('search', filters.search)
      const res = await fetch(`/api/services/annual?${params.toString()}`)
      if (!res.ok) throw new Error('Falha ao carregar serviços anuais')
      return await res.json()
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: async (payload: AnnualServicePayload) => {
      const res = await fetch('/api/services/annual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Falha ao criar serviço anual')
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      show('Serviço anual criado!', 'success')
    },
    onError: (e: any) => {
      show(e.message || 'Erro ao criar serviço anual', 'error')
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<AnnualServicePayload> }) => {
      const res = await fetch(`/api/services/annual/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Falha ao atualizar serviço anual')
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      show('Serviço anual atualizado!', 'success')
    },
    onError: (e: any) => {
      show(e.message || 'Erro ao atualizar serviço anual', 'error')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/services/annual/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao remover serviço anual')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      show('Serviço anual removido!', 'success')
    },
    onError: (e: any) => {
      show(e.message || 'Erro ao remover serviço anual', 'error')
    }
  })

  const invalidateCache = (): void => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY })
  }

  return {
    services,
    loading: isLoading,
    error: error?.message || null,
    createAnnualService: createMutation.mutateAsync,
    updateAnnualService: (id: string, payload: Partial<AnnualServicePayload>) => updateMutation.mutateAsync({ id, payload }),
    deleteAnnualService: deleteMutation.mutateAsync,
    invalidateCache
  }
}