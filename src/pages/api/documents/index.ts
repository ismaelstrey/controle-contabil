import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { storageSave } from '@/lib/storage'

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
    const buffer = Buffer.from(String(dataBase64), 'base64')
    const saved = await storageSave(String(clientId), fileName, buffer, fileType)
    const created = await prisma.document.create({
      data: {
        clientId: String(clientId),
        fileName,
        fileUrl: saved.url,
        fileType,
        fileSize: Number(fileSize)
      }
    })
    res.status(201).json(created)
    return
  }

  res.status(405).json({ error: 'Método não permitido' })
}