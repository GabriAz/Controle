"use server"
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createGoogleEvent, updateGoogleEvent, deleteGoogleEvent } from '@/lib/google-calendar';
import { createGoogleTask, updateGoogleTask, deleteGoogleTask } from '@/lib/google-tasks';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createTaskAction(prevState: unknown, formData: FormData) {
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

    // Generate taskRef (#ANT-102 etc)
    const lastTask = await prisma.task.findFirst({
        orderBy: { id: 'desc' }
    });
    const nextId = (lastTask?.id || 0) + 1;
    const taskRef = `#ANT-${nextId}`;

    // Get User Name to preserve legacy text field
    let assigneeName = null;
    if (assigneeId) {
        const u = await prisma.user.findUnique({ where: { id: assigneeId } });
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
                assigneeId: assigneeId,
                status: "PENDING"
            }
        });

        // Injeção silenciada no G-Calendar e G-Tasks
        const gEvent = await createGoogleEvent(newTask, assigneeName);
        const gTask = await createGoogleTask(newTask, assigneeName);

        let updateData: any = {};
        if (gEvent?.id) updateData.googleEventId = gEvent.id;
        if (gTask?.id) updateData.googleTaskId = gTask.id;

        if (Object.keys(updateData).length > 0) {
            await prisma.task.update({
                where: { id: newTask.id },
                data: updateData
            });
        }

        // Telegram Notification on Creation
        const session = await getServerSession(authOptions) as any;
        const creatorName = session?.user?.name || "Sistema";
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (botToken && chatId) {
            try {
                console.log(`[TELEGRAM DEBUG] Attempting to send creation alert. Token starts with: ${botToken.substring(0, 5)}...`);
                const formattedDate = new Date(deadline).toLocaleString('pt-BR');
                const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `🆕 *Nova Tarefa Adicionada*\n\n*${taskRef}*: ${title}\n*Criada por*: ${creatorName}\n*Responsável*: ${assigneeName || 'Não atribuído'}\n*Prazo*: ${formattedDate}`,
                        parse_mode: 'Markdown'
                    })
                });
                const responseData = await response.json();
                console.log(`[TELEGRAM DEBUG] API Response Status: ${response.status}`, responseData);
            } catch (e) {
                console.error("[TELEGRAM DEBUG] Fetch Failed to send creation alert", e);
            }
        } else {
            console.log(`[TELEGRAM DEBUG] Missing Env! botToken: ${!!botToken}, chatId: ${!!chatId}`);
        }

        revalidatePath('/');
        return { success: true };
    } catch (err) {
        console.error("CreateTaskAction Error:", err);
        return { error: "Failed to create task" };
    }
}

export async function fetchActiveUsers() {
    return prisma.user.findMany({
        where: { active: true },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' }
    });
}

export async function updateTask(id: number, formData: FormData) {
    const title = formData.get('title') as string;
    const priorityStr = formData.get('priority') as string;
    const dateStr = formData.get('date') as string;
    const timeStr = formData.get('time') as string;
    const assigneeIdStr = formData.get('assigneeId') as string;
    const manualAssignee = formData.get('assignee') as string;

    if (!title || !priorityStr || !dateStr || !timeStr) {
        return { error: "Todos os campos são obrigatórios." };
    }

    const assigneeId = assigneeIdStr ? assigneeIdStr : null;

    // Get User Name to preserve legacy text field if ID is passed
    let assigneeName = manualAssignee || null;
    if (assigneeId) {
        const u = await prisma.user.findUnique({ where: { id: assigneeId } });
        if (u?.name) assigneeName = u.name;
    }

    const priority = parseInt(priorityStr, 10);
    const deadline = new Date(`${dateStr}T${timeStr}:00`);

    try {
        const existingTask = await prisma.task.findUnique({ where: { id } });

        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                title,
                priority,
                deadline,
                assignee: assigneeName,
                assigneeId: assigneeId,
            }
        });

        if ((existingTask as any)?.googleEventId) {
            await updateGoogleEvent((existingTask as any).googleEventId, updatedTask, assigneeName);
        } else {
            const gEvent = await createGoogleEvent(updatedTask, assigneeName);
            if (gEvent?.id) {
                await prisma.task.update({
                    where: { id },
                    data: { googleEventId: gEvent.id } as any
                });
            }
        }

        if ((existingTask as any)?.googleTaskId) {
            await updateGoogleTask((existingTask as any).googleTaskId, updatedTask, assigneeName);
        } else {
            const gTask = await createGoogleTask(updatedTask, assigneeName);
            if (gTask?.id) {
                await prisma.task.update({
                    where: { id },
                    data: { googleTaskId: gTask.id } as any
                });
            }
        }
        revalidatePath('/');
        return { success: true };
    } catch {
        return { error: "Failed to update task" };
    }
}

export async function toggleTaskStatus(id: number, status: string) {
    const updatedTask = await prisma.task.update({
        where: { id },
        data: { status }
    });

    if ((updatedTask as any)?.googleTaskId) {
        await updateGoogleTask((updatedTask as any).googleTaskId, updatedTask, updatedTask.assignee);
    }
    if ((updatedTask as any)?.googleEventId) {
        await updateGoogleEvent((updatedTask as any).googleEventId, updatedTask, updatedTask.assignee);
    }

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
    return await prisma.task.findMany({
        where: {
            status: {
                not: "COMPLETED"
            },
            parentId: null
        },
        orderBy: [
            { positionOrder: 'asc' },
            { id: 'asc' }
        ],
        include: {
            subtasks: {
                where: {
                    status: {
                        not: "COMPLETED"
                    }
                },
                orderBy: [
                    { positionOrder: 'asc' },
                    { id: 'asc' }
                ]
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

        await prisma.task.create({
            data: {
                taskRef: `#ANT-${nextId}`,
                title: title.trim(),
                priority: parentTask.priority,
                deadline: parentTask.deadline,
                assignee: parentTask.assignee || "Gabriel",
                parentId: taskId,
                positionOrder: 0
            }
        });
        revalidatePath('/');
        return { success: true };
    } catch {
        return { error: "Falha ao criar subtarefa" };
    }
}

export async function toggleSubtask(id: number, completed: boolean) {
    await prisma.task.update({
        where: { id },
        data: { status: completed ? "COMPLETED" : "PENDING" }
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

        if ((task as any)?.googleEventId) {
            await deleteGoogleEvent((task as any).googleEventId);
        }
        if ((task as any)?.googleTaskId) {
            await deleteGoogleTask((task as any).googleTaskId);
        }
        revalidatePath('/');
        return { success: true };
    } catch (err) {
        console.error("Prisma error deleting task: ", err);
        return { error: "Falha ao excluir tarefa" };
    }
}

export async function fetchArchivedTasks() {
    return await prisma.task.findMany({
        where: {
            status: "COMPLETED",
            parentId: null
        },
        orderBy: { updatedAt: 'desc' },
        include: {
            subtasks: {
                orderBy: { updatedAt: 'desc' }
            }
        }
    });
}

