import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { normalizeCnpj, parseCurrencyBR, parseDateBR } from '@/lib/company-utils'

const rateMap: Record<string, number[]> = {}

function getSessionId(req: NextApiRequest): string | null {
  const cookie = req.headers.cookie || ''
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='))
  if (!match) return null
  return match.substring('session='.length)
}

function rateLimitOk(userId: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now()
  const arr = rateMap[userId] || []
  const recent = arr.filter(ts => now - ts < windowMs)
  if (recent.length >= limit) {
    rateMap[userId] = recent
    return false
  }
  recent.push(now)
  rateMap[userId] = recent
  return true
}

async function callInfoSimples(cnpj: string, periodo?: string, data_pagamento?: string) {
  const token = process.env.INFOSIMPLES_TOKEN || ''
  const body: any = { token, cnpj }
  if (periodo) body.periodo = periodo
  if (data_pagamento) body.data_pagamento = data_pagamento
  const r = await fetch('https://api.infosimples.com/api/v2/consultas/receita-federal/simples-das', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const json = await r.json()
  return json
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }
  const id = String(req.query.id)
  const { periodo, data_pagamento, force } = req.body || {}
  const userId = getSessionId(req)
  if (!userId) {
    res.status(401).json({ error: 'Não autenticado' })
    return
  }
  if (!rateLimitOk(userId)) {
    res.status(429).json({ error: 'Muitas solicitações. Tente novamente em instantes.' })
    return
  }
  const company = await prisma.company.findUnique({ where: { id } })
  if (!company) {
    res.status(404).json({ error: 'Empresa não encontrada' })
    return
  }
  if (company.userId !== userId) {
    res.status(403).json({ error: 'Acesso negado' })
    return
  }
  const cnpj = normalizeCnpj(company.cnpj)
  if (!cnpj || cnpj.length !== 14) {
    res.status(400).json({ error: 'CNPJ inválido' })
    return
  }
  if (periodo) {
    const p = String(periodo)
    if (!/^\d{6}$/.test(p)) {
      res.status(400).json({ error: 'periodo inválido' })
      return
    }
  }
  const resp = await callInfoSimples(cnpj, periodo, data_pagamento)
  if (!resp || resp.code !== 200) {
    const msg = resp?.code_message || 'Falha na consulta'
    res.status(400).json({ error: msg })
    return
  }
  const data = Array.isArray(resp.data) ? resp.data[0] : null
  if (!data || !data.periodos) {
    res.status(200).json({ inserted: 0, total: 0 })
    return
  }
  let inserted = 0
  const entries = Object.entries(data.periodos as Record<string, any>)
  for (const [per, v] of entries) {
    if (!force) {
      const exists = await prisma.dasPeriod.findUnique({ where: { companyId_periodo: { companyId: company.id, periodo: per } } })
      if (exists) continue
    }
    await prisma.dasPeriod.upsert({
      where: { companyId_periodo: { companyId: company.id, periodo: per } },
      update: {
        situacao: v.situacao || null,
        apurado: v.apurado || null,
        principal: parseCurrencyBR(v.principal),
        multas: parseCurrencyBR(v.multas),
        juros: parseCurrencyBR(v.juros),
        total: parseCurrencyBR(v.total),
        dataVencimento: parseDateBR(v.data_vencimento) || undefined,
        dataAcolhimento: parseDateBR(v.data_acolhimento) || undefined,
        dataPagamento: parseDateBR(v.data_pagamento) || undefined,
        icms: parseCurrencyBR(v.icms),
        iss: parseCurrencyBR(v.iss),
        inss: parseCurrencyBR(v.inss),
        numeroApuracao: v.numero_apuracao || null,
        numeroDas: v.numero_das || null,
        codigoBarras: v.codigo_barras_das || null,
        urlDas: v.url_das || null,
        mensagem: v.mensagem || null
      },
      create: {
        companyId: company.id,
        periodo: per,
        situacao: v.situacao || null,
        apurado: v.apurado || null,
        principal: parseCurrencyBR(v.principal),
        multas: parseCurrencyBR(v.multas),
        juros: parseCurrencyBR(v.juros),
        total: parseCurrencyBR(v.total),
        dataVencimento: parseDateBR(v.data_vencimento) || undefined,
        dataAcolhimento: parseDateBR(v.data_acolhimento) || undefined,
        dataPagamento: parseDateBR(v.data_pagamento) || undefined,
        icms: parseCurrencyBR(v.icms),
        iss: parseCurrencyBR(v.iss),
        inss: parseCurrencyBR(v.inss),
        numeroApuracao: v.numero_apuracao || null,
        numeroDas: v.numero_das || null,
        codigoBarras: v.codigo_barras_das || null,
        urlDas: v.url_das || null,
        mensagem: v.mensagem || null
      }
    })
    inserted++
  }
  await prisma.company.update({ where: { id: company.id }, data: { lastSyncAt: new Date() } })
  res.status(200).json({ inserted, total: entries.length })
}
