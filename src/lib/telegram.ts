import { Task } from "@prisma/client";

export async function sendTelegramAlert({
    task,
    type,
    user,
    customMessage,
    changes
}: {
    task: Task;
    type: 'CREATED' | 'UPDATED' | 'DELETED' | 'COMPLETED' | 'REACTIVATED' | 'REMINDER' | 'OVERDUE' | 'SNOOZED';
    user?: string;
    customMessage?: string;
    changes?: string[];
}) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.error("[TELEGRAM] Missing Bot Token or Chat ID");
        return;
    }

    let emoji = "🔔";
    let title = "Notificação de Sistema";

    switch (type) {
        case 'CREATED':
            emoji = "🆕";
            title = "Nova Tarefa Adicionada";
            break;
        case 'UPDATED':
            emoji = "📝";
            title = "Tarefa Atualizada";
            break;
        case 'DELETED':
            emoji = "🗑️";
            title = "Tarefa Excluída";
            break;
        case 'COMPLETED':
            emoji = "✅";
            title = "Tarefa Concluída";
            break;
        case 'REACTIVATED':
            emoji = "🔄";
            title = "Tarefa Reativada";
            break;
        case 'REMINDER':
            emoji = "⏰";
            title = "Lembrete de Prazo";
            break;
        case 'OVERDUE':
            emoji = "🚨";
            title = "Tarefa ATRASADA";
            break;
        case 'SNOOZED':
            emoji = "💤";
            title = "Tarefa Adiada (Snooze)";
            break;
    }

    const formattedDate = task.deadline ? new Date(task.deadline).toLocaleString('pt-BR') : 'N/A';

    let text = `${emoji} *${title}*\n\n`;
    text += `*${task.taskRef}*: ${task.title}\n`;

    if (user) text += `*Por*: ${user}\n`;
    if (task.assignee) text += `*Responsável*: ${task.assignee}\n`;

    if (type !== 'DELETED') {
        text += `*Prazo*: ${formattedDate}\n`;
        text += `*Prioridade*: P${task.priority}\n`;
    }

    if (changes && changes.length > 0) {
        text += `\n*Alterações*:\n${changes.map(c => `• ${c}`).join('\n')}\n`;
    }

    if (customMessage) {
        text += `\n_${customMessage}_`;
    }

    try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            })
        });
    } catch (e) {
        console.error("[TELEGRAM] Fetch error:", e);
    }
}
