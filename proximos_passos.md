# Próximos Passos: Deployment na Vercel

Este documento detalha o passo a passo exato para colocarmos o sistema "Controle > GA" no ar, garantindo que o banco de dados e os crons do Telegram funcionem perfeitamente.

## FASE 1: Preparação do Repositório (Local -> GitHub)

Para a Vercel conseguir ler nosso código, ele precisa estar hospedado no GitHub.

1. Acesse sua conta no [GitHub](https://github.com/).
2. Crie um novo repositório **Privado** chamado `controle-ga` (ou o nome de sua preferência).
3. No terminal do seu computador (VS Code), rode os seguintes comandos na raiz do projeto:
   ```bash
   git init
   git add .
   git commit -m "Deploy Inicial: Sistema Controle GA com Telegram e Auth"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
   git push -u origin main
   ```

## FASE 2: Banco de Dados na Nuvem (Vercel Postgres ou Supabase)

O banco local (`localhost:5432`) não vai para a nuvem. Precisamos de um banco real online.

**Se usar Vercel Postgres:**
1. Crie uma conta na [Vercel](https://vercel.com/) fazendo login com seu GitHub.
2. Vá na aba **Storage** (Armazenamento) na Vercel.
3. Clique em **Create Database** -> Selecione **Postgres**.
4. Dê um nome (ex: `controle-db-prod`) e selecione a região (Washington D.C. é o padrão gratuito mais comum).
5. Após criado, vá na aba **".env.local"** ou **Quickstart** do banco de dados na Vercel e copie a string de conexão (vai começar com `postgres://...` e será longa).
   * Guarde essa string. Ela será o seu novo `DATABASE_URL` na produção.

## FASE 3: O Deploy do Sistema (Vercel)

Com o código no GitHub e o Banco criado de banco:

1. Na Dashboard da Vercel, clique em **Add New Project**.
2. Selecione o repositório `controle-ga` que você criou. A Vercel vai reconhecer que é um app Next.js.
3. **MUITO IMPORTANTE:** Antes de clicar em Deploy, abra a sanfona de **Environment Variables**.
4. Adicione **TODAS** as variáveis do seu `.env` local. A lista essencial é:
   * `DATABASE_URL` (Use a URL do banco da nuvem que você pegou na FASE 2, NÃO O DE LOCALHOST!)
   * `NEXTAUTH_URL` (Coloque a URL temporária que a vercel gerar ou seu domínio final)
   * `NEXTAUTH_SECRET` (Mantenha `controle_super_secret_dev_key_123` ou crie uma senha mais forte)
   * `TELEGRAM_BOT_TOKEN`
   * `TELEGRAM_CHAT_ID`
   * `GOOGLE_CLIENT_EMAIL` (E as outras do Calendar, se você for usar a Opção A ativa em prod)
5. Clique em **Deploy**.

## FASE 4: Sincronizando o Banco Novo

A Vercel vai colocar o site no ar, mas o **Banco de Dados novo estará vazio** (sem tabelas). Precisamos rodar a migração do Prisma nele.

1. Adicione a variável `DATABASE_URL` da nuvem temporariamente no seu `.env` LOCAL (substituindo o localhost).
2. No seu terminal local, rode:
   ```bash
   npx prisma db push
   ```
3. (Opcional) Suba o usuário Admin inicial alterando o seu endpoint `setup/route.ts` para bater no banco novo (ou acessando a URL de setup de produção caso esteja ativa).
4. **Volte seu `.env` local para `localhost`** pra você não mexer nos dados de produção enquanto estiver programando localmente de novo.

---

> 🎉 **Feito isso:** Você terá o sistema no ar. O arquivo `vercel.json` (que já criamos) dirá automaticamente para a Vercel engatilhar o Cron a cada 5 minutos, ativando o Theozera!
