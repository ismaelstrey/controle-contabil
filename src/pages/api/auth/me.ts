import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

function getSessionId(req: NextApiRequest): string | null {
  const cookie = req.headers.cookie || ''
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='))
  if (!match) return null
  return match.substring('session='.length)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }
  const id = getSessionId(req)
  if (!id) {
    res.status(401).json({ error: 'Não autenticado' })
    return
  }
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    res.status(401).json({ error: 'Sessão inválida' })
    return
  }
  res.status(200).json(user)
}