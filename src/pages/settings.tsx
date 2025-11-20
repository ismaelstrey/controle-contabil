import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/dashboard-layout'
import { SettingsForm } from '@/components/settings-form'
import { useAuth } from '@/hooks/use-auth'
import { BackupPanel } from '@/components/backup-panel'

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

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
        <h1 className="text-3xl font-bold">Configurações</h1>
        <SettingsForm />
        <BackupPanel />
      </div>
    </DashboardLayout>
  )
}