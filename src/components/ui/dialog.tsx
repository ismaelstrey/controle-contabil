import { ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Button } from './button'
import { X } from 'lucide-react'

type DialogSize = 'sm' | 'md' | 'lg'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  size?: DialogSize
  actions?: ReactNode
  children: ReactNode
}

export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export function Dialog({ open, onOpenChange, title, size = 'md', actions, children }: DialogProps) {
  const sizeClass = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg'
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content className="fixed inset-0 z-50 flex items-center justify-center">
          <div className={`relative bg-card rounded-lg shadow-lg w-full ${sizeClass} p-6`}>
            <div className="flex justify-between items-center mb-4">
              {title ? (
                <DialogPrimitive.Title className="text-xl font-semibold">{title}</DialogPrimitive.Title>
              ) : (
                <span></span>
              )}
              <DialogPrimitive.Close asChild>
                <Button variant="secondary">
                  <X className="mr-2 h-4 w-4" />
                  Fechar
                </Button>
              </DialogPrimitive.Close>
            </div>
            {children}
            {actions && (
              <div className="mt-6 flex justify-end gap-2">
                {actions}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
