import { useState, FormEvent } from 'react'
import { useIrpfServices } from '@/hooks/use-irpf-services'
import { useClients } from '@/hooks/use-clients'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props {
  onSuccess?: () => void
  entryId?: string
  initialValues?: { name?: string; cpf?: string; sequenceNumber?: number; clientId?: string; year?: number }
}

export function IrpfServiceForm({ onSuccess, entryId, initialValues }: Props) {
  const { createIrpfEntry, updateIrpfEntry } = useIrpfServices()
  const { clients } = useClients()
  const [name, setName] = useState(initialValues?.name ?? '')
  const [cpf, setCpf] = useState(initialValues?.cpf ?? '')
  const [sequenceNumber, setSequenceNumber] = useState(initialValues?.sequenceNumber ? String(initialValues.sequenceNumber) : '')
  const [clientId, setClientId] = useState(initialValues?.clientId ?? '')
  const [year, setYear] = useState(initialValues?.year ? String(initialValues.year) : '')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (entryId) {
      await updateIrpfEntry(entryId, {
        name,
        cpf,
        sequenceNumber: sequenceNumber ? Number(sequenceNumber) : undefined,
        clientId,
        year: year ? Number(year) : undefined,
      })
      onSuccess?.()
    } else {
      await createIrpfEntry({
        name,
        cpf,
        sequenceNumber: sequenceNumber ? Number(sequenceNumber) : undefined,
        clientId,
        year: year ? Number(year) : undefined,
      })
      setName('')
      setCpf('')
      setSequenceNumber('')
      setClientId('')
      setYear('')
      onSuccess?.()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name-irpf">Nome</Label>
        <Input id="name-irpf" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cpf-irpf">CPF</Label>
        <Input id="cpf-irpf" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="seq-irpf">Nº Sequência</Label>
        <Input id="seq-irpf" type="number" value={sequenceNumber} onChange={(e) => setSequenceNumber(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client-irpf">Cliente</Label>
        <select id="client-irpf" className="w-full border rounded-md h-10 px-3" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">Sem vínculo</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="year-irpf">Ano</Label>
        <Input id="year-irpf" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025" />
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : entryId ? 'Atualizar' : 'Salvar'}</Button>
    </form>
  )
}