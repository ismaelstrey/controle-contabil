'use client'

import { useState, useCallback } from 'react'
// Supabase removido; importação via API a implementar
import { useToastContext } from '@/contexts/toast-context'
import { ImportPreview, ValidationResult } from '@/types'
import * as XLSX from 'xlsx'

export interface UseImportReturn {
  importing: boolean
  progress: number
  error: string | null
  importClients: (file: File) => Promise<void>
  validateData: (data: any[]) => ValidationResult
  previewData: ImportPreview[]
  clearPreview: () => void
}

export const useImport = (): UseImportReturn => {
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewData, setPreviewData] = useState<ImportPreview[]>([])
  const { show } = useToastContext()

  const validateData = (data: any[]): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []
    const preview: ImportPreview[] = []

    data.forEach((row, index) => {
      const rowErrors: string[] = []
      const rowWarnings: string[] = []

      // Validações básicas
      if (!row.name || row.name.trim() === '') {
        rowErrors.push('Nome é obrigatório')
      }

      if (!row.email || !isValidEmail(row.email)) {
        rowErrors.push('Email inválido')
      }

      const doc = String(row.cpf_cnpj || row.CPF || row.CNPJ || '')
      if (!doc || !isValidCpfCnpj(doc)) {
        rowErrors.push('CPF/CNPJ inválido')
      }

      // Validações de formato da planilha
      if (row.tipo_guia && !['Simples Nacional', 'Lucro Presumido', 'Lucro Real'].includes(row.tipo_guia)) {
        rowWarnings.push('Tipo de guia não reconhecido')
      }

      preview.push({
        row: index + 1,
        data: row,
        errors: rowErrors,
        warnings: rowWarnings
      })
    })

    return {
      is_valid: preview.every(p => p.errors.length === 0),
      errors,
      warnings,
      preview
    }
  }

  const importClients = async (file: File): Promise<void> => {
    setImporting(true)
    setProgress(0)
    setPreviewData([])

    try {
      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
      const dataBase64 = btoa(binary)
      const res = await fetch('/api/import/xlsx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataBase64 })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Falha na importação')
      }
      const result = await res.json()
      show(`Importação concluída! Inseridos: ${result.inserted}/${result.total}`, 'success')
      setProgress(100)
      
    } catch (error) {
      show(`Erro ao importar: ${(error as Error).message}`, 'error')
    } finally {
      setImporting(false)
      setProgress(0)
    }
  }

  const clearPreview = (): void => {
    setPreviewData([])
  }

  return {
    importing,
    progress,
    error: null,
    importClients,
    validateData,
    previewData,
    clearPreview
  }
}

// Funções auxiliares
const readExcelFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(new Error('Erro ao ler arquivo Excel'))
      }
    }
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsArrayBuffer(file)
  })
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidCpfCnpj = (cpfCnpj: string): boolean => {
  const cleaned = cleanCpfCnpj(cpfCnpj)
  return cleaned.length === 11 || cleaned.length === 14
}

const cleanCpfCnpj = (cpfCnpj: string): string => {
  return cpfCnpj.replace(/\D/g, '')
}

const cleanPhone = (phone: string): string => {
  return phone.replace(/\D/g, '')
}
