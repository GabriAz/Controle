import { google } from "googleapis";
import { Task } from "@prisma/client";

// Escopo obrigatório para ler e escrever nas tarefas
const SCOPES = ["https://www.googleapis.com/auth/tasks"];

/**
 * Retorna o cliente autenticado da Google Tasks API.
 * Requer as variáveis GOOGLE_CLIENT_EMAIL, e GOOGLE_PRIVATE_KEY.
 */
function getTasksClient() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    // A chave privada geralmente vem com quebras de linha escapadas ("\n"), precisamos restaurá-las
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!clientEmail || !privateKey) {
        console.warn("⚠️ Google Tasks credentials not found in ENV config.");
        return null;
    }

    const auth = new google.auth.JWT({ email: clientEmail, key: privateKey, scopes: SCOPES });
    return google.tasks({ version: "v1", auth });
}

export async function createGoogleTask(task: Task, assigneeName?: string | null) {
    const tasksService = getTasksClient();
    if (!tasksService) return null;

    try {
        const gTask = {
            title: `[${task.taskRef}] ${task.title}`,
            notes: `Prioridade: P${task.priority}\nResponsável: ${assigneeName || "Sem Responsável"}`,
            due: new Date(task.deadline).toISOString(),
            status: task.status === "COMPLETED" ? "completed" : "needsAction",
        };

        const response = await tasksService.tasks.insert({
            tasklist: "@default",
            requestBody: gTask,
        });

        return response.data;
    } catch (error) {
        console.error("❌ Error creating Google Task:", error);
        return null;
    }
}

export async function updateGoogleTask(taskId: string, task: Task, assigneeName?: string | null) {
    const tasksService = getTasksClient();
    if (!tasksService) return null;

    try {
        const gTask = {
            id: taskId,
            title: `[${task.taskRef}] ${task.title}`,
            notes: `Prioridade: P${task.priority}\nResponsável: ${assigneeName || "Sem Responsável"}`,
            due: new Date(task.deadline).toISOString(),
            status: task.status === "COMPLETED" ? "completed" : "needsAction",
        };

        const response = await tasksService.tasks.update({
            tasklist: "@default",
            task: taskId,
            requestBody: gTask,
        });

        return response.data;
    } catch (error) {
        console.error("❌ Error updating Google Task:", error);
        return null;
    }
}

export async function deleteGoogleTask(taskId: string) {
    const tasksService = getTasksClient();
    if (!tasksService) return null;

    try {
        await tasksService.tasks.delete({
            tasklist: "@default",
            task: taskId,
        });
        return true;
    } catch (error) {
        console.error("❌ Error deleting Google Task:", error);
        return false;
    }
}
