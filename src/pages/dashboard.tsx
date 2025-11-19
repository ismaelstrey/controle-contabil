import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuthContext } from '@/contexts/auth-context'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ClientList } from '@/components/client-list'
import { MonthlyServiceList } from '@/components/monthly-service-list'
import { MonthlyServiceForm } from '@/components/monthly-service-form'
import { AnnualServiceList } from '@/components/annual-service-list'
import { AnnualServiceForm } from '@/components/annual-service-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ClientForm } from '@/components/client-form'
import { StatCard } from '@/components/stat-card'
import { OverviewChart } from '@/components/overview-chart'
import { useClients } from '@/hooks/use-clients'
import { useMonthlyServices } from '@/hooks/use-monthly-services'
import { useAnnualServices } from '@/hooks/use-annual-services'
import { useIrpfServices } from '@/hooks/use-irpf-services'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Users, Calendar, CalendarRange } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuthContext()
  const [open, setOpen] = useState(false)
  const [openMonthly, setOpenMonthly] = useState(false)
  const [openAnnual, setOpenAnnual] = useState(false)
  const { clients } = useClients()
  const { services: monthly } = useMonthlyServices()
  const { services: annual } = useAnnualServices()
  const { entries: irpf } = useIrpfServices()

  const monthlyByRef = useMemo(() => {
    const map: Record<string, number> = {}
    monthly.forEach((m: any) => {
      const key = m.referenceMonth || '—'
      map[key] = (map[key] || 0) + 1
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([name, value]) => ({ name, value }))
  }, [monthly])

  const annualByYear = useMemo(() => {
    const map: Record<string, number> = {}
    annual.forEach((a: any) => {
      const key = String(a.year || '—')
      map[key] = (map[key] || 0) + 1
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([name, value]) => ({ name, value }))
  }, [annual])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => setOpenMonthly(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Serviço Mensal
            </Button>
            <Button onClick={() => setOpenAnnual(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Serviço Anual
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Clientes" value={clients.length} />
          <StatCard title="Serviços Mensais" value={monthly.length} />
          <StatCard title="Serviços Anuais" value={annual.length} />
          <StatCard title="Entradas IRPF" value={irpf.length} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <OverviewChart title="Mensais por mês" data={monthlyByRef} color="#6366F1" />
          <OverviewChart title="Anuais por ano" data={annualByYear} color="#F59E0B" />
        </div>

        <Tabs defaultValue="clients">
          <TabsList className="bg-white/60">
            <TabsTrigger value="clients" tone="green">
              <Users className="mr-2 h-4 w-4" />
              Clientes
              <span className="ml-2 inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium border border-green-200 group-hover:bg-green-200 group-hover:text-green-800">{clients.length}</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" tone="indigo">
              <Calendar className="mr-2 h-4 w-4" />
              Serviços Mensais
              <span className="ml-2 inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-xs font-medium border border-indigo-200 group-hover:bg-indigo-200 group-hover:text-indigo-800">{monthly.length}</span>
            </TabsTrigger>
            <TabsTrigger value="annual" tone="amber">
              <CalendarRange className="mr-2 h-4 w-4" />
              Serviços Anuais
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-medium border border-amber-200 group-hover:bg-amber-200 group-hover:text-amber-800">{annual.length}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="clients">
            <div className="rounded-lg border bg-white">
              <div className="px-4 py-3 border-b bg-green-50 text-sm text-green-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Clientes</span>
                  <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium">{clients.length}</span>
                </div>
                <Button size="sm" onClick={() => setOpen(true)}>Novo Cliente</Button>
              </div>
              <div className="max-h-[420px] overflow-auto p-4">
                <ClientList />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="monthly">
            <div className="rounded-lg border bg-white">
              <div className="px-4 py-3 border-b bg-indigo-50 text-sm text-indigo-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Serviços Mensais</span>
                  <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-xs font-medium">{monthly.length}</span>
                </div>
                <Button size="sm" onClick={() => setOpenMonthly(true)}>Novo Serviço</Button>
              </div>
              <div className="max-h-[420px] overflow-auto p-4">
                <MonthlyServiceList />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="annual">
            <div className="rounded-lg border bg-white">
              <div className="px-4 py-3 border-b bg-amber-50 text-sm text-amber-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Serviços Anuais</span>
                  <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-medium">{annual.length}</span>
                </div>
                <Button size="sm" onClick={() => setOpenAnnual(true)}>Novo Serviço</Button>
              </div>
              <div className="max-h-[420px] overflow-auto p-4">
                <AnnualServiceList />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Novo Cliente</h2>
              <Button variant="secondary" onClick={() => setOpen(false)}>Fechar</Button>
            </div>
            <ClientForm onSuccess={() => setOpen(false)} />
          </div>
        </div>
      )}
      {openMonthly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpenMonthly(false)}></div>
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Novo Serviço Mensal</h2>
              <Button variant="secondary" onClick={() => setOpenMonthly(false)}>Fechar</Button>
            </div>
            <MonthlyServiceForm onSuccess={() => setOpenMonthly(false)} />
          </div>
        </div>
      )}
      {openAnnual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpenAnnual(false)}></div>
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Novo Serviço Anual</h2>
              <Button variant="secondary" onClick={() => setOpenAnnual(false)}>Fechar</Button>
            </div>
            <AnnualServiceForm onSuccess={() => setOpenAnnual(false)} />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
