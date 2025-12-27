
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const adminEmail = 'admin@company.com'

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    })

    if (!existingAdmin) {
        await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'System Admin',
                password: 'admin',
                role: 'admin',
                department: 'IT',
                status: 'Active',
                employeeId: 'ADM001',
                joiningDate: '2023-01-01',
                workType: 'Full-time'
            }
        })
        console.log('Default admin created')
    } else {
        console.log('Admin already exists')
    }

    // Seed default settings
    const settings = await prisma.systemSettings.findFirst()
    if (!settings) {
        await prisma.systemSettings.create({
            data: {
                id: 1,
                officeStartTime: "09:30",
                officeEndTime: "18:30",
                graceTimeMinutes: 15,
                halfDayThresholdHours: 4,
                fullDayHours: 8
            }
        })
        console.log('Default settings created')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
