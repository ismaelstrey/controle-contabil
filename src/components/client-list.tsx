import Link from 'next/link'
import { useClients } from '@/hooks/use-clients'
import { Button } from '@/components/ui/button'

export function ClientList() {
  const { clients, loading, error, deleteClient } = useClients()

  if (loading) {
    return <div className="py-10 text-center">Carregando...</div>
  }

  if (error) {
    return <div className="py-10 text-center text-red-600">{error}</div>
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
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
                <Link href={`/clients/${c.id}`} className="underline">Detalhes</Link>
                <Button variant="secondary" onClick={() => deleteClient(c.id)}>Remover</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
