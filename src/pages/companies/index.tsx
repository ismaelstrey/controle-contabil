import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import { useAuthContext } from '@/contexts/auth-context'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useCompanies } from '@/hooks/use-companies'
import { useDasPeriods } from '@/hooks/use-das-periods'

export default function CompaniesPage() {
  const router = useRouter()
  const { user, loading } = useAuthContext()
  const { companies, createCompany, syncDas } = useCompanies()
  const [openCreate, setOpenCreate] = useState(false)
  const [openSyncId, setOpenSyncId] = useState<string | null>(null)

  const [cnpj, setCnpj] = useState('')
  const [razao, setRazao] = useState('')
  const [tipo, setTipo] = useState('')
  const [porte, setPorte] = useState('')
  const [regime, setRegime] = useState('')
  const [cnae, setCnae] = useState('')

  const [periodo, setPeriodo] = useState('')
  const [dataPagamento, setDataPagamento] = useState('')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  if (!user) return null

  const onSubmitCreate = async (e: FormEvent) => {
    e.preventDefault()
    await createCompany({
      cnpj,
      razaoSocial: razao || undefined,
      tipoEmpresa: (tipo as "MEI" | "EI" | "LTDA" | "SLU" | "SA" | "SociedadeSimples" | "Cooperativa") || undefined,
      porte: (porte as "ME" | "EPP" | "Media" | "Grande") || undefined,
      regimeTributario: (regime as "SimplesNacional" | "LucroPresumido" | "LucroReal") || undefined,
      cnaePrincipal: cnae || undefined
    })
    setOpenCreate(false)
    setCnpj('')
    setRazao('')
    setTipo('')
    setPorte('')
    setRegime('')
    setCnae('')
  }

  const onSubmitSync = async (e: FormEvent) => {
    e.preventDefault()
    if (!openSyncId) return
    await syncDas(openSyncId, { periodo: periodo || undefined, data_pagamento: dataPagamento || undefined })
    setOpenSyncId(null)
    setPeriodo('')
    setDataPagamento('')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Empresas</h1>
          <Button onClick={() => setOpenCreate(true)}>Nova Empresa</Button>
        </div>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">CNPJ</th>
                <th className="px-4 py-2 text-left">Razão Social</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Porte</th>
                <th className="px-4 py-2 text-left">Regime</th>
                <th className="px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c: any) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2">{c.cnpj}</td>
                  <td className="px-4 py-2">{c.razaoSocial || '-'}</td>
                  <td className="px-4 py-2">{c.tipoEmpresa || '-'}</td>
                  <td className="px-4 py-2">{c.porte || '-'}</td>
                  <td className="px-4 py-2">{c.regimeTributario || '-'}</td>
                  <td className="px-4 py-2">
                    <Button variant="secondary" onClick={() => setOpenSyncId(c.id)}>Sincronizar DAS</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {openCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpenCreate(false)}></div>
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Nova Empresa</h2>
                <Button variant="secondary" onClick={() => setOpenCreate(false)}>Fechar</Button>
              </div>
              <form onSubmit={onSubmitCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razao">Razão Social</Label>
                  <Input id="razao" value={razao} onChange={(e) => setRazao(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <select id="tipo" className="w-full border rounded-md h-10 px-3" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                      <option value="">Selecionar</option>
                      <option value="MEI">MEI</option>
                      <option value="EI">Empresário Individual (EI)</option>
                      <option value="LTDA">Sociedade Limitada (LTDA)</option>
                      <option value="SLU">Sociedade Limitada Unipessoal (SLU)</option>
                      <option value="SA">Sociedade Anônima (S/A)</option>
                      <option value="SociedadeSimples">Sociedade Simples</option>
                      <option value="Cooperativa">Cooperativa</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="porte">Porte</Label>
                    <select id="porte" className="w-full border rounded-md h-10 px-3" value={porte} onChange={(e) => setPorte(e.target.value)}>
                      <option value="">Selecionar</option>
                      <option value="ME">Microempresa (ME)</option>
                      <option value="EPP">Empresa de Pequeno Porte (EPP)</option>
                      <option value="Media">Média Empresa</option>
                      <option value="Grande">Grande Empresa</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regime">Regime Tributário</Label>
                    <select id="regime" className="w-full border rounded-md h-10 px-3" value={regime} onChange={(e) => setRegime(e.target.value)}>
                      <option value="">Selecionar</option>
                      <option value="SimplesNacional">Simples Nacional</option>
                      <option value="LucroPresumido">Lucro Presumido</option>
                      <option value="LucroReal">Lucro Real</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnae">CNAE Principal (opcional)</Label>
                  <Input id="cnae" value={cnae} onChange={(e) => setCnae(e.target.value)} />
                </div>
                <Button type="submit">Salvar</Button>
              </form>
            </div>
          </div>
        )}

        {openSyncId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpenSyncId(null)}></div>
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Sincronizar Simples/DAS</h2>
                <Button variant="secondary" onClick={() => setOpenSyncId(null)}>Fechar</Button>
              </div>
              <form onSubmit={onSubmitSync} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período (AAAAMM)</Label>
                  <Input id="periodo" value={periodo} onChange={(e) => setPeriodo(e.target.value)} placeholder="202311" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data de Pagamento (ISO)</Label>
                  <Input id="data" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} placeholder="2025-11-20" />
                </div>
                <Button type="submit">Sincronizar</Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
