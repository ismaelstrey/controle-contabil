import { useAnnualServices } from '@/hooks/use-annual-services'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AnnualServiceList() {
  const [search, setSearch] = useState('')
  const { services, loading, error } = useAnnualServices({ search })

  if (loading) return <div className="py-10 text-center">Carregando...</div>
  if (error) return <div className="py-10 text-center text-red-600">{error}</div>
  if (!services.length) return <div className="py-10 text-center">Nenhum serviço anual</div>

  return (
    <div className="rounded-md border p-4">
      <h2 className="text-lg font-semibold mb-2">Serviços Anuais</h2>
      <div className="mb-4 space-y-2">
        <Label htmlFor="search-annual">Buscar</Label>
        <Input id="search-annual" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cliente, tipo, observação..." />
      </div>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Observação</th>
              <th className="px-4 py-2 text-left">Ano</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s: any) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-2">{s.client?.name || '-'}</td>
                <td className="px-4 py-2">{s.type || '-'}</td>
                <td className="px-4 py-2">{s.observation || '-'}</td>
                <td className="px-4 py-2">{s.year ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
