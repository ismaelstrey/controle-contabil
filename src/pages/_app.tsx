import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/contexts/toast-context'
import { AuthProvider } from '@/contexts/auth-context'
import { AppProvider } from '@/contexts/app-context'
import { ClientProvider } from '@/contexts/client-context'
import { ToastContainer } from '@/components/ui/toast-container'
import '../styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 3,
      retryDelay: 1000,
    },
  },
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <AppProvider>
            <ClientProvider>
              <div className="min-h-screen bg-background">
                <Component {...pageProps} />
              </div>
              <ToastContainer />
            </ClientProvider>
          </AppProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}