import { useState, FormEvent } from 'react'
import { useAnnualServices } from '@/hooks/use-annual-services'
import { useClients } from '@/hooks/use-clients'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props { onSuccess?: () => void }
export function AnnualServiceForm({ onSuccess }: Props) {
  const { createAnnualService } = useAnnualServices()
  const { clients } = useClients()
  const [clientId, setClientId] = useState('')
  const [type, setType] = useState('')
  const [observation, setObservation] = useState('')
  const [year, setYear] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await createAnnualService({ clientId, type, observation, year: year ? Number(year) : undefined })
    setClientId('')
    setType('')
    setObservation('')
    setYear('')
    onSuccess?.()
    setLoading(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="client-annual">Cliente</Label>
        <select id="client-annual" className="w-full border rounded-md h-10 px-3" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
          <option value="">Selecione um cliente</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Input id="type" value={type} onChange={(e) => setType(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="obs">Observação</Label>
        <Input id="obs" value={observation} onChange={(e) => setObservation(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="year">Ano</Label>
        <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025" />
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
    </form>
  )
}
