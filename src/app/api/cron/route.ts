import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Task } from '@prisma/client';

export async function GET(request: Request) {
    // Security check: ensure requests only come from our cron
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    const now = new Date();
    const tasks = await prisma.task.findMany({
        where: { status: 'PENDING' }
    });

    const sent = [];

    for (const task of tasks) {
        if (task.snoozedUntil && task.snoozedUntil > now) continue;

        const hoursLeft = (task.deadline.getTime() - now.getTime()) / 3600000;

        // Check 30 minutes
        if (hoursLeft <= 0.5 && !task.notified30Mins) {
            await sendNotification(task, "🚨 MODO CRÍTICO: 30 minutos ou menos!");
            await prisma.task.update({ where: { id: task.id }, data: { notified30Mins: true } });
            sent.push({ id: task.id, step: '30m' });
        }
        // Check 1 hour
        else if (hoursLeft > 0.5 && hoursLeft <= 1 && !task.notified1Hour) {
            await sendNotification(task, "1 hora restante para o prazo.");
            await prisma.task.update({ where: { id: task.id }, data: { notified1Hour: true } });
            sent.push({ id: task.id, step: '1h' });
        }
        // Check 2 hours
        else if (hoursLeft > 1 && hoursLeft <= 2 && !task.notified2Hours) {
            await sendNotification(task, "2 horas restantes.");
            await prisma.task.update({ where: { id: task.id }, data: { notified2Hours: true } });
            sent.push({ id: task.id, step: '2h' });
        }
        // Check 3 hours
        else if (hoursLeft > 2 && hoursLeft <= 3 && !task.notified3Hours) {
            await sendNotification(task, "3 horas restantes. FASE DE PREPARAÇÃO.");
            await prisma.task.update({ where: { id: task.id }, data: { notified3Hours: true } });
            sent.push({ id: task.id, step: '3h' });
        }
        // Check 1 Day
        else if (hoursLeft > 3 && hoursLeft <= 24 && !task.notified1Day) {
            await sendNotification(task, "1 dia para o prazo.");
            await prisma.task.update({ where: { id: task.id }, data: { notified1Day: true } });
            sent.push({ id: task.id, step: '1d' });
        }
        // Check 2 Days
        else if (hoursLeft > 24 && hoursLeft <= 48 && !task.notified2Days) {
            await sendNotification(task, "2 dias para o prazo.");
            await prisma.task.update({ where: { id: task.id }, data: { notified2Days: true } });
            sent.push({ id: task.id, step: '2d' });
        }
        // Check 3 Days
        else if (hoursLeft > 48 && hoursLeft <= 72 && !task.notified3Days) {
            await sendNotification(task, "3 dias para o prazo. FASE DE CONSCIÊNCIA.");
            await prisma.task.update({ where: { id: task.id }, data: { notified3Days: true } });
            sent.push({ id: task.id, step: '3d' });
        }
    }

    return NextResponse.json({ success: true, notificationsSent: sent });
}

async function sendNotification(task: Task, message: string) {
    console.log(`[NOTIFY] ${task.taskRef} - ${message}`);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
        try {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `⚙️ *Controle GA*\n\n*${task.taskRef}*: ${task.title}\nPrioridade: P${task.priority}\n\n${message}`,
                    parse_mode: 'Markdown'
                })
            });
        } catch (e) {
            console.error("Failed to send telegram", e);
        }
    }
}
