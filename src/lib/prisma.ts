import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Declare global type for hot reload
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool)

// Initialize PrismaClient with adapter (required for Prisma 7)
function createPrismaClient(): PrismaClient {
  return new PrismaClient({ adapter })
}

// Use existing global instance or create new one
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Store in global for hot reload preservation
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Export connectToDatabase for compatibility with existing code
export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    return prisma
  } catch (error) {
    console.error('❌ Database connection error:', error)
    throw error
  }
}

// Export disconnect function for cleanup
export async function disconnectFromDatabase() {
  await prisma.$disconnect()
  await pool.end()
  console.log('Database disconnected')
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { healthy: true, timestamp: new Date().toISOString() }
  } catch (error) {
    return { healthy: false, error: (error as Error).message }
  }
}

// Get connection status
export function getConnectionStatus() {
  return { connected: true, provider: 'postgresql' }
}
