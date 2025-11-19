'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Theme = 'light' | 'dark'
export type Language = 'pt-BR' | 'en-US'

interface AppContextType {
  theme: Theme
  language: Language
  itemsPerPage: number
  dateFormat: string
  currencyFormat: string
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
  setItemsPerPage: (items: number) => void
  setDateFormat: (format: string) => void
  setCurrencyFormat: (format: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light')
  const [language, setLanguage] = useState<Language>('pt-BR')
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [dateFormat, setDateFormat] = useState<string>('dd/MM/yyyy')
  const [currencyFormat, setCurrencyFormat] = useState<string>('pt-BR')

  const value: AppContextType = {
    theme,
    language,
    itemsPerPage,
    dateFormat,
    currencyFormat,
    setTheme,
    setLanguage,
    setItemsPerPage,
    setDateFormat,
    setCurrencyFormat
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider')
  }
  return context
}