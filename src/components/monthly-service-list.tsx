import { useMonthlyServices } from '@/hooks/use-monthly-services'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function MonthlyServiceList() {
  const [search, setSearch] = useState('')
  const { services, loading, error } = useMonthlyServices({ search })

  if (loading) return <div className="py-10 text-center">Carregando...</div>
  if (error) return <div className="py-10 text-center text-red-600">{error}</div>
  if (!services.length) return <div className="py-10 text-center">Nenhum serviço mensal</div>

  return (
    <div className="rounded-md border p-4">
      <h2 className="text-lg font-semibold mb-2">Serviços Mensais</h2>
      <div className="mb-4 space-y-2">
        <Label htmlFor="search">Buscar</Label>
        <Input id="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cliente, guia, situação..." />
      </div>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-left">Tipo de Guia</th>
              <th className="px-4 py-2 text-left">Regularização</th>
              <th className="px-4 py-2 text-left">Situação</th>
              <th className="px-4 py-2 text-left">Referência</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s: any) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-2">{s.client?.name || '-'}</td>
                <td className="px-4 py-2">{s.tipoGuia || '-'}</td>
                <td className="px-4 py-2">{s.regularizacao || '-'}</td>
                <td className="px-4 py-2">{s.situacao || '-'}</td>
                <td className="px-4 py-2">{s.referenceMonth || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
