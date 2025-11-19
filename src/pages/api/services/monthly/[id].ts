import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const serviceId = String(id)

  if (req.method === 'GET') {
    const item = await prisma.monthlyService.findUnique({ where: { id: serviceId }, include: { client: true } })
    if (!item) {
      res.status(404).json({ error: 'Registro não encontrado' })
      return
    }
    res.status(200).json(item)
    return
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const { tipoGuia, regularizacao, situacao, referenceMonth } = req.body || {}
    const updated = await prisma.monthlyService.update({
      where: { id: serviceId },
      data: {
        tipoGuia: tipoGuia ?? undefined,
        regularizacao: regularizacao ?? undefined,
        situacao: situacao ?? undefined,
        referenceMonth: referenceMonth ?? undefined,
      }
    })
    res.status(200).json(updated)
    return
  }

  if (req.method === 'DELETE') {
    await prisma.monthlyService.delete({ where: { id: serviceId } })
    res.status(204).end()
    return
  }

  res.status(405).json({ error: 'Método não permitido' })
}