'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (email: string, password: string, metadata: any) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Try to use toast, but don't fail if ToastProvider is not available
  let show: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void = () => {}
  try {
    const toast = useToast()
    show = toast.show
  } catch (error) {
    // ToastProvider not available, use console instead
    show = (message: string, type?: 'success' | 'error' | 'warning' | 'info') => {
      console.log(`[${type || 'info'}] ${message}`)
    }
  }

  useEffect(() => {
    // Verificar sessão atual
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const u = await res.json()
          setUser(u)
        } else {
          setUser(null)
        }
      } catch (_e) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    const interval = setInterval(checkSession, 60000)
    return () => clearInterval(interval)
  }, [])

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Falha ao fazer login')
      }
      const u = await res.json()
      setUser(u)
      show('Login realizado com sucesso!', 'success')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login'
      show(errorMessage, 'error')
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (!res.ok) throw new Error('Falha ao fazer logout')
      setUser(null)
      show('Logout realizado com sucesso!', 'success')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer logout'
      show(errorMessage, 'error')
      throw error
    }
  }

  const signUp = async (email: string, password: string, metadata: any): Promise<void> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: metadata?.name || '' })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Falha ao criar conta')
      }
      const u = await res.json()
      setUser(u)
      show('Cadastro realizado com sucesso!', 'success')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta'
      show(errorMessage, 'error')
      throw error
    }
  }

  const resetPassword = async (_email: string): Promise<void> => {
    show('Recuperação de senha não suportada nesta versão', 'warning')
  }

  const updateProfile = async (data: any): Promise<void> => {
    try {
      if (!user) throw new Error('Usuário não autenticado')
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name })
      })
      if (!res.ok) throw new Error('Falha ao atualizar perfil')
      setUser({ ...user, name: data.name })
      show('Perfil atualizado com sucesso!', 'success')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar perfil'
      show(errorMessage, 'error')
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    signIn,
    signOut,
    signUp,
    resetPassword,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthProvider')
  }
  return context
}
