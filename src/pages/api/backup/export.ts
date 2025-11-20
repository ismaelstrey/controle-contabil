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
  if (!user || user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Acesso negado' })
    return
  }
  const maskSensitive = String(req.query.maskSensitive || '').toLowerCase() === 'true'
  const users = await prisma.user.findMany()
  const clients = await prisma.client.findMany()
  const monthly = await prisma.monthlyService.findMany()
  const annual = await prisma.annualService.findMany()
  const irpf = await prisma.irpfEntry.findMany()
  const documents = await prisma.document.findMany()
  const companies = await prisma.company.findMany()
  const periods = await prisma.dasPeriod.findMany()
  const payload: any = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      users: maskSensitive ? users.map(u => ({ ...u, passwordHash: null })) : users,
      clients,
      monthlyServices: monthly,
      annualServices: annual,
      irpfEntries: irpf,
      documents,
      companies,
      dasPeriods: periods,
    }
  }
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', `attachment; filename="backup-${new Date().toISOString().slice(0,10)}.json"`)
  res.status(200).send(JSON.stringify(payload))
}