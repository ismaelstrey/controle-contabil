import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

function getSessionId(req: NextApiRequest): string | null {
  const cookie = req.headers.cookie || ''
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='))
  if (!match) return null
  return match.substring('session='.length)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const userId = getSessionId(req)
      if (!userId) {
        res.status(401).json({ error: 'Não autenticado' })
        return
      }
      const { query } = req
      const search = typeof query.search === 'string' ? query.search.trim() : ''
      const where: any = { userId }
      const orderBy = { name: 'asc' as const }
      let clients = await prisma.client.findMany({ where, orderBy })
      if (search) {
        const s = search.toLowerCase()
        clients = clients.filter(c =>
          (c.name || '').toLowerCase().includes(s) ||
          (c.email || '').toLowerCase().includes(s) ||
          (c.cpfCnpj || '').toLowerCase().includes(s)
        )
      }
      res.status(200).json(clients)
      return
    }

    if (req.method === 'POST') {
      const userId = getSessionId(req)
      if (!userId) {
        res.status(401).json({ error: 'Não autenticado' })
        return
      }
      const { name, email, cpf_cnpj, phone, address, notes } = req.body || {}
      if (!name || !email || !cpf_cnpj) {
        res.status(400).json({ error: 'name, email e cpf_cnpj são obrigatórios' })
        return
      }
      const created = await prisma.client.create({
        data: {
          userId,
          name,
          email,
          cpfCnpj: cpf_cnpj,
          phone: phone || null,
          address: address || null,
          notes: notes || null,
          status: 'ACTIVE'
        }
      })
      res.status(201).json(created)
      return
    }

    res.status(405).json({ error: 'Método não permitido' })
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Erro inesperado' })
  }
}