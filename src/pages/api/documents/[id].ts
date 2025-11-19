import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import path from 'path'
import { storageDelete, storageIsRemote, storageReadLocal } from '@/lib/storage'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id)
  const doc = await prisma.document.findUnique({ where: { id } })
  if (!doc) {
    res.status(404).json({ error: 'Documento não encontrado' })
    return
  }

  if (req.method === 'GET') {
    if (storageIsRemote(doc.fileUrl)) {
      res.setHeader('Content-Disposition', `attachment; filename="${doc.fileName}"`)
      res.status(302).setHeader('Location', doc.fileUrl)
      res.end()
      return
    }
    const buffer = storageReadLocal(doc.fileUrl)
    if (!buffer) {
      res.status(404).json({ error: 'Arquivo não encontrado' })
      return
    }
    res.setHeader('Content-Type', doc.fileType)
    res.setHeader('Content-Disposition', `attachment; filename="${doc.fileName}"`)
    res.status(200).send(buffer)
    return
  }

  if (req.method === 'DELETE') {
    await storageDelete(doc.fileUrl)
    await prisma.document.delete({ where: { id } })
    res.status(204).end()
    return
  }

  res.status(405).json({ error: 'Método não permitido' })
}