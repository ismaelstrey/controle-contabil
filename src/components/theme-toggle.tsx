"use client"

import { Button } from '@/components/ui/button'
import { useAppContext } from '@/contexts/app-context'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useAppContext()
  const isDark = theme === 'dark'
  const toggle = () => setTheme(isDark ? 'light' : 'dark')

  return (
    <Button
      variant="secondary"
      size="sm"
      aria-label="Alternar tema"
      onClick={toggle}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}