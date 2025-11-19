import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { clientId, year, search } = req.query
    const where: any = {}
    if (clientId) where.clientId = String(clientId)
    if (year) where.year = Number(year)
    const data = await prisma.irpfEntry.findMany({ where, orderBy: { createdAt: 'desc' } })
    if (search) {
      const s = String(search).toLowerCase()
      res.status(200).json(data.filter(d => 
        (d.name || '').toLowerCase().includes(s) ||
        (d.cpf || '').toLowerCase().includes(s)
      ))
      return
    }
    res.status(200).json(data)
    return
  }

  if (req.method === 'POST') {
    const { name, cpf, sequenceNumber, clientId, year } = req.body || {}
    if (!name || !cpf) {
      res.status(400).json({ error: 'name e cpf são obrigatórios' })
      return
    }
    const created = await prisma.irpfEntry.create({
      data: {
        name,
        cpf,
        sequenceNumber: sequenceNumber || null,
        clientId: clientId || null,
        year: year || null
      }
    })
    res.status(201).json(created)
    return
  }

  res.status(405).json({ error: 'Método não permitido' })
}