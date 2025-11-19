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
  const { email, password } = req.body || {}
  if (!email || !password) {
    res.status(400).json({ error: 'Email e senha são obrigatórios' })
    return
  }
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash) {
    res.status(401).json({ error: 'Credenciais inválidas' })
    return
  }
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    res.status(401).json({ error: 'Credenciais inválidas' })
    return
  }
  setSession(res, user.id)
  res.status(200).json(user)
}