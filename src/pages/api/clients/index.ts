import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

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
          (c.cpfCnpj || '').toLowerCase().includes(s) ||
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
      const digits = (v: any) => String(v || '').replace(/\D/g, '')
      const cpfDigits = digits(cpf)
      const cnpjDigits = digits(cnpj)
      let useCpf = false
      let useCnpj = false
      let docDigits = ''
      if (cpfDigits) { useCpf = true; docDigits = cpfDigits }
      if (cnpjDigits) { useCnpj = true; docDigits = cnpjDigits }
      if (!useCpf && !useCnpj) {
        const legacy = digits(cpf_cnpj)
        if (legacy.length === 11) { useCpf = true; docDigits = legacy }
        else if (legacy.length === 14) { useCnpj = true; docDigits = legacy }
      }
      if ((useCpf && useCnpj) || (!useCpf && !useCnpj)) {
        res.status(400).json({ error: 'Informe apenas CPF ou apenas CNPJ' })
        return
      }
      if ((useCpf && docDigits.length !== 11) || (useCnpj && docDigits.length !== 14)) {
        res.status(400).json({ error: 'Formato inválido para CPF/CNPJ' })
        return
      }
      const created = await prisma.client.create({
        data: {
          userId,
          name,
          email,
          cpfCnpj: docDigits,
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