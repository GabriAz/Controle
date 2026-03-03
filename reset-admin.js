const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@gabrielazevedo.com.br';
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            passwordHash: hashedPassword,
            active: true,
            role: 'ADMIN'
        },
        create: {
            name: 'Gabriel',
            email: adminEmail,
            passwordHash: hashedPassword,
            role: 'ADMIN',
            active: true
        }
    });

    console.log('User created/updated:', user.email);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
