import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting to Hostinger MySQL...");
        const adminEmail = 'admin@gabrielazevedo.com.br';

        // 1. Check/Create Admin
        const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (!existing) {
            console.log("Creating Admin user...");
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await prisma.user.create({
                data: {
                    name: 'Gabriel',
                    email: adminEmail,
                    passwordHash: hashedPassword,
                    role: 'ADMIN',
                    active: true,
                },
            });
            console.log("✅ Admin created!");
        } else {
            console.log("⚡ Admin already exists.");
        }

        // 2. List tasks
        const tasks = await prisma.task.findMany();
        console.log("Success! Found tasks in database:", tasks.length);
    } catch (e) {
        console.error("Prisma Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
