import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
const { digitsOnly, normalizeCpfCnpj } = require('@/lib/doc-validation')

function getSessionId(req: NextApiRequest): string | null {
  const cookie = req.headers.cookie || ''
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='))
  if (!match) return null
  return match.substring('session='.length)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const userId = getSessionId(req)
      if (!userId) {
        res.status(401).json({ error: 'Não autenticado' })
        return
      }
      const { query } = req
      const search = typeof query.search === 'string' ? query.search.trim() : ''
      const where: any = { userId }
      const orderBy = { name: 'asc' as const }
      let clients = await prisma.client.findMany({ where, orderBy })
      if (search) {
        const s = search.toLowerCase()
        clients = clients.filter(c =>
          (c.name || '').toLowerCase().includes(s) ||
          (c.email || '').toLowerCase().includes(s) ||
          (c.cpf || '').toLowerCase().includes(s) ||
          (c.cnpj || '').toLowerCase().includes(s)
        )
      }
      res.status(200).json(clients)
      return
    }

    if (req.method === 'POST') {
      const userId = getSessionId(req)
      if (!userId) {
        res.status(401).json({ error: 'Não autenticado' })
        return
      }
      const { name, email, cpf, cnpj, cpf_cnpj, phone, address, notes, dataNascimento, codigoAcesso, senhaGov, codigoRegularize, senhaNfse } = req.body || {}
      if (!name || !email) {
        res.status(400).json({ error: 'name e email são obrigatórios' })
        return
      }
      let useCpf = false
      let useCnpj = false
      let docDigits = ''
      try {
        const { value, type } = normalizeCpfCnpj(cpf, cnpj)
        docDigits = value
        useCpf = type === 'CPF'
        useCnpj = type === 'CNPJ'
      } catch (e: any) {
        // ancora compatibilidade legado opcional
        const legacy = digitsOnly(cpf_cnpj)
        const type = legacy.length === 11 ? 'CPF' : legacy.length === 14 ? 'CNPJ' : null
        if (!type) {
          res.status(400).json({ error: e?.message || 'Documento inválido' })
          return
        }
        docDigits = legacy
        useCpf = type === 'CPF'
        useCnpj = type === 'CNPJ'
      }
      const created = await prisma.client.create({
        data: {
          userId,
          name,
          email,
          cpf: useCpf ? docDigits : null,
          cnpj: useCnpj ? docDigits : null,
          phone: phone || null,
          address: address || null,
          notes: notes || null,
          dataNascimento: dataNascimento || null,
          codigoAcesso: codigoAcesso || null,
          senhaGov: senhaGov || null,
          codigoRegularize: codigoRegularize || null,
          senhaNfse: senhaNfse || null,
          status: 'ACTIVE'
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