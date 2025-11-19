import { useClients } from '@/hooks/use-clients'

interface ClientDetailProps {
  clientId: string
}

export function ClientDetail({ clientId }: ClientDetailProps) {
  const { getClientById } = useClients()
  const client = getClientById(clientId)

  if (!client) {
    return <div className="py-10 text-center">Cliente não encontrado</div>
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border p-4">
        <h2 className="text-xl font-semibold">{client.name}</h2>
        <p className="text-sm text-gray-600">{client.email}</p>
        <p className="text-sm text-gray-600">{client.cpf_cnpj}</p>
      </div>
    </div>
  )
}
