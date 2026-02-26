# Guia de Deploy: Render (App) + Hostinger (MySQL)

Este guia detalha como hospedar o **Controle GA** usando o banco de dados da sua Hostinger e o servidor do Render.com.

---

## Passo 1: Preparar o MySQL na Hostinger

O banco de dados ficará na Hostinger. Para que o Render consiga ler os dados, precisamos liberar o acesso externo.

1. Acesse o hPanel da **Hostinger**.
2. Vá em **Bancos de Dados** -> **Gerenciamento de MySQL**.
3. Crie um novo banco (ex: `u123456789_controle`) e um usuário (ex: `u123456789_admin`). **Anote a senha!**
4. Procure pela seção **MySQL Remoto**.
5. No campo **IP (IPv4 ou hostname)**, coloque `%` (isso permite que qualquer servidor se conecte, necessário para o Render que muda de IP frequentemente).
6. Selecione o banco de dados que você criou e clique em **Adicionar**.

> **DATABASE_URL format**: `mysql://usuario:senha@host:3306/nome_do_banco`

---

## Passo 2: Subir para o GitHub

O Render precisa ler seu código do GitHub.

1. O código já está sincronizado com seu repositório `https://github.com/GabriAz/Controle`.
2. Verifique se o sub-comando `npm run build` funciona localmente.

---

## Passo 3: Configurar no Render.com

1. Crie uma conta no **[Render](https://render.com/)** (use o GitHub para facilitar).
2. Clique em **New +** -> **Web Service**.
3. Conecte seu repositório `Controle`.
4. Configurações básicas:
   - **Name**: `controle-ga`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free` (ou o que preferir)

---

## Passo 4: Variáveis de Ambiente (CRITICAL)

No painel do Render, vá na aba **Environment** e clique em **Add Environment Variable**:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Sua URL do MySQL da Hostinger |
| `NEXTAUTH_SECRET` | Uma senha aleatória longa |
| `NEXTAUTH_URL` | A URL que o Render te der (ex: `https://controle-ga.onrender.com`) |
| `GOOGLE_CLIENT_EMAIL` | Do seu arquivo `.env` |
| `GOOGLE_PRIVATE_KEY` | Do seu arquivo `.env` (exatamente como está) |
| `GOOGLE_CALENDAR_ID` | Do seu arquivo `.env` |
| `TELEGRAM_BOT_TOKEN` | Seu token do bot |
| `TELEGRAM_CHAT_ID` | O ID do canal |

---

## Passo 5: Inicializar o Banco

Como o banco na Hostinger estará vazio, precisamos criar as tabelas:

1. Localmente, no seu terminal, mude o `DATABASE_URL` do `.env` para apontar para a Hostinger.
2. Rode: `npx prisma db push`.
3. Isso criará as tabelas `User` e `Task` na Hostinger.

---

## Cron Jobs (Notificações)

No Vercel o cron é automático via `vercel.json`. No Render Free, o app "dorme". 
Para as notificações funcionarem sempre:
1. Use um serviço gratuito como **[Cron-job.org](https://cron-job.org/)**.
2. Aponte para `https://seu-app.onrender.com/api/cron`.
3. Configure para rodar a cada 5 ou 10 minutos.
