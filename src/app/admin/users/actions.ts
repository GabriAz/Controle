"use server"

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createUser(data: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Acesso Negado. Apenas o Administrador pode criar usuários." };
  }

  const name = data.get("name") as string;
  const email = data.get("email") as string;
  const password = data.get("password") as string;
  const role = data.get("role") as string;

  if (!name || !email || !password || !role) {
    return { error: "Preencha todos os campos do formulário." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "Já existe um usuário com este e-mail." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { name, email, passwordHash, role, active: true },
    });

    return { success: true };
  } catch (error) {
    return { error: "Erro interno ao salvar no banco de dados." };
  }
}

export async function updateUser(id: string, data: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Acesso Negado. Apenas o Administrador pode editar usuários." };
  }

  const name = data.get("name") as string;
  const email = data.get("email") as string;
  const password = data.get("password") as string;
  const role = data.get("role") as string;
  const activeStr = data.get("active") as string;

  if (!name || !email || !role) {
    return { error: "Nome, Email e Role são obrigatórios." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== id) {
      return { error: "Já existe outro usuário com este e-mail." };
    }

    const updateData: any = { name, email, role };
    if (activeStr) {
      updateData.active = activeStr === "true";
    }

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return { success: true };
  } catch (error) {
    return { error: "Erro interno ao atualizar usuário." };
  }
}

export async function deleteUser(id: string, keepTasks: boolean) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return { error: "Acesso Negado. Apenas o Administrador pode excluir usuários." };
  }

  try {
    if (!keepTasks) {
      // O schema cuida de cascade se for necessário para subtasks, mas estamos apagando
      // baseado no assigneeId. Para evitar possíveis problemas com tasks parent,
      // vamos apenas deletar as tarefas atribuídas a este usuário.
      // Importante: as subtarefas desta tarefa podem não ser desse usuário, 
      // mas Prisma cuidará do cascade das subtarefas se o parent for deletado.
      await prisma.task.deleteMany({
        where: { assigneeId: id }
      });
    } else {
      await prisma.task.updateMany({
        where: { assigneeId: id },
        data: { assigneeId: null, assignee: null }
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro interno ao excluir usuário." };
  }
}
