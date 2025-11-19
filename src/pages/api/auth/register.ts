import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

function setSession(res: NextApiResponse, id: string) {
  const secure = process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', `session=${id}; HttpOnly; Path=/; SameSite=Lax;${secure ? ' Secure;' : ''} Max-Age=604800`)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }
  const { email, password, name } = req.body || {}
  if (!email || !password || !name) {
    res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
    return
  }
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    res.status(409).json({ error: 'Usuário já existe' })
    return
  }
  const rounds = Number(process.env.BCRYPT_ROUNDS || 12)
  const passwordHash = await bcrypt.hash(password, rounds)
  const user = await prisma.user.create({ data: { email, name, passwordHash, role: 'USER' } })
  setSession(res, user.id)
  res.status(201).json(user)
}