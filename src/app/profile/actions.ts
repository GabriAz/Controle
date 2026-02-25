"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function updateProfileAction(formData: FormData) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return { error: "Não autorizado." };
    }

    const name = formData.get("name") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { error: "Usuário não encontrado." };

        let dataToUpdate: any = { name };

        // Processo de troca de senha
        if (newPassword || currentPassword) {
            if (!currentPassword) {
                return { error: "A senha atual é obrigatória para trocar a senha." };
            }
            if (newPassword !== confirmPassword) {
                return { error: "As novas senhas não coincidem." };
            }

            const passwordsMatch = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!passwordsMatch) {
                return { error: "Senha atual incorreta." };
            }

            if (newPassword.length < 6) {
                return { error: "A nova senha deve ter pelo menos 6 caracteres." };
            }

            dataToUpdate.passwordHash = await bcrypt.hash(newPassword, 10);
        }

        await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate
        });

        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Erro interno ao atualizar perfil." };
    }
}
