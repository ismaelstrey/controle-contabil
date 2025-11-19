import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id)
  try {
    if (req.method === 'GET') {
      const client = await prisma.client.findUnique({ where: { id } })
      if (!client) {
        res.status(404).json({ error: 'Cliente não encontrado' })
        return
      }
      res.status(200).json(client)
      return
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { name, email, cpf_cnpj, phone, address, notes, status } = req.body || {}
      const updated = await prisma.client.update({
        where: { id },
        data: {
          name: name ?? undefined,
          email: email ?? undefined,
          cpfCnpj: cpf_cnpj ?? undefined,
          phone: phone ?? undefined,
          address: address ?? undefined,
          notes: notes ?? undefined,
          status: status ?? undefined
        }
      })
      res.status(200).json(updated)
      return
    }

    if (req.method === 'DELETE') {
      await prisma.client.delete({ where: { id } })
      res.status(204).end()
      return
    }

    res.status(405).json({ error: 'Método não permitido' })
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Erro inesperado' })
  }
}