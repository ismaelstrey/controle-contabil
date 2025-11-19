import { useAnnualServices } from '@/hooks/use-annual-services'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { AnnualServiceForm } from '@/components/annual-service-form'

export function AnnualServiceList() {
  const [search, setSearch] = useState('')
  const { services, loading, error, deleteAnnualService } = useAnnualServices({ search })
  const [editingId, setEditingId] = useState<string | null>(null)
  const serviceToEdit = editingId ? services.find((s: any) => s.id === editingId) : null

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
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s: any) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-2">{s.client?.name || '-'}</td>
                <td className="px-4 py-2">{s.type || '-'}</td>
                <td className="px-4 py-2">{s.observation || '-'}</td>
                <td className="px-4 py-2">{s.year ?? '-'}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button size="sm" onClick={() => setEditingId(s.id)}>Editar</Button>
                  <Button variant="secondary" size="sm" onClick={() => deleteAnnualService(s.id)}>Remover</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog
        open={Boolean(editingId && serviceToEdit)}
        onOpenChange={(o) => { if (!o) setEditingId(null) }}
        title="Editar Serviço Anual"
      >
        {serviceToEdit && (
          <AnnualServiceForm
            serviceId={serviceToEdit.id}
            initialValues={{
              clientId: serviceToEdit.clientId || serviceToEdit.client?.id || '',
              type: serviceToEdit.type,
              observation: serviceToEdit.observation,
              year: serviceToEdit.year,
            }}
            onSuccess={() => setEditingId(null)}
          />
        )}
      </Dialog>
    </div>
  )
}
