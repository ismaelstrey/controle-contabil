import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

function getUploadDir() {
  const base = process.env.UPLOAD_DIR || './uploads'
  const abs = path.isAbsolute(base) ? base : path.join(process.cwd(), base)
  if (!fs.existsSync(abs)) fs.mkdirSync(abs, { recursive: true })
  return abs
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { clientId } = req.query
    const where: any = {}
    if (clientId) where.clientId = String(clientId)
    const data = await prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } })
    res.status(200).json(data)
    return
  }

  if (req.method === 'POST') {
    const { clientId, fileName, fileType, fileSize, dataBase64 } = req.body || {}
    if (!clientId || !fileName || !fileType || !fileSize || !dataBase64) {
      res.status(400).json({ error: 'Dados de upload inválidos' })
      return
    }
    const client = await prisma.client.findUnique({ where: { id: String(clientId) } })
    if (!client) {
      res.status(404).json({ error: 'Cliente não encontrado' })
      return
    }
    const dir = getUploadDir()
    const subdir = path.join(dir, String(clientId))
    if (!fs.existsSync(subdir)) fs.mkdirSync(subdir, { recursive: true })
    const safeName = `${Date.now()}_${fileName}`
    const filePath = path.join(subdir, safeName)
    const buffer = Buffer.from(String(dataBase64), 'base64')
    fs.writeFileSync(filePath, buffer)
    const relPath = path.relative(process.cwd(), filePath)
    const created = await prisma.document.create({
      data: {
        clientId: String(clientId),
        fileName,
        fileUrl: relPath,
        fileType,
        fileSize: Number(fileSize)
      }
    })
    res.status(201).json(created)
    return
  }

  res.status(405).json({ error: 'Método não permitido' })
}