'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToastContext } from '@/contexts/toast-context'

export function BackupPanel() {
  const { show } = useToastContext()
  const [maskSensitive, setMaskSensitive] = useState(true)
  const [mode, setMode] = useState<'merge' | 'replace'>('merge')
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const doExport = async () => {
    try {
      const res = await fetch(`/api/backup/export?maskSensitive=${maskSensitive ? 'true' : 'false'}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Falha ao exportar backup')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-${new Date().toISOString().slice(0,10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      show('Backup exportado com sucesso!', 'success')
    } catch (e: any) {
      show(e.message || 'Erro ao exportar backup', 'error')
    }
  }

  const doImport = async () => {
    try {
      const file = fileRef.current?.files?.[0]
      if (!file) {
        show('Selecione um arquivo JSON', 'warning')
        return
      }
      setImporting(true)
      const text = await file.text()
      const json = JSON.parse(text)
      const res = await fetch('/api/backup/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, version: json?.version || 1, data: json?.data || json })
      })
      const out = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(out.error || 'Falha ao importar backup')
      show('Backup importado com sucesso!', 'success')
      setImporting(false)
    } catch (e: any) {
      show(e.message || 'Erro ao importar backup', 'error')
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Backup</h2>
        <p className="text-sm text-muted-foreground">Exporte e importe seus dados em formato JSON.</p>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <input id="mask" type="checkbox" checked={maskSensitive} onChange={(e) => setMaskSensitive(e.target.checked)} />
          <Label htmlFor="mask">Mascarar dados sensíveis (passwordHash)</Label>
        </div>
        <Button onClick={doExport}>Exportar Backup</Button>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mode">Modo de importação</Label>
          <select id="mode" className="w-full border rounded-md h-10 px-3" value={mode} onChange={(e) => setMode(e.target.value as any)}>
            <option value="merge">Mesclar (upsert)</option>
            <option value="replace">Substituir (apagar e recriar)</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="file">Arquivo JSON</Label>
          <Input id="file" type="file" ref={fileRef as any} accept="application/json" />
        </div>
        <Button onClick={doImport} disabled={importing}>{importing ? 'Importando...' : 'Importar Backup'}</Button>
      </div>
    </div>
  )
}