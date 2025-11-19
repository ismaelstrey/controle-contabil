'use client'

import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  value: string
  setValue: (v: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string
}

export function Tabs({ defaultValue, className, children }: TabsProps) {
  const [value, setValue] = useState(defaultValue)
  return (
    <div className={cn('w-full', className)}>
      <TabsContext.Provider value={{ value, setValue }}>
        {children}
      </TabsContext.Provider>
    </div>
  )
}

export function TabsList({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center gap-2 border-b', className)} role="tablist">
      {children}
    </div>
  )
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  tone?: 'green' | 'indigo' | 'amber' | 'tomato'
}

export function TabsTrigger({ value, tone = 'indigo', className, children, ...props }: TabsTriggerProps) {
  const ctx = useContext(TabsContext)
  if (!ctx) return null
  const active = ctx.value === value
  const toneClasses = {
    green: {
      active: 'border-green-600 text-green-600',
      hover: 'hover:text-green-700 hover:border-green-600'
    },
    indigo: {
      active: 'border-indigo-600 text-indigo-600',
      hover: 'hover:text-indigo-700 hover:border-indigo-600'
    },
    amber: {
      active: 'border-amber-600 text-amber-600',
      hover: 'hover:text-amber-700 hover:border-amber-600'
    },
    tomato: {
      active: 'border-tomato-600 text-tomato-600',
      hover: 'hover:text-tomato-700 hover:border-tomato-600'
    }
  }[tone]
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => ctx.setValue(value)}
      className={cn(
        'group px-4 py-2 text-sm transition-colors',
        active ? `border-b-2 ${toneClasses.active}` : `text-muted-foreground hover:border-b-2 ${toneClasses.hover}`,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const ctx = useContext(TabsContext)
  if (!ctx) return null
  const active = ctx.value === value
  if (!active) return null
  return (
    <div role="tabpanel" className={cn('pt-4', className)}>
      {children}
    </div>
  )
}
