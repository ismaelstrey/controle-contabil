'use client'

import Link from 'next/link'
import { ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuthContext } from '@/contexts/auth-context'
import { Menu, X } from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuthContext()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <header className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-semibold">ContabilJaque</Link>
          <div className="flex items-center gap-3 md:hidden">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button variant="secondary" onClick={() => setOpen(!open)} aria-label="Abrir menu">
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
     
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button onClick={signOut}>Sair</Button>
          </div>
        </div>
        {open && (
          <div className="md:hidden border-t bg-white">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-2">
           <Button onClick={signOut}>Sair</Button>
            </div>
          </div>
        )}
      </header>
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
