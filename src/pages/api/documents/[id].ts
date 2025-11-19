import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id)
  const doc = await prisma.document.findUnique({ where: { id } })
  if (!doc) {
    res.status(404).json({ error: 'Documento não encontrado' })
    return
  }

  if (req.method === 'GET') {
    const absPath = path.isAbsolute(doc.fileUrl) ? doc.fileUrl : path.join(process.cwd(), doc.fileUrl)
    if (!fs.existsSync(absPath)) {
      res.status(404).json({ error: 'Arquivo não encontrado' })
      return
    }
    const buffer = fs.readFileSync(absPath)
    res.setHeader('Content-Type', doc.fileType)
    res.setHeader('Content-Disposition', `attachment; filename="${doc.fileName}"`)
    res.status(200).send(buffer)
    return
  }

  if (req.method === 'DELETE') {
    const absPath = path.isAbsolute(doc.fileUrl) ? doc.fileUrl : path.join(process.cwd(), doc.fileUrl)
    try {
      if (fs.existsSync(absPath)) fs.unlinkSync(absPath)
    } catch {}
    await prisma.document.delete({ where: { id } })
    res.status(204).end()
    return
  }

  res.status(405).json({ error: 'Método não permitido' })
}