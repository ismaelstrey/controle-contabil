export type DocType = 'CPF' | 'CNPJ'

export function digitsOnly(v: unknown): string {
  return String(v || '').replace(/\D/g, '')
}

export function inferDocType(doc: string | null | undefined): DocType | null {
  const d = digitsOnly(doc)
  if (d.length === 11) return 'CPF'
  if (d.length === 14) return 'CNPJ'
  return null
}

export function normalizeCpfCnpj(cpf?: unknown, cnpj?: unknown): { value: string; type: DocType } {
  const c1 = digitsOnly(cpf)
  const c2 = digitsOnly(cnpj)
  if (c1 && c2) throw new Error('Informe apenas CPF ou apenas CNPJ')
  const type = inferDocType(c1 || c2)
  if (!type) throw new Error('Formato inválido para CPF/CNPJ')
  return { value: c1 || c2, type }
}