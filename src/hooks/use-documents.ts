'use client'

import { useState, useCallback } from 'react'
// Documentos migrados para API Routes; Storage Supabase removido
import { useToastContext } from '@/contexts/toast-context'
import { Document } from '@/types'

export interface UseDocumentsReturn {
  documents: Document[]
  loading: boolean
  error: string | null
  uploadDocument: (file: File, clientId: string) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  downloadDocument: (id: string) => Promise<void>
  listDocuments: (clientId?: string) => Promise<void>
  getDocumentUrl: (fileUrl: string) => string
}

export const useDocuments = (): UseDocumentsReturn => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { show } = useToastContext()

  const uploadDocument = async (file: File, clientId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      if (file.size > 10 * 1024 * 1024) throw new Error('Arquivo muito grande. Máximo 10MB.')
      const allowed = ['application/pdf','image/jpeg','image/png','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel','text/csv']
      if (!allowed.includes(file.type)) throw new Error('Tipo de arquivo não permitido.')
      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
      const dataBase64 = btoa(binary)
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, fileName: file.name, fileType: file.type, fileSize: file.size, dataBase64 })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Falha ao enviar documento')
      }
      const doc = await res.json()
      setDocuments(prev => [doc, ...prev])
      show('Documento enviado com sucesso!', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar documento'
      setError(msg)
      show(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (id: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao remover documento')
      setDocuments(prev => prev.filter(d => d.id !== id))
      show('Documento removido com sucesso!', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao remover documento'
      setError(msg)
      show(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const downloadDocument = async (id: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/documents/${id}`)
      if (!res.ok) throw new Error('Falha ao baixar documento')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const doc = documents.find(d => d.id === id)
      link.download = doc?.file_name || 'arquivo'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      show('Download concluído!', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao baixar documento'
      setError(msg)
      show(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const listDocuments = async (clientId?: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const params = clientId ? `?clientId=${clientId}` : ''
      const res = await fetch(`/api/documents${params}`)
      if (!res.ok) throw new Error('Falha ao listar documentos')
      const data = await res.json()
      setDocuments(data || [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao listar documentos'
      setError(msg)
      show(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const getDocumentUrl = (_fileUrl: string): string => {
    return ''
  }

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    listDocuments,
    getDocumentUrl
  }
}
