import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id)
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }
  const company = await prisma.company.findUnique({ where: { id } })
  if (!company) {
    res.status(404).json({ error: 'Empresa não encontrada' })
    return
  }
  const periods = await prisma.dasPeriod.findMany({ where: { companyId: id }, orderBy: { periodo: 'desc' } })
  res.status(200).json(periods)
}