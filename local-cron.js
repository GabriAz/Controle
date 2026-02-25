/**
 * Daemon de Notificações do Radar (Cron Local)
 * 
 * Este script roda num processo isolado para pingar o endpoint interno
 * do Next.js a cada X minutos sem necessidade de um serviço de nuvem (Vercel Cron / Railway).
 */

const PING_INTERVAL_MINUTES = 5;
const ENDPOINT = "http://localhost:3000/api/cron";

console.log(`\x1b[36m[CRON DAEMON]\x1b[0m Iniciando serviço local de notificações...`);
console.log(`\x1b[36m[CRON DAEMON]\x1b[0m Intervalo definido: ${PING_INTERVAL_MINUTES} minuto(s)`);

async function runCronSync() {
    try {
        const res = await fetch(ENDPOINT, { method: "GET" });
        if (res.ok) {
            const data = await res.json();
            const count = data.notificationsSent?.length || 0;
            console.log(`\x1b[32m[${new Date().toLocaleTimeString()}] Ping OK - ${count} disparos pelo Theozera\x1b[0m`);
        } else {
            console.error(`\x1b[31m[${new Date().toLocaleTimeString()}] Falha no Ping: ${res.statusText}\x1b[0m`);
        }
    } catch (error) {
        console.error(`\x1b[31m[${new Date().toLocaleTimeString()}] Erro de conexão. O servidor Next.js está rodando na porta 3000?\x1b[0m`);
    }
}

// Disparo Opcional Ao Ligar o Script
runCronSync();

// Loop Infinito
setInterval(runCronSync, PING_INTERVAL_MINUTES * 60 * 1000);
