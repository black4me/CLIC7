
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Testing connection to Supabase...')
        const count = await prisma.staff.count()
        console.log('Connection SUCCESSFUL.')
        console.log('Staff count:', count)

        const users = await prisma.staff.findMany({
            select: { email: true, role: true, isActive: true }
        })
        console.log('Staff users found:', JSON.stringify(users, null, 2))

        const admins = users.filter(u => u.role === 'admin' || u.role === 'owner')
        if (admins.length === 0) {
            console.warn('WARNING: No admin/owner accounts found!')
        } else {
            console.log('Admin accounts present:', admins.length)
        }

    } catch (e) {
        console.error('CONNECTION FAILED:', e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
