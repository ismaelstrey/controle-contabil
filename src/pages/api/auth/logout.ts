import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }
  const secure = process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', `session=; HttpOnly; Path=/; SameSite=Lax;${secure ? ' Secure;' : ''} Max-Age=0`)
  res.status(200).json({ ok: true })
}