import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthContext } from '@/contexts/auth-context'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AnnualServiceList } from '@/components/annual-service-list'
import { AnnualServiceForm } from '@/components/annual-service-form'

export default function AnnualServicesPage() {
  const router = useRouter()
  const { user, loading } = useAuthContext()

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
        <h1 className="text-3xl font-bold">Serviços Anuais</h1>
        <AnnualServiceForm />
        <AnnualServiceList />
      </div>
    </DashboardLayout>
  )
}
