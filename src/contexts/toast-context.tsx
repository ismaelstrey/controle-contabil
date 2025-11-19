'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ToastMessage } from '@/types'

interface ToastContextType {
  toasts: ToastMessage[]
  show: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  remove: (id: string) => void
  clear: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

let toastId = 0

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const show = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 5000): void => {
    const id = `toast-${++toastId}`
    const newToast: ToastMessage = {
      id,
      message,
      type,
      duration
    }

    setToasts(prev => [...prev, newToast])

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }
  }

  const success = (message: string, duration?: number): void => {
    show(message, 'success', duration)
  }

  const error = (message: string, duration?: number): void => {
    show(message, 'error', duration)
  }

  const warning = (message: string, duration?: number): void => {
    show(message, 'warning', duration)
  }

  const info = (message: string, duration?: number): void => {
    show(message, 'info', duration)
  }

  const remove = (id: string): void => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clear = (): void => {
    setToasts([])
  }

  const value: ToastContextType = {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToastContext deve ser usado dentro de um ToastProvider')
  }
  return context
}