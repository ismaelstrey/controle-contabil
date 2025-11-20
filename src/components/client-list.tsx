import { useState } from 'react'
import { useClients } from '@/hooks/use-clients'
import { Button } from '@/components/ui/button'
import { ClientForm } from '@/components/client-form'
import { Dialog } from '@/components/ui/dialog'

export function ClientList() {
  const { clients, loading, error, deleteClient } = useClients()
  const [editingId, setEditingId] = useState<string | null>(null)
  const clientToEdit = editingId ? clients.find((cl) => cl.id === editingId) : null

  if (loading) {
    return <div className="py-10 text-center">Carregando...</div>
  }

  if (error) {
    return <div className="py-10 text-center text-red-600">{error}</div>
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-2 text-left">Nome</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="px-4 py-2">{c.name}</td>
              <td className="px-4 py-2">{c.email}</td>
              <td className="px-4 py-2 flex gap-2">
                <Button size="sm" onClick={() => setEditingId(c.id)}>Editar</Button>
                <Button variant="secondary" size="sm" onClick={() => deleteClient(c.id)}>Remover</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog
        open={Boolean(editingId && clientToEdit)}
        onOpenChange={(o) => {
          if (!o) setEditingId(null)
        }}
        title="Editar Cliente"
      >
        {clientToEdit && (
          <ClientForm
            clientId={clientToEdit.id}
            initialValues={{ name: clientToEdit.name, email: clientToEdit.email, cpf: clientToEdit.cpf, cnpj: clientToEdit.cnpj }}
            onSuccess={() => setEditingId(null)}
          />
        )}
      </Dialog>
    </div>
  )
}
