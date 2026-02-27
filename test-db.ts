import { prisma } from './src/lib/prisma';

async function main() {
    try {
        const tasks = await prisma.task.findMany();
        console.log("Success! Found tasks:", tasks.length);
    } catch (e) {
        console.error("Prisma Error:", e);
    }
}

main();
