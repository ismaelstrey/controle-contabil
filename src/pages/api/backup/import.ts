import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

let Ratelimit: any = null
let Redis: any = null
try {
  Ratelimit = require('@upstash/ratelimit').Ratelimit
  Redis = require('@upstash/redis').Redis
} catch {}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
const redis = redisUrl && redisToken && Redis ? new Redis({ url: redisUrl, token: redisToken }) : null
const ratelimit = redis && Ratelimit ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(2, '1 m') }) : null

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}

function getSessionId(req: NextApiRequest): string | null {
  const cookie = req.headers.cookie || ''
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('session='))
  if (!match) return null
  return match.substring('session='.length)
}

async function rateLimitOk(userId: string): Promise<boolean> {
  if (ratelimit) {
    const { success } = await ratelimit.limit(`backup-import:${userId}`)
    return success
  }
  return true
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }
  const id = getSessionId(req)
  if (!id) {
    res.status(401).json({ error: 'Não autenticado' })
    return
  }
  const admin = await prisma.user.findUnique({ where: { id } })
  if (!admin || admin.role !== 'ADMIN') {
    res.status(403).json({ error: 'Acesso negado' })
    return
  }
  if (!(await rateLimitOk(id))) {
    res.status(429).json({ error: 'Muitas solicitações. Tente novamente.' })
    return
  }
  const { mode = 'merge', data, version } = req.body || {}
  if (!data || !version) {
    res.status(400).json({ error: 'Backup inválido' })
    return
  }
  if (mode !== 'merge' && mode !== 'replace') {
    res.status(400).json({ error: 'Modo inválido' })
    return
  }
  try {
    if (mode === 'replace') {
      await prisma.$transaction([
        prisma.dasPeriod.deleteMany({}),
        prisma.document.deleteMany({}),
        prisma.irpfEntry.deleteMany({}),
        prisma.monthlyService.deleteMany({}),
        prisma.annualService.deleteMany({}),
        prisma.client.deleteMany({}),
        prisma.company.deleteMany({}),
        prisma.user.deleteMany({}),
      ])
    }
    if (Array.isArray(data.users)) {
      for (const u of data.users) {
        await prisma.user.upsert({
          where: { id: u.id },
          update: { email: u.email, name: u.name, role: u.role, passwordHash: u.passwordHash ?? null },
          create: { id: u.id, email: u.email, name: u.name, role: u.role, passwordHash: u.passwordHash ?? null }
        })
      }
    }
    if (Array.isArray(data.companies)) {
      for (const c of data.companies) {
        await prisma.company.upsert({
          where: { id: c.id },
          update: { userId: c.userId, cnpj: c.cnpj, razaoSocial: c.razaoSocial ?? null, tipoEmpresa: c.tipoEmpresa ?? null, porte: c.porte ?? null, regimeTributario: c.regimeTributario ?? null, cnaePrincipal: c.cnaePrincipal ?? null, lastSyncAt: c.lastSyncAt ?? null },
          create: { id: c.id, userId: c.userId, cnpj: c.cnpj, razaoSocial: c.razaoSocial ?? null, tipoEmpresa: c.tipoEmpresa ?? null, porte: c.porte ?? null, regimeTributario: c.regimeTributario ?? null, cnaePrincipal: c.cnaePrincipal ?? null, lastSyncAt: c.lastSyncAt ?? null }
        })
      }
    }
    if (Array.isArray(data.clients)) {
      for (const c of data.clients) {
        const digits = (v: any) => String(v || '').replace(/\D/g, '')
        const cpfDigits = digits(c.cpf)
        const cnpjDigits = digits(c.cnpj)
        let doc = cpfDigits || cnpjDigits || digits(c.cpfCnpj)
        const isCpf = doc.length === 11
        const isCnpj = doc.length === 14
        await prisma.client.upsert({
          where: { id: c.id },
          update: {
            userId: c.userId,
            name: c.name,
            email: c.email,
            cpfCnpj: doc,
            cpf: isCpf ? doc : null,
            cnpj: isCnpj ? doc : null,
            phone: c.phone ?? null,
            address: c.address ?? null,
            status: c.status,
            notes: c.notes ?? null,
            dataNascimento: c.dataNascimento ?? null,
            codigoAcesso: c.codigoAcesso ?? null,
            senhaGov: c.senhaGov ?? null,
            codigoRegularize: c.codigoRegularize ?? null,
            senhaNfse: c.senhaNfse ?? null
          },
          create: {
            id: c.id,
            userId: c.userId,
            name: c.name,
            email: c.email,
            cpfCnpj: doc,
            cpf: isCpf ? doc : null,
            cnpj: isCnpj ? doc : null,
            phone: c.phone ?? null,
            address: c.address ?? null,
            status: c.status,
            notes: c.notes ?? null,
            dataNascimento: c.dataNascimento ?? null,
            codigoAcesso: c.codigoAcesso ?? null,
            senhaGov: c.senhaGov ?? null,
            codigoRegularize: c.codigoRegularize ?? null,
            senhaNfse: c.senhaNfse ?? null
          }
        })
      }
    }
    if (Array.isArray(data.monthlyServices)) {
      for (const m of data.monthlyServices) {
        await prisma.monthlyService.upsert({
          where: { id: m.id },
          update: { clientId: m.clientId, tipoGuia: m.tipoGuia ?? null, regularizacao: m.regularizacao ?? null, situacao: m.situacao ?? null, referenceMonth: m.referenceMonth ?? null },
          create: { id: m.id, clientId: m.clientId, tipoGuia: m.tipoGuia ?? null, regularizacao: m.regularizacao ?? null, situacao: m.situacao ?? null, referenceMonth: m.referenceMonth ?? null }
        })
      }
    }
    if (Array.isArray(data.annualServices)) {
      for (const a of data.annualServices) {
        await prisma.annualService.upsert({
          where: { id: a.id },
          update: { clientId: a.clientId, type: a.type ?? null, observation: a.observation ?? null, year: a.year ?? null },
          create: { id: a.id, clientId: a.clientId, type: a.type ?? null, observation: a.observation ?? null, year: a.year ?? null }
        })
      }
    }
    if (Array.isArray(data.irpfEntries)) {
      for (const i of data.irpfEntries) {
        await prisma.irpfEntry.upsert({
          where: { id: i.id },
          update: { clientId: i.clientId ?? null, sequenceNumber: i.sequenceNumber ?? null, name: i.name, cpf: i.cpf, year: i.year ?? null },
          create: { id: i.id, clientId: i.clientId ?? null, sequenceNumber: i.sequenceNumber ?? null, name: i.name, cpf: i.cpf, year: i.year ?? null }
        })
      }
    }
    if (Array.isArray(data.documents)) {
      for (const d of data.documents) {
        await prisma.document.upsert({
          where: { id: d.id },
          update: { clientId: d.clientId, fileName: d.fileName, fileUrl: d.fileUrl, fileType: d.fileType, fileSize: d.fileSize },
          create: { id: d.id, clientId: d.clientId, fileName: d.fileName, fileUrl: d.fileUrl, fileType: d.fileType, fileSize: d.fileSize }
        })
      }
    }
    if (Array.isArray(data.dasPeriods)) {
      for (const p of data.dasPeriods) {
        await prisma.dasPeriod.upsert({
          where: { companyId_periodo: { companyId: p.companyId, periodo: p.periodo } },
          update: { situacao: p.situacao ?? null, apurado: p.apurado ?? null, principal: p.principal ?? null, multas: p.multas ?? null, juros: p.juros ?? null, total: p.total ?? null, dataVencimento: p.dataVencimento ?? null, dataAcolhimento: p.dataAcolhimento ?? null, dataPagamento: p.dataPagamento ?? null, icms: p.icms ?? null, iss: p.iss ?? null, inss: p.inss ?? null, numeroApuracao: p.numeroApuracao ?? null, numeroDas: p.numeroDas ?? null, codigoBarras: p.codigoBarras ?? null, urlDas: p.urlDas ?? null, mensagem: p.mensagem ?? null },
          create: { id: p.id, companyId: p.companyId, periodo: p.periodo, situacao: p.situacao ?? null, apurado: p.apurado ?? null, principal: p.principal ?? null, multas: p.multas ?? null, juros: p.juros ?? null, total: p.total ?? null, dataVencimento: p.dataVencimento ?? null, dataAcolhimento: p.dataAcolhimento ?? null, dataPagamento: p.dataPagamento ?? null, icms: p.icms ?? null, iss: p.iss ?? null, inss: p.inss ?? null, numeroApuracao: p.numeroApuracao ?? null, numeroDas: p.numeroDas ?? null, codigoBarras: p.codigoBarras ?? null, urlDas: p.urlDas ?? null, mensagem: p.mensagem ?? null }
        })
      }
    }
    res.status(200).json({ ok: true })
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Falha ao importar backup' })
  }
}