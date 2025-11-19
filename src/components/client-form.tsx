import { useState, FormEvent } from 'react'
import { useClients } from '@/hooks/use-clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToastContext } from '@/contexts/toast-context'

interface ClientFormProps {
  onSuccess?: () => void
}

export function ClientForm({ onSuccess }: ClientFormProps) {
  const { createClient } = useClients()
  const { show } = useToastContext()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createClient({ name, email, cpf_cnpj: cpfCnpj })
      show('Cliente criado!', 'success')
      setName('')
      setEmail('')
      setCpfCnpj('')
      onSuccess?.()
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
      <div className="space-y-2">
        <Label htmlFor="cpf">CPF/CNPJ</Label>
        <Input id="cpf" value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
    </form>
  )
}
