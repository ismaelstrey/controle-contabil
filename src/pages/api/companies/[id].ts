import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id)
  try {
    if (req.method === 'GET') {
      const company = await prisma.company.findUnique({ where: { id } })
      if (!company) {
        res.status(404).json({ error: 'Empresa não encontrada' })
        return
      }
      res.status(200).json(company)
      return
    }

    res.status(405).json({ error: 'Método não permitido' })
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Erro inesperado' })
  }
}