import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const entryId = String(id)

  if (req.method === 'GET') {
    const item = await prisma.irpfEntry.findUnique({ where: { id: entryId } })
    if (!item) {
      res.status(404).json({ error: 'Registro não encontrado' })
      return
    }
    res.status(200).json(item)
    return
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const { name, cpf, sequenceNumber, clientId, year } = req.body || {}
    const updated = await prisma.irpfEntry.update({
      where: { id: entryId },
      data: {
        name: name ?? undefined,
        cpf: cpf ?? undefined,
        sequenceNumber: sequenceNumber ?? undefined,
        clientId: clientId ?? undefined,
        year: year ?? undefined
      }
    })
    res.status(200).json(updated)
    return
  }

  if (req.method === 'DELETE') {
    await prisma.irpfEntry.delete({ where: { id: entryId } })
    res.status(204).end()
    return
  }

  res.status(405).json({ error: 'Método não permitido' })
}