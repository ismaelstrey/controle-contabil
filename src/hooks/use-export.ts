'use client'

import { useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { useToastContext } from '@/contexts/toast-context'
import { Client, ExportFilters, ReportConfig } from '@/types'

export interface UseExportReturn {
  exporting: boolean
  error: string | null
  exportToExcel: (clients: Client[], filters?: ExportFilters) => Promise<void>
  exportToPDF: (clients: Client[], type: string, filters?: ExportFilters) => Promise<void>
  generateReport: (config: ReportConfig, clients: Client[]) => Promise<Blob>
}

export const useExport = (): UseExportReturn => {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { show } = useToastContext()

  const exportToExcel = useCallback(async (clients: Client[], filters?: ExportFilters): Promise<void> => {
    setExporting(true)
    setError(null)

    try {
      // Preparar dados para exportação
      const exportData = clients.map(client => ({
        'Nome': client.name,
        'Email': client.email,
        'CPF/CNPJ': formatCpfCnpj(client.cpf_cnpj),
        'Telefone': client.phone || '',
        'Status': client.status === 'active' ? 'Ativo' : 'Inativo',
        'Endereço': client.address ? formatAddress(client.address) : '',
        'Observações': client.notes || '',
        'Tipo de Guia': client.monthly_service?.tipo_guia || '',
        'Regularização': client.monthly_service?.regularizacao || '',
        'Situação': client.monthly_service?.situacao || '',
        'Mês de Referência': client.monthly_service?.reference_month || '',
        'Tipo de Serviço Anual': client.annual_service?.type || '',
        'Observação Anual': client.annual_service?.observation || '',
        'Ano': client.annual_service?.year || '',
        'Data de Criação': formatDate(client.created_at),
        'Data de Atualização': formatDate(client.updated_at)
      }))

      // Criar workbook
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(exportData)

      // Aplicar formatação
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
      
      // Ajustar largura das colunas
      const columnWidths = [
        { wch: 30 }, // Nome
        { wch: 25 }, // Email
        { wch: 18 }, // CPF/CNPJ
        { wch: 15 }, // Telefone
        { wch: 10 }, // Status
        { wch: 40 }, // Endereço
        { wch: 30 }, // Observações
        { wch: 20 }, // Tipo de Guia
        { wch: 15 }, // Regularização
        { wch: 15 }, // Situação
        { wch: 15 }, // Mês de Referência
        { wch: 20 }, // Tipo de Serviço Anual
        { wch: 30 }, // Observação Anual
        { wch: 8 }, // Ano
        { wch: 20 }, // Data de Criação
        { wch: 20 }  // Data de Atualização
      ]
      
      worksheet['!cols'] = columnWidths

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes')

      // Gerar arquivo
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
      // Salvar arquivo
      const fileName = `clientes_${formatDateForFileName(new Date())}.xlsx`
      saveAs(blob, fileName)
      
      show('Exportação para Excel concluída!', 'success')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao exportar para Excel'
      setError(errorMessage)
      show(errorMessage, 'error')
    } finally {
      setExporting(false)
    }
  }, [show])

  const exportToPDF = useCallback(async (clients: Client[], type: string, filters?: ExportFilters): Promise<void> => {
    setExporting(true)
    setError(null)

    try {
      // Implementar exportação para PDF usando biblioteca como jsPDF
      // Por enquanto, vamos usar uma solução simples com window.print()
      
      const printContent = `
        <html>
          <head>
            <title>Relatório de Clientes</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .header { text-align: center; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Relatório de Clientes</h1>
              <p>Gerado em: ${formatDate(new Date().toISOString())}</p>
              ${filters ? `<p>Filtros aplicados: ${JSON.stringify(filters)}</p>` : ''}
            </div>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>CPF/CNPJ</th>
                  <th>Status</th>
                  <th>Data de Criação</th>
                </tr>
              </thead>
              <tbody>
                ${clients.map(client => `
                  <tr>
                    <td>${client.name}</td>
                    <td>${client.email}</td>
                    <td>${formatCpfCnpj(client.cpf_cnpj)}</td>
                    <td>${client.status === 'active' ? 'Ativo' : 'Inativo'}</td>
                    <td>${formatDate(client.created_at)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `

      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (printWindow) {
        printWindow.document.write(printContent)
        printWindow.document.close()
        printWindow.print()
      }
      
      show('Relatório gerado para impressão!', 'success')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar relatório PDF'
      setError(errorMessage)
      show(errorMessage, 'error')
    } finally {
      setExporting(false)
    }
  }, [show])

  const generateReport = useCallback(async (config: ReportConfig, clients: Client[]): Promise<Blob> => {
    setExporting(true)
    setError(null)

    try {
      let reportData: any[] = []
      
      switch (config.type) {
        case 'clients':
          reportData = clients.map(client => ({
            nome: client.name,
            email: client.email,
            cpf_cnpj: formatCpfCnpj(client.cpf_cnpj),
            status: client.status,
            data_criacao: client.created_at
          }))
          break
          
        case 'monthly':
          reportData = clients
            .filter(c => c.monthly_service)
            .map(client => ({
              nome: client.name,
              tipo_guia: client.monthly_service?.tipo_guia,
              regularizacao: client.monthly_service?.regularizacao,
              situacao: client.monthly_service?.situacao,
              mes_referencia: client.monthly_service?.reference_month
            }))
          break
          
        case 'annual':
          reportData = clients
            .filter(c => c.annual_service)
            .map(client => ({
              nome: client.name,
              tipo: client.annual_service?.type,
              observacao: client.annual_service?.observation,
              ano: client.annual_service?.year
            }))
          break
          
        case 'irpf':
          reportData = clients
            .filter(c => c.irpf_entry)
            .map(client => ({
              nome: client.irpf_entry?.name,
              cpf: client.irpf_entry?.cpf,
              sequencia: client.irpf_entry?.sequence_number,
              ano: client.irpf_entry?.year
            }))
          break
      }

      if (config.format === 'csv') {
        const csvContent = convertToCSV(reportData)
        return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      } else if (config.format === 'excel') {
        const workbook = XLSX.utils.book_new()
        const worksheet = XLSX.utils.json_to_sheet(reportData)
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório')
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
        return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      } else {
        throw new Error('Formato de relatório não suportado')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar relatório'
      setError(errorMessage)
      throw err
    } finally {
      setExporting(false)
    }
  }, [])

  return {
    exporting,
    error,
    exportToExcel,
    exportToPDF,
    generateReport
  }
}

// Funções auxiliares
const formatCpfCnpj = (cpfCnpj: string): string => {
  const cleaned = cpfCnpj.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else if (cleaned.length === 14) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return cpfCnpj
}

const formatAddress = (address: any): string => {
  const parts = [
    address.street,
    address.number,
    address.complement,
    address.neighborhood,
    address.city,
    address.state,
    address.zip_code
  ].filter(Boolean)
  
  return parts.join(', ')
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

const formatDateForFileName = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    }).join(',')
  )
  
  return [csvHeaders, ...csvRows].join('\n')
}
