import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import XLSX from 'xlsx'

function cleanCpfCnpj(v: string) { return String(v || '').replace(/\D/g, '') }
function isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '')) }
function placeholderEmail(name: string) { return `${name.replace(/\s+/g,'').toLowerCase()}-${Date.now()}@example.local` }
function getSessionId(req: NextApiRequest): string | null {
  const cookie = req.headers.cookie || ''
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='))
  if (!match) return null
  return match.substring('session='.length)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }
  const userId = getSessionId(req)
  if (!userId) {
    res.status(401).json({ error: 'Não autenticado' })
    return
  }
  const { dataBase64 } = req.body || {}
  if (!dataBase64) {
    res.status(400).json({ error: 'Arquivo inválido' })
    return
  }
  const buffer = Buffer.from(String(dataBase64), 'base64')
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows: any[] = XLSX.utils.sheet_to_json(sheet)
  let inserted = 0
  for (const row of rows) {
    const name = String(row.name || row.Cliente || '').trim()
    const emailRaw = String(row.email || '').trim()
    const email = isValidEmail(emailRaw) ? emailRaw : placeholderEmail(name || 'cliente')
    const doc = cleanCpfCnpj(String(row.cpf_cnpj || row.CPF || row.CNPJ || ''))
    if (!name || !doc) continue
    const isCpf = doc.length === 11
    const isCnpj = doc.length === 14
    if (!isCpf && !isCnpj) continue
    try {
      await prisma.client.create({
        data: {
          userId,
          name,
          email,
          cpfCnpj: doc,
          cpf: isCpf ? doc : null,
          cnpj: isCnpj ? doc : null,
          status: 'ACTIVE'
        }
      })
      inserted++
    } catch {}
  }
  res.status(200).json({ inserted, total: rows.length })
}