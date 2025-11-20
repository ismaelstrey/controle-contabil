import { useState, FormEvent } from 'react'
import { useClients } from '@/hooks/use-clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToastContext } from '@/contexts/toast-context'
import { digitsOnly } from '@/lib/doc-validation'

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
  const [phone, setPhone] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [senhaGov, setSenhaGov] = useState('')
  const [codigoAcesso, setCodigoAcesso] = useState('')
  const [senhaNfse, setSenhaNfse] = useState('')
  const [codigoRegularize, setCodigoRegularize] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const maskCpf = (v: string) => {
    const d = digitsOnly(v).slice(0, 11)
    if (!d) return ''
    const part = d.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_m, a, b, c, d2) => `${a}.${b}.${c}${d2 ? '-' + d2 : ''}`)
    return part
  }
  const maskCnpj = (v: string) => {
    const d = digitsOnly(v).slice(0, 14)
    if (!d) return ''
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, (_m, a, b, c, d2, e) => `${a}.${b}.${c}/${d2}${e ? '-' + e : ''}`)
  }
  const maskPhone = (v: string) => {
    const d = digitsOnly(v).slice(0, 11)
    if (!d) return ''
    return d.replace(/(\d{2})(\d{5})(\d{4})/, (_m, a, b, c) => `(${a}) ${b}-${c}`)
  }
  const maskCep = (v: string) => {
    const d = digitsOnly(v).slice(0, 8)
    if (!d) return ''
    return d.replace(/(\d{5})(\d{3})/, (_m, a, b) => `${a}-${b}`)
  }

  const isEmailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  const isCpfValid = (v: string) => digitsOnly(v).length === 11
  const isCnpjValid = (v: string) => !v || digitsOnly(v).length === 14
  const isPhoneValid = (v: string) => !v || digitsOnly(v).length >= 10
  const isZipValid = (v: string) => !v || digitsOnly(v).length === 8

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!name || !email || !cpf) throw new Error('Preencha nome, e-mail e CPF')
      if (!isEmailValid(email)) throw new Error('E-mail inválido')
      if (!isCpfValid(cpf)) throw new Error('CPF inválido')
      if (cnpj && !isCnpjValid(cnpj)) throw new Error('CNPJ inválido')
      if (phone && !isPhoneValid(phone)) throw new Error('Telefone inválido')
      if (zipCode && !isZipValid(zipCode)) throw new Error('CEP inválido')
      const address = street || number || complement || city || state || zipCode ? {
        street,
        number,
        complement: complement || undefined,
        neighborhood: '',
        city,
        state,
        zip_code: zipCode,
      } : undefined
      if (clientId) {
        await updateClient(clientId, {
          name,
          email,
          cpf,
          cnpj: cnpj || undefined,
          phone: phone || undefined,
          address,
          notes: notes || undefined,
          status,
          data_nascimento: dataNascimento || undefined,
          codigo_acesso: codigoAcesso || undefined,
          senha_gov: senhaGov || undefined,
          codigo_regularize: codigoRegularize || undefined,
          senha_nfse: senhaNfse || undefined,
        } as any)
        onSuccess?.()
      } else {
        await createClient({
          name,
          email,
          cpf,
          cnpj: cnpj || undefined,
          phone: phone || undefined,
          address,
          notes: notes || undefined,
          status,
          data_nascimento: dataNascimento || undefined,
          codigo_acesso: codigoAcesso || undefined,
          senha_gov: senhaGov || undefined,
          codigo_regularize: codigoRegularize || undefined,
          senha_nfse: senhaNfse || undefined,
        })
        show('Cliente criado!', 'success')
        setName('')
        setEmail('')
        setCpf('')
        setCnpj('')
        setPhone('')
        setDataNascimento('')
        setStreet('')
        setNumber('')
        setComplement('')
        setCity('')
        setState('')
        setZipCode('')
        setSenhaGov('')
        setCodigoAcesso('')
        setSenhaNfse('')
        setCodigoRegularize('')
        setStatus('active')
        setNotes('')
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
          <Input id="cpf" value={maskCpf(cpf)} onChange={(e) => setCpf(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input id="cnpj" value={maskCnpj(cnpj)} onChange={(e) => setCnpj(e.target.value)} disabled={Boolean(digitsOnly(cpf))} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" value={maskPhone(phone)} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nascimento">Data de Nascimento</Label>
          <Input id="nascimento" type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Endereço</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Rua" value={street} onChange={(e) => setStreet(e.target.value)} />
          <Input placeholder="Número" value={number} onChange={(e) => setNumber(e.target.value)} />
          <Input placeholder="Complemento" value={complement} onChange={(e) => setComplement(e.target.value)} />
          <Input placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input placeholder="Estado" value={state} onChange={(e) => setState(e.target.value)} />
          <Input placeholder="CEP" value={maskCep(zipCode)} onChange={(e) => setZipCode(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="senha_gov">Senha Gov</Label>
          <Input id="senha_gov" type="password" value={senhaGov} onChange={(e) => setSenhaGov(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="codigo_acesso">Código de Acesso</Label>
          <Input id="codigo_acesso" value={codigoAcesso} onChange={(e) => setCodigoAcesso(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="senha_nfse">Senha NFSe</Label>
          <Input id="senha_nfse" value={senhaNfse} onChange={(e) => setSenhaNfse(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="codigo_regularize">Código Regularize</Label>
          <Input id="codigo_regularize" value={codigoRegularize} onChange={(e) => setCodigoRegularize(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" className="border rounded h-10 px-3" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <textarea id="notes" className="border rounded w-full p-2" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : clientId ? 'Atualizar' : 'Salvar'}</Button>
    </form>
  )
}
