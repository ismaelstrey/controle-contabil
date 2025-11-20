export interface Client {
  id: string
  name: string
  email: string
  cpf_cnpj?: string
  cpf?: string
  cnpj?: string
  data_nascimento?: string
  codigo_acesso?: string
  senha_gov?: string
  codigo_regularize?: string
  senha_nfse?: string
  phone?: string
  address?: Address
  status: 'active' | 'inactive'
  notes?: string
  monthly_service?: MonthlyService
  annual_service?: AnnualService
  irpf_entry?: IrpfEntry
  created_at: string
  updated_at: string
  user_id: string
}

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
}

export interface MonthlyService {
  id: string
  client_id: string
  tipo_guia?: string
  regularizacao?: string
  situacao?: string
  reference_month?: string
  created_at: string
  updated_at: string
}

export interface AnnualService {
  id: string
  client_id: string
  type?: string
  observation?: string
  year?: number
  created_at: string
  updated_at: string
}

export interface IrpfEntry {
  id: string
  client_id?: string
  sequence_number?: number
  name: string
  cpf: string
  year?: number
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  client_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface CreateClientData {
  name: string
  email: string
  cpf?: string
  cnpj?: string
  cpf_cnpj?: string
  phone?: string
  address?: Address
  notes?: string
  data_nascimento?: string
  codigo_acesso?: string
  senha_gov?: string
  codigo_regularize?: string
  senha_nfse?: string
  monthly_service?: Omit<MonthlyService, 'id' | 'client_id' | 'created_at' | 'updated_at'>
  annual_service?: Omit<AnnualService, 'id' | 'client_id' | 'created_at' | 'updated_at'>
}

export interface UpdateClientData extends Partial<CreateClientData> {
  status?: 'active' | 'inactive'
}

export interface ClientFilters {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  service_type?: 'monthly' | 'annual' | 'irpf' | 'all'
  date_from?: string
  date_to?: string
}

export interface SortOption {
  field: keyof Client
  direction: 'asc' | 'desc'
}

export interface ExportFilters {
  client_ids?: string[]
  date_from?: string
  date_to?: string
  service_type?: string
}

export interface ReportConfig {
  type: 'clients' | 'monthly' | 'annual' | 'irpf'
  format: 'excel' | 'pdf' | 'csv'
  filters?: ExportFilters
  include_documents?: boolean
}

export interface ImportPreview {
  row: number
  data: any
  errors: string[]
  warnings: string[]
}

export interface ValidationResult {
  is_valid: boolean
  errors: string[]
  warnings: string[]
  preview: ImportPreview[]
}

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export interface AppSettings {
  theme: 'light' | 'dark'
  language: string
  items_per_page: number
  date_format: string
  currency_format: string
}