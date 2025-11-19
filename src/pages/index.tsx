import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Link from 'next/link'

const HomePage: NextPage = () => {
  const router = useRouter()

  useEffect(() => {
    // Simple redirect logic
    const timer = setTimeout(() => {
      router.push('/login')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">ContabilJaque</h1>
        <p className="text-lg text-gray-600">Sistema de Controle de Clientes</p>
        <div className="space-x-4">
          <Link 
            href="/login" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fazer Login
          </Link>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Dashboard
          </Link>
        </div>
        <p className="text-sm text-gray-500">Redirecionando para login...</p>
      </div>
    </div>
  )
}

export default HomePage