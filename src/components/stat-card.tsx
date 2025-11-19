'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: number | string
  icon?: ReactNode
  delta?: string
}

export function StatCard({ title, value, icon, delta }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">{title}</div>
            <div className="text-2xl font-semibold">{value}</div>
            {delta && <div className="text-xs text-muted-foreground mt-1">{delta}</div>}
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
