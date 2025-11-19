'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToastContext } from '@/contexts/toast-context'

export interface IrpfPayload {
  name: string
  cpf: string
  sequenceNumber?: number
  clientId?: string
  year?: number
}

export interface UseIrpfServicesReturn {
  entries: any[]
  loading: boolean
  error: string | null
  createIrpfEntry: (payload: IrpfPayload) => Promise<void>
  updateIrpfEntry: (id: string, payload: Partial<IrpfPayload>) => Promise<void>
  deleteIrpfEntry: (id: string) => Promise<void>
  invalidateCache: () => void
}

const QUERY_KEY = ['irpf-entries']

export const useIrpfServices = (filters?: { clientId?: string; year?: string; search?: string }): UseIrpfServicesReturn => {
  const queryClient = useQueryClient()
  const { show } = useToastContext()

  const { data: entries = [], isLoading, error } = useQuery({
    queryKey: [...QUERY_KEY, filters || {}],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.clientId) params.set('clientId', filters.clientId)
      if (filters?.year) params.set('year', filters.year)
      if (filters?.search) params.set('search', filters.search)
      const res = await fetch(`/api/services/irpf?${params.toString()}`)
      if (!res.ok) throw new Error('Falha ao carregar IRPF')
      return await res.json()
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const createMutation = useMutation({
    mutationFn: async (payload: IrpfPayload) => {
      const res = await fetch('/api/services/irpf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Falha ao criar entrada IRPF')
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      show('Entrada IRPF criada!', 'success')
    },
    onError: (e: any) => {
      show(e.message || 'Erro ao criar entrada IRPF', 'error')
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<IrpfPayload> }) => {
      const res = await fetch(`/api/services/irpf/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Falha ao atualizar IRPF')
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      show('Entrada IRPF atualizada!', 'success')
    },
    onError: (e: any) => {
      show(e.message || 'Erro ao atualizar IRPF', 'error')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/services/irpf/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao remover IRPF')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      show('Entrada IRPF removida!', 'success')
    },
    onError: (e: any) => {
      show(e.message || 'Erro ao remover IRPF', 'error')
    }
  })

  const invalidateCache = (): void => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY })
  }

  return {
    entries,
    loading: isLoading,
    error: error?.message || null,
    createIrpfEntry: createMutation.mutateAsync,
    updateIrpfEntry: (id: string, payload: Partial<IrpfPayload>) => updateMutation.mutateAsync({ id, payload }),
    deleteIrpfEntry: deleteMutation.mutateAsync,
    invalidateCache
  }
}