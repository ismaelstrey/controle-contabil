'use client'

import { useToastContext } from '@/contexts/toast-context'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { useEffect } from 'react'

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const toastColors = {
  success: 'bg-card text-foreground border-l-2 border-green-500',
  error: 'bg-card text-foreground border-l-2 border-red-500',
  warning: 'bg-card text-foreground border-l-2 border-yellow-500',
  info: 'bg-card text-foreground border-l-2 border-blue-500'
}

export function ToastContainer() {
  const { toasts, remove } = useToastContext()

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        remove(toasts[0].id)
      }, toasts[0].duration)

      return () => clearTimeout(timer)
    }
  }, [toasts, remove])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type]
        
        return (
          <div
            key={toast.id}
            className={`flex items-center p-4 rounded-lg border shadow-lg min-w-[300px] ${toastColors[toast.type]}`}
          >
            <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => remove(toast.id)}
              className="ml-3 p-1 rounded-full hover:bg-foreground/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}