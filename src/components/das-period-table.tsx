'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToastContext } from '@/contexts/toast-context'

interface Props {
  periods: any[]
}

export function DasPeriodTable({ periods }: Props) {
  const { show } = useToastContext()
  const [year, setYear] = useState('')
  const [situation, setSituation] = useState('')
  const [search, setSearch] = useState('')

  const years = useMemo(() => {
    const set = new Set<string>()
    periods.forEach((p: any) => {
      const y = String(p.periodo || '').slice(0, 4)
      if (y) set.add(y)
    })
    return Array.from(set).sort()
  }, [periods])

  const situations = useMemo(() => {
    const set = new Set<string>()
    periods.forEach((p: any) => {
      const s = String(p.situacao || '').trim()
      if (s) set.add(s)
    })
    return Array.from(set).sort()
  }, [periods])

  const filtered = useMemo(() => {
    let data = periods
    if (year) data = data.filter((p: any) => String(p.periodo || '').startsWith(year))
    if (situation) data = data.filter((p: any) => String(p.situacao || '') === situation)
    if (search) {
      const s = search.toLowerCase()
      data = data.filter((p: any) =>
        String(p.numeroDas || '').toLowerCase().includes(s) ||
        String(p.codigoBarras || '').toLowerCase().includes(s) ||
        String(p.urlDas || '').toLowerCase().includes(s)
      )
    }
    return data
  }, [periods, year, situation, search])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      show('Copiado para a área de transferência', 'success')
    } catch {
      show('Falha ao copiar', 'error')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Ano</Label>
          <select id="year" className="w-full border rounded-md h-10 px-3" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Todos</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sit">Situação</Label>
          <select id="sit" className="w-full border rounded-md h-10 px-3" value={situation} onChange={(e) => setSituation(e.target.value)}>
            <option value="">Todas</option>
            {situations.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="search">Buscar</Label>
          <Input id="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Número DAS, código de barras, URL" />
        </div>
      </div>

      <div className="rounded-md border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Período</th>
              <th className="px-4 py-2 text-left">Situação</th>
              <th className="px-4 py-2 text-left">Principal</th>
              <th className="px-4 py-2 text-left">Multas</th>
              <th className="px-4 py-2 text-left">Juros</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Vencimento</th>
              <th className="px-4 py-2 text-left">DAS</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2">{p.periodo}</td>
                <td className="px-4 py-2">{p.situacao || '-'}</td>
                <td className="px-4 py-2">{p.principal ?? '-'}</td>
                <td className="px-4 py-2">{p.multas ?? '-'}</td>
                <td className="px-4 py-2">{p.juros ?? '-'}</td>
                <td className="px-4 py-2">{p.total ?? '-'}</td>
                <td className="px-4 py-2">{p.dataVencimento ? new Date(p.dataVencimento).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-2"><a className="underline" href={p.urlDas || '#'} target="_blank" rel="noreferrer">Abrir</a></td>
                <td className="px-4 py-2 flex gap-2">
                  <Button variant="secondary" onClick={() => copyToClipboard(String(p.codigoBarras || ''))} disabled={!p.codigoBarras}>Copiar código</Button>
                  <Button variant="secondary" onClick={() => copyToClipboard(String(p.numeroDas || ''))} disabled={!p.numeroDas}>Copiar número</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}