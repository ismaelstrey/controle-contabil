import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { prisma } from '../src/lib/prisma'

async function main() {
  const users = await prisma.user.findMany()
  const clients = await prisma.client.findMany()
  const monthlyServices = await prisma.monthlyService.findMany()
  const annualServices = await prisma.annualService.findMany()
  const irpfEntries = await prisma.irpfEntry.findMany()
  const documents = await prisma.document.findMany()
  const companies = await prisma.company.findMany()
  const dasPeriods = await prisma.dasPeriod.findMany()

  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    data: {
      users,
      clients,
      monthlyServices,
      annualServices,
      irpfEntries,
      documents,
      companies,
      dasPeriods,
    },
  }

  const dir = join(process.cwd(), 'backups')
  try { mkdirSync(dir) } catch {}
  const file = join(dir, `dev-backup-${new Date().toISOString().replace(/[:.]/g,'-')}.json`)
  writeFileSync(file, JSON.stringify(payload, null, 2))
  console.log(`Backup salvo em: ${file}`)
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e)
  process.exit(1)
})