"use server"
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createGoogleEvent, updateGoogleEvent, deleteGoogleEvent } from '@/lib/google-calendar';
import { createGoogleTask, updateGoogleTask, deleteGoogleTask } from '@/lib/google-tasks';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendTelegramAlert } from '@/lib/telegram';

export async function createTaskAction(prevState: unknown, formData: FormData) {
    console.log(`\n\n[ACTION TRIGGERED] => createTaskAction called at ${new Date().toISOString()} \n\n`);
    const title = formData.get('title') as string;
    const priorityStr = formData.get('priority') as string;
    const dateStr = formData.get('date') as string;
    const timeStr = formData.get('time') as string;
    const assigneeIdStr = formData.get('assigneeId') as string;

    if (!title || !priorityStr || !dateStr || !timeStr) {
        return { error: "Todos os campos são obrigatórios." };
    }

    const assigneeId = assigneeIdStr ? assigneeIdStr : null;

    const priority = parseInt(priorityStr, 10);
    const deadline = new Date(`${dateStr}T${timeStr}:00`);

    // Generate taskRef (#CTRL-102 etc)
    const lastTask = await prisma.task.findFirst({
        orderBy: { id: 'desc' }
    });
    const nextId = (lastTask?.id || 0) + 1;
    const taskRef = `#CTRL-${nextId}`;

    const session = await getServerSession(authOptions) as any;
    const currentUser = session?.user;

    if (!currentUser) {
        return { error: "Usuário não autenticado." };
    }

    let finalAssigneeId = assigneeId;
    if (currentUser.role === 'MEMBER') {
        // Members can only assign tasks to themselves
        finalAssigneeId = currentUser.id;
    }

    // Get User Name to preserve legacy text field
    let assigneeName = null;
    if (finalAssigneeId) {
        const u = await prisma.user.findUnique({ where: { id: finalAssigneeId } });
        assigneeName = u?.name || null;
    }

    try {
        const newTask = await prisma.task.create({
            data: {
                taskRef,
                title,
                priority,
                deadline,
                assignee: assigneeName,
                assigneeId: finalAssigneeId,
                createdById: currentUser.id,
                status: "PENDING"
            }
        });

        // Injeção silenciada no G-Calendar e G-Tasks
        const gEvent = await createGoogleEvent(newTask, assigneeName);
        const gTask = await createGoogleTask(newTask, assigneeName);

        let updateData: any = {};
        if (gEvent?.id) updateData.googleEventId = gEvent.id;
        if (gTask?.id) updateData.googleTaskId = gTask.id;

        const creatorName = currentUser.name || "Sistema";

        // Telegram Notification via Centralized Alert
        await sendTelegramAlert({
            task: newTask,
            type: 'CREATED',
            user: creatorName
        });

    } catch (err) {
        console.error("CreateTaskAction Error:", err);
        return { error: "Failed to create task" };
    }

    revalidatePath('/');
    return { success: true };
}

export async function fetchActiveUsers() {
    return prisma.user.findMany({
        where: { active: true },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' }
    });
}

export async function updateTask(id: number, formData: FormData) {
    const session = await getServerSession(authOptions) as any;
    const currentUser = session?.user;

    if (!currentUser) {
        return { error: "Usuário não autenticado." };
    }

    try {
        const existingTask = await prisma.task.findUnique({ where: { id } });
        if (!existingTask) return { error: "Tarefa não encontrada." };

        const title = formData.get('title') as string;
        const priorityStr = formData.get('priority') as string;
        const dateStr = formData.get('date') as string;
        const timeStr = formData.get('time') as string;

        const hasAssigneeId = formData.has('assigneeId');
        const assigneeIdStr = formData.get('assigneeId') as string;

        const hasManualAssignee = formData.has('assignee');
        const manualAssignee = formData.get('assignee') as string;

        if (!title || !priorityStr || !dateStr || !timeStr) {
            return { error: "Todos os campos core são obrigatórios." };
        }

        let finalAssigneeId = existingTask.assigneeId;
        if (hasAssigneeId) {
            const requestedId = assigneeIdStr ? assigneeIdStr : null;
            if (currentUser.role === 'MEMBER' && requestedId && requestedId !== currentUser.id) {
                return { error: "Membros só podem atribuir tarefas a si mesmos." };
            }
            finalAssigneeId = requestedId;
        }

        let finalAssigneeName = existingTask.assignee;
        if (hasManualAssignee) {
            if (currentUser.role === 'MEMBER' && manualAssignee !== existingTask.assignee) {
                // Even if they change the visual name, we might want to block it? 
                // For now, let's just allow it if we didn't block it above, 
                // but typically members shouldn't be changing names of others.
                // We already disabled the input in the UI.
                finalAssigneeName = manualAssignee;
            } else {
                finalAssigneeName = manualAssignee || null;
            }
        }

        // Sync name if ID was changed
        if (hasAssigneeId && finalAssigneeId) {
            const u = await prisma.user.findUnique({ where: { id: finalAssigneeId } });
            if (u?.name) finalAssigneeName = u.name;
        }

        const priority = parseInt(priorityStr, 10);
        const deadline = new Date(`${dateStr}T${timeStr}:00`);

        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                title,
                priority,
                deadline,
                assignee: finalAssigneeName,
                assigneeId: finalAssigneeId,
            }
        });

        if ((existingTask as any)?.googleEventId) {
            await updateGoogleEvent((existingTask as any).googleEventId, updatedTask, finalAssigneeName);
        } else {
            const gEvent = await createGoogleEvent(updatedTask, finalAssigneeName);
            if (gEvent?.id) {
                await prisma.task.update({
                    where: { id },
                    data: { googleEventId: gEvent.id } as any
                });
            }
        }

        if ((existingTask as any)?.googleTaskId) {
            await updateGoogleTask((existingTask as any).googleTaskId, updatedTask, finalAssigneeName);
        } else {
            const gTask = await createGoogleTask(updatedTask, finalAssigneeName);
            if (gTask?.id) {
                await prisma.task.update({
                    where: { id },
                    data: { googleTaskId: gTask.id } as any
                });
            }
        }

        // Telegram Notification for Update
        const session = await getServerSession(authOptions) as any;
        const editorName = session?.user?.name || "Sistema";
        const changes: string[] = [];

        if (title !== undefined && title !== existingTask.title) changes.push(`Título: ${existingTask.title} -> ${title}`);
        if (priority !== undefined && priority !== (existingTask as any).priority) changes.push(`Prioridade: P${(existingTask as any).priority} -> P${priority}`);
        if (deadline !== undefined && deadline.getTime() !== (existingTask as any).deadline.getTime()) {
            changes.push(`Prazo: ${new Date((existingTask as any).deadline).toLocaleString('pt-BR')} -> ${deadline.toLocaleString('pt-BR')}`);
        }
        if (hasAssigneeId && finalAssigneeId !== (existingTask as any).assigneeId) {
            changes.push(`Responsável: ${existingTask.assignee || 'Não atribuído'} -> ${finalAssigneeName || 'Não atribuído'}`);
        }

        if (changes.length > 0) {
            await sendTelegramAlert({
                task: updatedTask,
                type: 'UPDATED',
                user: editorName,
                changes
            });
        }

        revalidatePath('/');
        return { success: true };
    } catch (err) {
        console.error("Error updating task: ", err);
        return { error: "Failed to update task" };
    }
}

export async function toggleTaskStatus(id: number, status: string) {
    const updatedTask = await prisma.task.update({
        where: { id },
        data: { status }
    });

    if ((updatedTask as any)?.googleEventId) {
        await updateGoogleEvent((updatedTask as any).googleEventId, updatedTask, updatedTask.assignee);
    }

    const session = await getServerSession(authOptions) as any;
    const editorName = session?.user?.name || "Sistema";

    await sendTelegramAlert({
        task: updatedTask,
        type: updatedTask.status === 'COMPLETED' ? 'COMPLETED' : 'REACTIVATED',
        user: editorName
    });

    revalidatePath('/');
}

export async function snoozeTask(id: number, hoursToAdd: number) {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return;

    const newDeadline = new Date(task.deadline.getTime() + hoursToAdd * 3600000);

    // Reinicia a régua de notificações que forem atingidas pelo novo prazo (Option B - Recálculo via Reset flags)
    await prisma.task.update({
        where: { id },
        data: {
            deadline: newDeadline,
            notified30Mins: false,
            notified1Hour: false,
            notified2Hours: false,
            notified3Hours: false,
            notified1Day: false,
            notified2Days: false,
            notified3Days: false,
        }
    });

    revalidatePath('/');
}

export async function fetchPendingTasks() {
    const session = await getServerSession(authOptions) as any;
    const currentUser = session?.user;

    const where: any = {
        status: { not: "COMPLETED" },
        parentId: null
    };

    if (currentUser && currentUser.role !== 'ADMIN') {
        const user = (await prisma.user.findUnique({ where: { id: currentUser.id } })) as any;
        if (user && !user.canSeeOthersTasks) {
            where.assigneeId = currentUser.id;
        }
    }

    return await prisma.task.findMany({
        where,
        orderBy: [
            { positionOrder: 'asc' },
            { id: 'asc' }
        ],
        include: {
            Creator: { select: { name: true } },
            subtasks: {
                where: {
                    status: {
                        not: "COMPLETED"
                    }
                },
                orderBy: [
                    { positionOrder: 'asc' },
                    { id: 'asc' }
                ],
                include: {
                    Creator: { select: { name: true } }
                }
            }
        }
    });
}

export async function addSubtask(taskId: number, formData: FormData) {
    const title = formData.get('title') as string;
    if (!title?.trim()) return { error: "Título vazio" };

    try {
        const parentTask = await prisma.task.findUnique({ where: { id: taskId } });
        if (!parentTask) return { error: "Mãe não encontrada" };

        const lastTask = await prisma.task.findFirst({ orderBy: { id: 'desc' } });
        const nextId = (lastTask?.id || 0) + 1;

        const session = await getServerSession(authOptions) as any;
        const currentUser = session?.user;

        if (!currentUser) {
            return { error: "Usuário não autenticado." };
        }

        const newSubtask = await prisma.task.create({
            data: {
                taskRef: `#CTRL-${nextId}`,
                title: title.trim(),
                priority: parentTask.priority,
                deadline: parentTask.deadline,
                assignee: parentTask.assignee || "Gabriel",
                parentId: taskId,
                positionOrder: 0,
                createdById: currentUser.id
            }
        });

        await sendTelegramAlert({
            task: newSubtask,
            type: 'CREATED',
            user: currentUser.name || "Sistema",
            customMessage: `Subtarefa de: ${parentTask.title}`
        });

        revalidatePath('/');
        return { success: true };
    } catch {
        return { error: "Falha ao criar subtarefa" };
    }
}

export async function toggleSubtask(id: number, completed: boolean) {
    const updatedSubtask = await prisma.task.update({
        where: { id },
        data: { status: completed ? "COMPLETED" : "PENDING" }
    });

    const session = await getServerSession(authOptions) as any;
    const editorName = session?.user?.name || "Sistema";

    await sendTelegramAlert({
        task: updatedSubtask,
        type: completed ? 'COMPLETED' : 'REACTIVATED',
        user: editorName
    });

    revalidatePath('/');
}

export async function updateTaskPositions(updates: { id: number, position: number }[]) {
    try {
        await prisma.$transaction(
            updates.map(u =>
                prisma.task.update({
                    where: { id: u.id },
                    data: { positionOrder: u.position }
                })
            )
        );
        // We do not revalidatePath here strictly because the frontend already optimism-renders DnD, 
        // but it's safer to revalidate so other tabs sync.
        revalidatePath('/');
        return { success: true };
    } catch {
        return { error: "Drag and Drop DB Update Failed" };
    }
}

export async function deleteTask(id: number) {
    try {
        const task = await prisma.task.findUnique({ where: { id } });

        // First, forcibly delete all potential subtasks to prevent Foreign Key constraints
        // just in case the Postgres DB hasn't been migrated with ON DELETE CASCADE physically yet.
        await prisma.task.deleteMany({
            where: { parentId: id }
        });

        await prisma.task.delete({
            where: { id }
        });

        if ((task as any)?.googleTaskId) {
            await deleteGoogleTask((task as any).googleTaskId);
        }

        const session = await getServerSession(authOptions) as any;
        const editorName = session?.user?.name || "Sistema";

        if (task) {
            await sendTelegramAlert({
                task,
                type: 'DELETED',
                user: editorName
            });
        }

        revalidatePath('/');
        return { success: true };
    } catch (err) {
        console.error("Prisma error deleting task: ", err);
        return { error: "Falha ao excluir tarefa" };
    }
}

export async function fetchArchivedTasks() {
    const session = await getServerSession(authOptions) as any;
    const currentUser = session?.user;

    const where: any = {
        status: "COMPLETED",
        parentId: null
    };

    if (currentUser && currentUser.role !== 'ADMIN') {
        const user = (await prisma.user.findUnique({ where: { id: currentUser.id } })) as any;
        if (user && !user.canSeeOthersTasks) {
            where.assigneeId = currentUser.id;
        }
    }

    return await prisma.task.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: {
            Creator: { select: { name: true } },
            subtasks: {
                orderBy: { updatedAt: 'desc' },
                include: {
                    Creator: { select: { name: true } }
                }
            }
        }
    });
}

