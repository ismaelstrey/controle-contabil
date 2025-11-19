import fs from 'fs'
import path from 'path'

function isBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

function getUploadDir(): string {
  const base = process.env.UPLOAD_DIR || './uploads'
  const abs = path.isAbsolute(base) ? base : path.join(process.cwd(), base)
  if (!fs.existsSync(abs)) fs.mkdirSync(abs, { recursive: true })
  return abs
}

export async function storageSave(clientId: string, fileName: string, buffer: Buffer, contentType: string): Promise<{ url: string }>{
  if (isBlob()) {
    const { put }: any = require('@vercel/blob')
    const key = `documents/${clientId}/${Date.now()}_${fileName}`
    const r = await put(key, buffer, {
      access: 'public',
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return { url: r.url }
  }
  const dir = getUploadDir()
  const subdir = path.join(dir, String(clientId))
  if (!fs.existsSync(subdir)) fs.mkdirSync(subdir, { recursive: true })
  const safeName = `${Date.now()}_${fileName}`
  const filePath = path.join(subdir, safeName)
  fs.writeFileSync(filePath, buffer)
  const relPath = path.relative(process.cwd(), filePath)
  return { url: relPath }
}

export async function storageDelete(fileUrl: string): Promise<void> {
  if (isBlob() && /^https?:\/\//.test(fileUrl)) {
    try {
      const { del }: any = require('@vercel/blob')
      await del(fileUrl, { token: process.env.BLOB_READ_WRITE_TOKEN })
    } catch {}
    return
  }
  const absPath = path.isAbsolute(fileUrl) ? fileUrl : path.join(process.cwd(), fileUrl)
  try {
    if (fs.existsSync(absPath)) fs.unlinkSync(absPath)
  } catch {}
}

export function storageIsRemote(fileUrl: string): boolean {
  return /^https?:\/\//.test(fileUrl)
}

export function storageReadLocal(fileUrl: string): Buffer | null {
  const absPath = path.isAbsolute(fileUrl) ? fileUrl : path.join(process.cwd(), fileUrl)
  if (!fs.existsSync(absPath)) return null
  return fs.readFileSync(absPath)
}
