'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToastContext } from '@/contexts/toast-context'

export interface MonthlyServicePayload {
  clientId: string
  tipoGuia?: string
  regularizacao?: string
  situacao?: string
  referenceMonth?: string
}

export interface UseMonthlyServicesReturn {
  services: any[]
  loading: boolean
  error: string | null
  createMonthlyService: (payload: MonthlyServicePayload) => Promise<void>
  updateMonthlyService: (id: string, payload: Partial<MonthlyServicePayload>) => Promise<void>
  deleteMonthlyService: (id: string) => Promise<void>
  invalidateCache: () => void
}

const QUERY_KEY = ['monthly-services']

export const useMonthlyServices = (filters?: { clientId?: string; month?: string; year?: string; search?: string }): UseMonthlyServicesReturn => {
  const queryClient = useQueryClient()
  const { show } = useToastContext()

  const { data: services = [], isLoading, error } = useQuery({
    queryKey: [...QUERY_KEY, filters || {}],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.clientId) params.set('clientId', filters.clientId)
      if (filters?.month) params.set('month', filters.month)
      if (filters?.year) params.set('year', filters.year)
      if (filters?.search) params.set('search', filters.search)
      const res = await fetch(`/api/services/monthly?${params.toString()}`)
      if (!res.ok) throw new Error('Falha ao carregar serviços mensais')
      return await res.json()
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: async (payload: MonthlyServicePayload) => {
      const res = await fetch('/api/services/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Falha ao criar serviço mensal')
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      show('Serviço mensal criado!', 'success')
    },
    onError: (e: any) => {
      show(e.message || 'Erro ao criar serviço mensal', 'error')
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<MonthlyServicePayload> }) => {
      const res = await fetch(`/api/services/monthly/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Falha ao atualizar serviço mensal')
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      show('Serviço mensal atualizado!', 'success')
    },
    onError: (e: any) => {
      show(e.message || 'Erro ao atualizar serviço mensal', 'error')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/services/monthly/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao remover serviço mensal')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      show('Serviço mensal removido!', 'success')
    },
    onError: (e: any) => {
      show(e.message || 'Erro ao remover serviço mensal', 'error')
    }
  })

  const invalidateCache = (): void => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY })
  }

  return {
    services,
    loading: isLoading,
    error: error?.message || null,
    createMonthlyService: createMutation.mutateAsync,
    updateMonthlyService: (id: string, payload: Partial<MonthlyServicePayload>) => updateMutation.mutateAsync({ id, payload }),
    deleteMonthlyService: deleteMutation.mutateAsync,
    invalidateCache
  }
}