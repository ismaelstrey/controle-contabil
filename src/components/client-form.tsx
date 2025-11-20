import { useState, FormEvent } from 'react'
import { useClients } from '@/hooks/use-clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToastContext } from '@/contexts/toast-context'

interface ClientFormProps {
  onSuccess?: () => void
  clientId?: string
  initialValues?: {
    name?: string
    email?: string
    cpf?: string
    cnpj?: string
    cpf_cnpj?: string
  }
}

export function ClientForm({ onSuccess, clientId, initialValues }: ClientFormProps) {
  const { createClient, updateClient } = useClients()
  const { show } = useToastContext()
  const [name, setName] = useState(initialValues?.name ?? '')
  const [email, setEmail] = useState(initialValues?.email ?? '')
  const [cpf, setCpf] = useState(initialValues?.cpf ?? '')
  const [cnpj, setCnpj] = useState(initialValues?.cnpj ?? '')
  const [legacy, setLegacy] = useState(initialValues?.cpf_cnpj ?? '')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (clientId) {
        await updateClient(clientId, { name, email, cpf: cpf || undefined, cnpj: cnpj || undefined, cpf_cnpj: legacy || undefined } as any)
        onSuccess?.()
      } else {
        await createClient({ name, email, cpf: cpf || undefined, cnpj: cnpj || undefined, cpf_cnpj: legacy || undefined })
        show('Cliente criado!', 'success')
        setName('')
        setEmail('')
        setCpf('')
        setCnpj('')
        setLegacy('')
        onSuccess?.()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar cliente'
      show(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cpf_cnpj">CPF/CNPJ (legado)</Label>
        <Input id="cpf_cnpj" value={legacy} onChange={(e) => setLegacy(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : clientId ? 'Atualizar' : 'Salvar'}</Button>
    </form>
  )
}
