import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
const { digitsOnly, inferDocType } = require('@/lib/doc-validation')

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
      const { name, email, cpf, cnpj, cpf_cnpj, phone, address, notes, status, dataNascimento, codigoAcesso, senhaGov, codigoRegularize, senhaNfse } = req.body || {}
      const cpfDigits = digitsOnly(cpf)
      const cnpjDigits = digitsOnly(cnpj)
      let useCpf: boolean | null = null
      let useCnpj: boolean | null = null
      let docDigits = ''
      if (cpf !== undefined) {
        useCpf = !!cpfDigits
        docDigits = cpfDigits || docDigits
      }
      if (cnpj !== undefined) {
        useCnpj = !!cnpjDigits
        docDigits = cnpjDigits || docDigits
      }
      if (cpf === undefined && cnpj === undefined && cpf_cnpj !== undefined) {
        const legacy = digitsOnly(cpf_cnpj)
        const type = inferDocType(legacy)
        if (type === 'CPF') { useCpf = true; useCnpj = false; docDigits = legacy }
        else if (type === 'CNPJ') { useCpf = false; useCnpj = true; docDigits = legacy }
        else { useCpf = false; useCnpj = false }
      }
      if (useCpf === true && useCnpj === true) {
        res.status(400).json({ error: 'Informe apenas CPF ou apenas CNPJ' })
        return
      }
      if (useCpf === true && docDigits.length !== 11) {
        res.status(400).json({ error: 'CPF inválido' })
        return
      }
      if (useCnpj === true && docDigits.length !== 14) {
        res.status(400).json({ error: 'CNPJ inválido' })
        return
      }
      const data: any = {
        name: name ?? undefined,
        email: email ?? undefined,
        phone: phone ?? undefined,
        address: address ?? undefined,
        notes: notes ?? undefined,
        status: status ?? undefined,
        dataNascimento: dataNascimento ?? undefined,
        codigoAcesso: codigoAcesso ?? undefined,
        senhaGov: senhaGov ?? undefined,
        codigoRegularize: codigoRegularize ?? undefined,
        senhaNfse: senhaNfse ?? undefined
      }
      if (useCpf === true) {
        data.cpf = docDigits
        data.cnpj = null
      } else if (useCnpj === true) {
        data.cnpj = docDigits
        data.cpf = null
      }
      const updated = await prisma.client.update({ where: { id }, data })
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