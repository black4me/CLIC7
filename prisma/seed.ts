import 'dotenv/config'
import { PrismaClient, StaffRole } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user with 2FA enabled (passwordless login)
  const adminEmail = 'clickstore.om@gmail.com'
  
  const admin = await prisma.staff.upsert({
    where: { email: adminEmail },
    update: {
      role: StaffRole.owner,
      isActive: true,
      twoFactorEnabled: true,
      password: null, // Passwordless login - removed for security
      fullName: 'CLIC7 Store Owner',
    },
    create: {
      email: adminEmail,
      fullName: 'CLIC7 Store Owner',
      password: null, // Passwordless - no password stored
      role: StaffRole.owner,
      isActive: true,
      twoFactorEnabled: true,
      twoFactorSecret: null, // Will be generated on first login
      isLocked: false,
      loginAttempts: 0,
    },
  })

  console.log('✅ Admin user created/updated:', admin.email)
  console.log('🔐 Role:', admin.role)
  console.log('📱 2FA Enabled:', admin.twoFactorEnabled)
  console.log('')
  console.log('⚠️  NOTE: This admin uses passwordless login with OTP/2FA')
  console.log('   No password is stored in the database for maximum security')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
