import { useIrpfServices } from '@/hooks/use-irpf-services'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { IrpfServiceForm } from '@/components/irpf-service-form'

export function IrpfServiceList() {
  const [search, setSearch] = useState('')
  const { entries, loading, error, deleteIrpfEntry } = useIrpfServices({ search })
  const [editingId, setEditingId] = useState<string | null>(null)
  const entryToEdit = editingId ? entries.find((e: any) => e.id === editingId) : null

  if (loading) return <div className="py-10 text-center">Carregando...</div>
  if (error) return <div className="py-10 text-center text-red-600">{error}</div>
  if (!entries.length) return <div className="py-10 text-center">Nenhuma entrada IRPF</div>

  return (
    <div className="rounded-md border p-4">
      <h2 className="text-lg font-semibold mb-2">IRPF</h2>
      <div className="mb-4 space-y-2">
        <Label htmlFor="search-irpf">Buscar</Label>
        <Input id="search-irpf" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome, CPF, cliente, ano..." />
      </div>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Nome</th>
              <th className="px-4 py-2 text-left">CPF</th>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-left">Nº Sequência</th>
              <th className="px-4 py-2 text-left">Ano</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e: any) => (
              <tr key={e.id} className="border-t">
                <td className="px-4 py-2">{e.name || '-'}</td>
                <td className="px-4 py-2">{e.cpf || '-'}</td>
                <td className="px-4 py-2">{e.client?.name || '-'}</td>
                <td className="px-4 py-2">{e.sequenceNumber ?? '-'}</td>
                <td className="px-4 py-2">{e.year ?? '-'}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button size="sm" onClick={() => setEditingId(e.id)}>Editar</Button>
                  <Button variant="secondary" size="sm" onClick={() => deleteIrpfEntry(e.id)}>Remover</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog
        open={Boolean(editingId && entryToEdit)}
        onOpenChange={(o) => { if (!o) setEditingId(null) }}
        title="Editar IRPF"
      >
        {entryToEdit && (
          <IrpfServiceForm
            entryId={entryToEdit.id}
            initialValues={{
              name: entryToEdit.name,
              cpf: entryToEdit.cpf,
              sequenceNumber: entryToEdit.sequenceNumber,
              clientId: entryToEdit.clientId || entryToEdit.client?.id || '',
              year: entryToEdit.year,
            }}
            onSuccess={() => setEditingId(null)}
          />
        )}
      </Dialog>
    </div>
  )
}
