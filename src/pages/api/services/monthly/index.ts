import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { clientId, month, year, search } = req.query
      const where: any = {}
      if (clientId) where.clientId = String(clientId)
      if (month && year) where.referenceMonth = `${year}-${month}`
      const include = { client: true }
      const data = await prisma.monthlyService.findMany({ where, include, orderBy: { createdAt: 'desc' } })
      if (search) {
        const s = String(search).toLowerCase()
        res.status(200).json(data.filter(d => 
          (d.client?.name || '').toLowerCase().includes(s) ||
          (d.tipoGuia || '').toLowerCase().includes(s) ||
          (d.regularizacao || '').toLowerCase().includes(s) ||
          (d.situacao || '').toLowerCase().includes(s)
        ))
        return
      }
      res.status(200).json(data)
      return
    }

    if (req.method === 'POST') {
      const { clientId, tipoGuia, regularizacao, situacao, referenceMonth } = req.body || {}
      if (!clientId) {
        res.status(400).json({ error: 'clientId obrigatório' })
        return
      }
      const client = await prisma.client.findUnique({ where: { id: String(clientId) } })
      if (!client) {
        res.status(404).json({ error: 'Cliente não encontrado' })
        return
      }
      const created = await prisma.monthlyService.create({
        data: {
          clientId: String(clientId),
          tipoGuia: tipoGuia || null,
          regularizacao: regularizacao || null,
          situacao: situacao || null,
          referenceMonth: referenceMonth || null,
        }
      })
      res.status(201).json(created)
      return
    }

    res.status(405).json({ error: 'Método não permitido' })
  } catch (e: any) {
    const message = e?.message || 'Erro inesperado'
    res.status(400).json({ error: message })
  }
}