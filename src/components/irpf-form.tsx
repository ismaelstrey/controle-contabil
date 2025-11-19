import { useState, FormEvent } from 'react'
import { useIrpfServices } from '@/hooks/use-irpf-services'
import { useClients } from '@/hooks/use-clients'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function IrpfForm() {
  const { createIrpfEntry } = useIrpfServices()
  const { clients } = useClients()
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [sequenceNumber, setSequenceNumber] = useState('')
  const [clientId, setClientId] = useState('')
  const [year, setYear] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await createIrpfEntry({
      name,
      cpf,
      sequenceNumber: sequenceNumber ? Number(sequenceNumber) : undefined,
      clientId: clientId || undefined,
      year: year ? Number(year) : undefined
    })
    setLoading(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cpf">CPF</Label>
        <Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="seq">Sequência</Label>
        <Input id="seq" type="number" value={sequenceNumber} onChange={(e) => setSequenceNumber(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client-irpf">Cliente (opcional)</Label>
        <select id="client-irpf" className="w-full border rounded-md h-10 px-3" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">Sem vínculo</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="year">Ano</Label>
        <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025" />
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
    </form>
  )
}