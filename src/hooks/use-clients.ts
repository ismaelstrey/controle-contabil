'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToastContext } from '@/contexts/toast-context'
import { Client, CreateClientData, UpdateClientData, ClientFilters } from '@/types'

export interface UseClientsReturn {
  clients: Client[]
  loading: boolean
  error: string | null
  createClient: (data: CreateClientData) => Promise<void>
  updateClient: (id: string, data: UpdateClientData) => Promise<void>
  deleteClient: (id: string) => Promise<void>
  searchClients: (query: string) => Promise<void>
  invalidateCache: () => void
  getClientById: (id: string) => Client | undefined
  getClientsByServiceType: (serviceType: 'monthly' | 'annual' | 'irpf') => Client[]
}

const CLIENTS_QUERY_KEY = ['clients']

export const useClients = (): UseClientsReturn => {
  const queryClient = useQueryClient()
  const { show } = useToastContext()

  const { data: clients = [], isLoading, error } = useQuery<Client[]>({
    queryKey: CLIENTS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch('/api/clients')
      if (!res.ok) throw new Error('Falha ao carregar clientes')
      const raw = await res.json()
      const mapped: Client[] = Array.isArray(raw) ? raw.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        cpf: c.cpf || undefined,
        cnpj: c.cnpj || undefined,
        phone: c.phone || undefined,
        address: c.address || undefined,
        status: c.status === 'ACTIVE' ? 'active' : 'inactive',
        notes: c.notes || undefined,
        monthly_service: undefined,
        annual_service: undefined,
        irpf_entry: undefined,
        created_at: c.createdAt,
        updated_at: c.updatedAt,
        user_id: c.userId,
        data_nascimento: c.dataNascimento || undefined,
        codigo_acesso: c.codigoAcesso || undefined,
        senha_gov: c.senhaGov || undefined,
        codigo_regularize: c.codigoRegularize || undefined,
        senha_nfse: c.senhaNfse || undefined
      })) : []
      return mapped
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })

  const createClientMutation = useMutation({
    mutationFn: async (clientData: CreateClientData) => {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientData.name,
          email: clientData.email,
          cpf: clientData.cpf,
          cnpj: clientData.cnpj,
          phone: clientData.phone || null,
          address: clientData.address || null,
          notes: clientData.notes || null,
          dataNascimento: clientData.data_nascimento || null,
          codigoAcesso: clientData.codigo_acesso || null,
          senhaGov: clientData.senha_gov || null,
          codigoRegularize: clientData.codigo_regularize || null,
          senhaNfse: clientData.senha_nfse || null,
          status: clientData.status === 'active' ? 'ACTIVE' : clientData.status === 'inactive' ? 'INACTIVE' : 'ACTIVE',
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Falha ao criar cliente')
      }
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY })
      show('Cliente criado com sucesso!', 'success')
    },
    onError: (error: Error) => {
      show(`Erro ao criar cliente: ${error.message}`, 'error')
    }
  })

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateClientData }) => {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          cpf: (data as any).cpf,
          cnpj: (data as any).cnpj,
          phone: data.phone,
          address: data.address,
          notes: data.notes,
          dataNascimento: (data as any).data_nascimento,
          codigoAcesso: (data as any).codigo_acesso,
          senhaGov: (data as any).senha_gov,
          codigoRegularize: (data as any).codigo_regularize,
          senhaNfse: (data as any).senha_nfse,
          status: data.status === 'active' ? 'ACTIVE' : data.status === 'inactive' ? 'INACTIVE' : undefined
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Falha ao atualizar cliente')
      }
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY })
      show('Cliente atualizado com sucesso!', 'success')
    },
    onError: (error: Error) => {
      show(`Erro ao atualizar cliente: ${error.message}`, 'error')
    }
  })

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Falha ao remover cliente')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY })
      show('Cliente removido com sucesso!', 'success')
    },
    onError: (error: Error) => {
      show(`Erro ao remover cliente: ${error.message}`, 'error')
    }
  })

  const searchClients = async (query: string): Promise<void> => {
    try {
      const params = new URLSearchParams({ search: query })
      const res = await fetch(`/api/clients?${params.toString()}`)
      if (!res.ok) throw new Error('Falha ao buscar clientes')
      const data = await res.json()
      queryClient.setQueryData(CLIENTS_QUERY_KEY, data)
    } catch (error) {
      show(`Erro ao buscar clientes: ${(error as Error).message}`, 'error')
    }
  }

  const invalidateCache = (): void => {
    queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY })
  }

  const getClientById = (id: string): Client | undefined => {
    return clients.find((client: Client) => client.id === id)
  }

  const getClientsByServiceType = (_serviceType: 'monthly' | 'annual' | 'irpf'): Client[] => {
    return clients
  }

  return {
    clients,
    loading: isLoading,
    error: error?.message || null,
    createClient: createClientMutation.mutateAsync,
    updateClient: (id: string, data: UpdateClientData) => updateClientMutation.mutateAsync({ id, data }),
    deleteClient: deleteClientMutation.mutateAsync,
    searchClients,
    invalidateCache,
    getClientById,
    getClientsByServiceType
  }
}
