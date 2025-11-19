import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'contabiljaque.admin@gmail.com'
  const name = 'Administrador'
  const password = 'admin123'
  const rounds = Number(process.env.BCRYPT_ROUNDS || 12)
  const passwordHash = await bcrypt.hash(password, rounds)

  await prisma.user.upsert({
    where: { email },
    update: { name, role: 'ADMIN', passwordHash },
    create: { email, name, role: 'ADMIN', passwordHash }
  })
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
