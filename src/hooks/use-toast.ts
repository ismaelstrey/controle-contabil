'use client'

import { useToastContext } from '@/contexts/toast-context'

export const useToast = () => {
  return useToastContext()
}
