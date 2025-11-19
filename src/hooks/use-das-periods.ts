'use client'

import { useQuery } from '@tanstack/react-query'
import { useToastContext } from '@/contexts/toast-context'

export const useDasPeriods = (companyId: string | null) => {
  const { show } = useToastContext()
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['das-periods', companyId],
    queryFn: async () => {
      if (!companyId) return []
      const res = await fetch(`/api/companies/${companyId}/periods`)
      if (!res.ok) throw new Error('Falha ao carregar períodos')
      return await res.json()
    },
    enabled: !!companyId,
    staleTime: 60 * 1000,
  })
  if (error) show('Erro ao carregar períodos', 'error')
  return { periods: data as any[], loading: isLoading, error: error?.message || null, refetch }
}