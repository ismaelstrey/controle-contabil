import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { normalizeCnpj } from '@/lib/company-utils'

function getSessionId(req: NextApiRequest): string | null {
  const cookie = req.headers.cookie || ''
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='))
  if (!match) return null
  return match.substring('session='.length)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = getSessionId(req)
  if (!userId) {
    res.status(401).json({ error: 'Não autenticado' })
    return
  }

  try {
    if (req.method === 'GET') {
      const companies = await prisma.company.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
      res.status(200).json(companies)
      return
    }

    if (req.method === 'POST') {
      const { cnpj, razaoSocial, tipoEmpresa, porte, regimeTributario, cnaePrincipal } = req.body || {}
      const norm = normalizeCnpj(String(cnpj || ''))
      if (!norm || norm.length !== 14) {
        res.status(400).json({ error: 'CNPJ inválido' })
        return
      }
      const created = await prisma.company.create({
        data: {
          userId,
          cnpj: norm,
          razaoSocial: razaoSocial || null,
          tipoEmpresa: tipoEmpresa || null,
          porte: porte || null,
          regimeTributario: regimeTributario || null,
          cnaePrincipal: cnaePrincipal || null
        }
      })
      res.status(201).json(created)
      return
    }

    res.status(405).json({ error: 'Método não permitido' })
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Erro inesperado' })
  }
}