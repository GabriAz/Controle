import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    const adminEmail = 'admin@gabrielazevedo.com.br';

    try {
        const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

        if (!existing) {
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
            return NextResponse.json({ message: '✅ Admin seed created successfully.' });
        }

        return NextResponse.json({ message: '⚡ Admin already exists.' });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
