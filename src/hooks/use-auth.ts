'use client'

import { useAuthContext } from '@/contexts/auth-context'

export interface UseAuthReturn {
  user: any | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (email: string, password: string, metadata: any) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: any) => Promise<void>
}

export const useAuth = (): UseAuthReturn => {
  const { user, loading, signIn, signOut, signUp, resetPassword, updateProfile } = useAuthContext()
  return {
    user,
    loading,
    error: null,
    signIn,
    signOut,
    signUp,
    resetPassword,
    updateProfile
  }
}
