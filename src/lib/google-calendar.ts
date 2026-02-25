import { google } from "googleapis";
import { Task } from "@prisma/client";

// Escopo obrigatório para ler e escrever na agenda
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

/**
 * Retorna o cliente autenticado da Google Calendar API.
 * Requer as variáveis GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY e GOOGLE_CALENDAR_ID.
 */
function getCalendarClient() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    // A chave privada geralmente vem com quebras de linha escapadas ("\n"), precisamos restaurá-las
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!clientEmail || !privateKey) {
        console.warn("⚠️ Google Calendar credentials not found in ENV config.");
        return null;
    }

    const auth = new google.auth.JWT({ email: clientEmail, key: privateKey, scopes: SCOPES });
    return google.calendar({ version: "v3", auth });
}

export async function createGoogleEvent(task: Task, assigneeName?: string | null) {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const calendar = getCalendarClient();

    if (!calendar || !calendarId) return null;

    try {
        const event = {
            summary: `[${task.taskRef}] ${task.title}`,
            description: `Prioridade: P${task.priority}\nResponsável: ${assigneeName || "Sem Responsável"}`,
            start: {
                dateTime: new Date(task.createdAt).toISOString(),
                timeZone: "America/Sao_Paulo",
            },
            end: {
                dateTime: new Date(task.deadline).toISOString(),
                timeZone: "America/Sao_Paulo",
            },
        };

        const response = await calendar.events.insert({
            calendarId,
            requestBody: event,
        });

        return response.data;
    } catch (error) {
        console.error("❌ Error creating Google Calendar event:", error);
        return null;
    }
}

export async function updateGoogleEvent(eventId: string, task: Task, assigneeName?: string | null) {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const calendar = getCalendarClient();
    if (!calendar || !calendarId) return null;

    try {
        const event = {
            summary: `[${task.taskRef}] ${task.title}`,
            description: `Prioridade: P${task.priority}\nResponsável: ${assigneeName || "Sem Responsável"}\nStatus: ${task.status}`,
            start: {
                dateTime: new Date(task.createdAt).toISOString(),
                timeZone: "America/Sao_Paulo",
            },
            end: {
                dateTime: new Date(task.deadline).toISOString(),
                timeZone: "America/Sao_Paulo",
            },
        };

        const response = await calendar.events.update({
            calendarId,
            eventId,
            requestBody: event,
        });

        return response.data;
    } catch (error) {
        console.error("❌ Error updating Google Calendar event:", error);
        return null;
    }
}

export async function deleteGoogleEvent(eventId: string) {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const calendar = getCalendarClient();
    if (!calendar || !calendarId) return null;

    try {
        await calendar.events.delete({
            calendarId,
            eventId,
        });
        return true;
    } catch (error) {
        console.error("❌ Error deleting Google Calendar event:", error);
        return false;
    }
}
