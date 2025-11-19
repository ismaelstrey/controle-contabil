import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id)
  try {
    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({ where: { id } })
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' })
        return
      }
      res.status(200).json(user)
      return
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { name, email, role } = req.body || {}
      const updated = await prisma.user.update({
        where: { id },
        data: {
          name: name ?? undefined,
          email: email ?? undefined,
          role: role ?? undefined
        }
      })
      res.status(200).json(updated)
      return
    }

    res.status(405).json({ error: 'Método não permitido' })
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Erro inesperado' })
  }
}