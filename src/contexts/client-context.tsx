'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Client, ClientFilters, SortOption } from '@/types'

interface ClientContextType {
  selectedClient: Client | null
  filters: ClientFilters
  sortBy: SortOption
  setSelectedClient: (client: Client | null) => void
  setFilters: (filters: ClientFilters) => void
  setSortBy: (sort: SortOption) => void
  clearFilters: () => void
  resetSelection: () => void
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

interface ClientProviderProps {
  children: ReactNode
}

const DEFAULT_FILTERS: ClientFilters = {
  search: '',
  status: 'all',
  service_type: 'all'
}

const DEFAULT_SORT: SortOption = {
  field: 'name',
  direction: 'asc'
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [filters, setFilters] = useState<ClientFilters>(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState<SortOption>(DEFAULT_SORT)

  const clearFilters = (): void => {
    setFilters(DEFAULT_FILTERS)
  }

  const resetSelection = (): void => {
    setSelectedClient(null)
  }

  const value: ClientContextType = {
    selectedClient,
    filters,
    sortBy,
    setSelectedClient,
    setFilters,
    setSortBy,
    clearFilters,
    resetSelection
  }

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  )
}

export const useClientContext = (): ClientContextType => {
  const context = useContext(ClientContext)
  if (context === undefined) {
    throw new Error('useClientContext deve ser usado dentro de um ClientProvider')
  }
  return context
}