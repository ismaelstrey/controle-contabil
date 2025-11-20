// @ts-ignore
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const accelerateUrl = process.env.PRISMA_ACCELERATE_URL

const prismaClient = (() => {
  if (accelerateUrl) {
    return new PrismaClient({ accelerateUrl })
  }
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/contabiljaque?schema=public'
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
})()

export const prisma = globalForPrisma.prisma || prismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma