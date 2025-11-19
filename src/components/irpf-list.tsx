import { useIrpfServices } from '@/hooks/use-irpf-services'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function IrpfList() {
  const [search, setSearch] = useState('')
  const { entries, loading, error } = useIrpfServices({ search })

  if (loading) return <div className="py-10 text-center">Carregando...</div>
  if (error) return <div className="py-10 text-center text-red-600">{error}</div>
  if (!entries.length) return <div className="py-10 text-center">Nenhuma entrada IRPF</div>

  return (
    <div className="rounded-md border p-4">
      <h2 className="text-lg font-semibold mb-2">IRPF</h2>
      <div className="mb-4 space-y-2">
        <Label htmlFor="search-irpf">Buscar</Label>
        <Input id="search-irpf" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome, CPF..." />
      </div>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Nome</th>
              <th className="px-4 py-2 text-left">CPF</th>
              <th className="px-4 py-2 text-left">Sequência</th>
              <th className="px-4 py-2 text-left">Ano</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e: any) => (
              <tr key={e.id} className="border-t">
                <td className="px-4 py-2">{e.name}</td>
                <td className="px-4 py-2">{e.cpf}</td>
                <td className="px-4 py-2">{e.sequenceNumber ?? '-'}</td>
                <td className="px-4 py-2">{e.year ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
