import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthContext } from '@/contexts/auth-context'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ClientDetail } from '@/components/client-detail'

export default function ClientDetailPage() {
  const router = useRouter()
  const { user, loading } = useAuthContext()
  const { id } = router.query

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

  if (!user || !id) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Detalhes do Cliente</h1>
        <ClientDetail clientId={id as string} />
      </div>
    </DashboardLayout>
  )
}
