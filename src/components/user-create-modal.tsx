import { useEffect, useMemo, useRef, useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToastContext } from '@/contexts/toast-context'

function digitsOnly(v: unknown): string { return String(v || '').replace(/\D/g, '') }
function maskPhone(v: string): string {
  const d = digitsOnly(v).slice(0, 11)
  if (!d) return ''
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, (_m, a, b, c) => `(${a}) ${b}${c ? '-' + c : ''}`)
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, (_m, a, b, c) => `(${a}) ${b}${c ? '-' + c : ''}`)
}
function maskCep(v: string): string {
  const d = digitsOnly(v).slice(0, 8)
  if (!d) return ''
  return d.replace(/(\d{5})(\d{0,3})/, (_m, a, b) => (b ? `${a}-${b}` : a))
}
function isEmailValid(e: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UserCreateModal({ open, onOpenChange, onSuccess }: Props) {
  const { show } = useToastContext()
  const [step, setStep] = useState(1)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const streetRef = useRef<HTMLInputElement | null>(null)
  const passwordRef = useRef<HTMLInputElement | null>(null)

  // Step 1
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Step 2
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [birth, setBirth] = useState('')

  // Step 3
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setStep(1)
      setName(''); setEmail(''); setPhone('')
      setStreet(''); setNumber(''); setComplement(''); setCity(''); setState(''); setZip(''); setBirth('')
      setPassword(''); setRole('user'); setLoading(false)
      return
    }
    const focusEl = step === 1 ? nameRef.current : step === 2 ? streetRef.current : passwordRef.current
    focusEl?.focus()
  }, [open, step])

  const step1Valid = useMemo(() => name.trim().length > 0 && isEmailValid(email) && (phone ? digitsOnly(phone).length >= 10 : true), [name, email, phone])
  const step2Valid = useMemo(() => (zip ? digitsOnly(zip).length === 8 : true), [zip])
  const step3Valid = useMemo(() => password.length >= 6 && !!role, [password, role])

  const canNext = (s: number) => (s === 1 ? step1Valid : s === 2 ? step2Valid : true)

  const onSubmit = async () => {
    if (!step3Valid) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: role.toUpperCase() })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Falha ao criar usuário')
      }
      show('Usuário criado com sucesso!', 'success')
      onOpenChange(false)
      onSuccess?.()
    } catch (e: any) {
      show(e?.message || 'Erro ao criar usuário', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Novo Usuário">
      <div className="space-y-4">
        <div className="flex items-center gap-2" aria-label={`Etapa ${step} de 3`}>
          <div className={`h-2 flex-1 rounded ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`h-2 flex-1 rounded ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`h-2 flex-1 rounded ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="group" aria-label="Dados básicos">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} required aria-required="true" />
              {!name && <div className="text-xs text-red-600" aria-live="polite">Nome é obrigatório</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required aria-required="true" />
              {email && !isEmailValid(email) && <div className="text-xs text-red-600" aria-live="polite">E-mail inválido</div>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={maskPhone(phone)} onChange={(e) => setPhone(e.target.value)} aria-describedby="phone-help" />
              {phone && digitsOnly(phone).length < 10 && <div id="phone-help" className="text-xs text-red-600" aria-live="polite">Telefone inválido</div>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3" role="group" aria-label="Informações complementares">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Rua" ref={streetRef} value={street} onChange={(e) => setStreet(e.target.value)} />
              <Input placeholder="Número" value={number} onChange={(e) => setNumber(e.target.value)} />
              <Input placeholder="Complemento" value={complement} onChange={(e) => setComplement(e.target.value)} />
              <Input placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input placeholder="Estado" value={state} onChange={(e) => setState(e.target.value)} />
              <Input placeholder="CEP" value={maskCep(zip)} onChange={(e) => setZip(e.target.value)} aria-describedby="zip-help" />
            </div>
            {zip && digitsOnly(zip).length !== 8 && <div id="zip-help" className="text-xs text-red-600" aria-live="polite">CEP inválido</div>}
            <div className="space-y-2">
              <Label htmlFor="birth">Data de Nascimento</Label>
              <Input id="birth" type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="group" aria-label="Configurações de acesso">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" ref={passwordRef} value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby="pwd-help" />
              {password && password.length < 6 && <div id="pwd-help" className="text-xs text-red-600" aria-live="polite">Mínimo de 6 caracteres</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Permissões</Label>
              <select id="role" className="border rounded h-10 px-3" value={role} onChange={(e) => setRole(e.target.value as any)} aria-label="Selecione a permissão">
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button type="button" variant="secondary" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>Anterior</Button>
          {step < 3 ? (
            <Button type="button" onClick={() => canNext(step) ? setStep(step + 1) : null} disabled={!canNext(step)}>Próximo</Button>
          ) : (
            <Button type="button" onClick={onSubmit} disabled={loading || !step3Valid}>{loading ? 'Criando...' : 'Criar Usuário'}</Button>
          )}
        </div>
      </div>
    </Dialog>
  )
}