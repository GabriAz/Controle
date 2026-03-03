import { PrismaClient } from "@prisma/client";

// Ensure system timezone is set to Brazil/Sao Paulo
process.env.TZ = 'America/Sao_Paulo';

const prismaClientSingleton = () => {
    return new PrismaClient();
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
