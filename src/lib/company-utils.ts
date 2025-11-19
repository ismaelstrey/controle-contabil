export function normalizeCnpj(cnpj: string): string {
  return String(cnpj || '').replace(/\D/g, '')
}

export function parseCurrencyBR(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'number') return v
  const s = String(v).replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(/,/g, '.')
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

export function parseDateBR(v: string | null | undefined): Date | null {
  if (!v) return null
  const m = String(v).match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  return isNaN(d.getTime()) ? null : d
}