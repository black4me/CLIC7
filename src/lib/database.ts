/**
 * Database Connection - PostgreSQL with Prisma
 * Database Layer Implementation for CLIC7 Platform
 * Uses PrismaClient from prisma.ts with PostgreSQL adapter
 */

import { prisma } from './prisma'
import type { PrismaClient } from '@prisma/client'

// Track connection state
let isConnected = false
let connectionAttempts = 0
const MAX_CONNECTION_ATTEMPTS = 5

/**
 * Connect to PostgreSQL database via Prisma
 */
export async function connectToDatabase(): Promise<PrismaClient> {
  if (isConnected) {
    console.log('[DB] Using existing database connection')
    return prisma
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please set it to your PostgreSQL connection string.'
    )
  }

  try {
    connectionAttempts++
    console.log(`[DB] Connecting to PostgreSQL (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})...`)

    // Test the connection with a simple query
    await prisma.$queryRaw`SELECT 1`

    isConnected = true
    connectionAttempts = 0
    console.log('[DB] PostgreSQL connected successfully via Supabase')

    return prisma
  } catch (error) {
    console.error('[DB] PostgreSQL connection failed:', error)
    isConnected = false

    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      console.log(`[DB] Retrying connection in 5 seconds...`)
      await new Promise(resolve => setTimeout(resolve, 5000))
      return connectToDatabase()
    }

    throw new Error(
      `Failed to connect to PostgreSQL after ${MAX_CONNECTION_ATTEMPTS} attempts. ` +
      'Please check your DATABASE_URL and ensure PostgreSQL is running.'
    )
  }
}

/**
 * Disconnect from database
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (!isConnected) {
    return
  }

  try {
    await prisma.$disconnect()
    isConnected = false
    console.log('[DB] PostgreSQL disconnected successfully')
  } catch (error) {
    console.error('[DB] Error disconnecting from PostgreSQL:', error)
    throw error
  }
}

/**
 * Check database health
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean
  latency: number
  error?: string
}> {
  const startTime = Date.now()

  try {
    if (!isConnected) {
      await connectToDatabase()
    }

    // Test with a simple query
    await prisma.$queryRaw`SELECT 1`

    const latency = Date.now() - startTime

    return {
      healthy: true,
      latency,
    }
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get database connection status
 */
export function getConnectionStatus(): {
  isConnected: boolean
  provider: string
  url?: string
} {
  return {
    isConnected,
    provider: 'postgresql',
    url: process.env.DATABASE_URL ? '[REDACTED]' : undefined,
  }
}

// Export prisma client for direct access if needed
export { prisma }
