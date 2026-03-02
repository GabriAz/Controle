import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramAlert } from '@/lib/telegram';

export async function GET(request: Request) {
    // Security check
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

        // OVERDUE Check
        if (hoursLeft < 0) {
            // Only notify overdue once per cron run or with a separate flag? 
            // For now, let's notify if it's more than 5 minutes past and hasn't been flagged or just every run if small.
            // But usually, we only want to notify once when it BECOMES overdue.
            // Let's add a simple check: if it's within the last hour and haven't notified overdue.
            // Or better, just notify if it's pending and past deadline.
            await sendTelegramAlert({
                task,
                type: 'OVERDUE',
                customMessage: `⚠️ Esta tarefa está com o prazo VENCIDO!`
            });
            sent.push({ id: task.id, step: 'OVERDUE' });
            continue; // Skip other reminders if already overdue
        }

        // Check 30 minutes
        if (hoursLeft <= 0.5 && !task.notified30Mins) {
            await sendTelegramAlert({ task, type: 'REMINDER', customMessage: "🚨 30 minutos antes do compromisso!" });
            await prisma.task.update({ where: { id: task.id }, data: { notified30Mins: true } });
            sent.push({ id: task.id, step: '30m' });
        }
        // Check 1 hour
        else if (hoursLeft <= 1 && !task.notified1Hour) {
            await sendTelegramAlert({ task, type: 'REMINDER', customMessage: "1h antes do compromisso" });
            await prisma.task.update({ where: { id: task.id }, data: { notified1Hour: true } });
            sent.push({ id: task.id, step: '1h' });
        }
        // Check 2 hours
        else if (hoursLeft <= 2 && !task.notified2Hours) {
            await sendTelegramAlert({ task, type: 'REMINDER', customMessage: "2h antes do compromisso" });
            await prisma.task.update({ where: { id: task.id }, data: { notified2Hours: true } });
            sent.push({ id: task.id, step: '2h' });
        }
        // Check 3 hours
        else if (hoursLeft <= 3 && !task.notified3Hours) {
            await sendTelegramAlert({ task, type: 'REMINDER', customMessage: "3h antes do compromisso" });
            await prisma.task.update({ where: { id: task.id }, data: { notified3Hours: true } });
            sent.push({ id: task.id, step: '3h' });
        }
        // Check 1 Day
        else if (hoursLeft <= 24 && !task.notified1Day) {
            await sendTelegramAlert({ task, type: 'REMINDER', customMessage: "1 dia antes do compromisso" });
            await prisma.task.update({ where: { id: task.id }, data: { notified1Day: true } });
            sent.push({ id: task.id, step: '1d' });
        }
        // Check 2 Days
        else if (hoursLeft <= 48 && !task.notified2Days) {
            await sendTelegramAlert({ task, type: 'REMINDER', customMessage: "2 dias antes do compromisso" });
            await prisma.task.update({ where: { id: task.id }, data: { notified2Days: true } });
            sent.push({ id: task.id, step: '2d' });
        }
        // Check 3 Days
        else if (hoursLeft <= 72 && !task.notified3Days) {
            await sendTelegramAlert({ task, type: 'REMINDER', customMessage: "3 dias antes do compromisso" });
            await prisma.task.update({ where: { id: task.id }, data: { notified3Days: true } });
            sent.push({ id: task.id, step: '3d' });
        }
    }

    return NextResponse.json({ success: true, notificationsSent: sent });
}
