import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Contas Que",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "admin@gabrielazevedo.com.br" },
                password: { label: "Senha", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Credenciais inválidas");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || user.active === false) {
                    throw new Error("Usuário não encontrado ou inativo");
                }

                const passwordsMatch = await bcrypt.compare(credentials.password, user.passwordHash);

                if (!passwordsMatch) {
                    throw new Error("Senha incorreta");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],
    session: { strategy: "jwt" as const },
    callbacks: {
        async jwt({ token, user }: { token: any, user: any }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login", // Redirecionador Nativo pra Pág Personalizada
    },
    secret: process.env.NEXTAUTH_SECRET || "controle_super_secret_dev_key_123",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
