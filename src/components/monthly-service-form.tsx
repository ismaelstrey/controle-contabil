import { useState, FormEvent } from 'react'
import { useMonthlyServices } from '@/hooks/use-monthly-services'
import { useClients } from '@/hooks/use-clients'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props { onSuccess?: () => void }
export function MonthlyServiceForm({ onSuccess }: Props) {
  const { createMonthlyService } = useMonthlyServices()
  const { clients } = useClients()
  const [clientId, setClientId] = useState('')
  const [tipoGuia, setTipoGuia] = useState('')
  const [regularizacao, setRegularizacao] = useState('')
  const [situacao, setSituacao] = useState('')
  const [referenceMonth, setReferenceMonth] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await createMonthlyService({ clientId, tipoGuia, regularizacao, situacao, referenceMonth })
    setClientId('')
    setTipoGuia('')
    setRegularizacao('')
    setSituacao('')
    setReferenceMonth('')
    onSuccess?.()
    setLoading(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="client">Cliente</Label>
        <select id="client" className="w-full border rounded-md h-10 px-3" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
          <option value="">Selecione um cliente</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo de Guia</Label>
        <Input id="tipo" value={tipoGuia} onChange={(e) => setTipoGuia(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg">Regularização</Label>
        <Input id="reg" value={regularizacao} onChange={(e) => setRegularizacao(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sit">Situação</Label>
        <Input id="sit" value={situacao} onChange={(e) => setSituacao(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ref">Mês de Referência (YYYY-MM)</Label>
        <Input id="ref" value={referenceMonth} onChange={(e) => setReferenceMonth(e.target.value)} placeholder="2025-03" />
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
    </form>
  )
}