import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/contabiljaque?schema=public'

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ datasources: { db: { url: dbUrl } } })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma