# Guia de Deploy: Render + Hostinger (MySQL)

Este documento detalha o passo a passo exato de como colocar o **Studio Que Dashboard** (Controle) em produção.

A arquitetura escolhida foi **Render** (para hospedar o código Frontend+Backend Next.js) e **Hostinger** (para rodar o banco de dados MySQL). Essa combinação permite que você utilize a infraestrutura de banco de dados que já possui na Hostinger, juntamente com o poder do Render para rodar aplicações Node.js/Next.js.

---

## Passo 1: O Banco de Dados na Hostinger

Precisamos criar o banco de dados MySQL que será utilizado pelo sistema.

1. Acesse o **painel de controle (hPanel) da Hostinger**.
2. Vá até a seção **Bancos de Dados** e selecione **Bancos de Dados MySQL** (ou MySQL Databases).
3. Crie um novo banco de dados:
   - **Nome do Banco**: Ex `u123456789_controle`
   - **Usuário do Banco**: Ex `u123456789_admin`
   - **Senha**: Crie uma senha forte e anote.
4. Clique em **Criar**.
5. **MUITO IMPORTANTE (Acesso Remoto)**: Como o Render vai precisar acessar este banco de dados de fora da Hostinger, você precisa habilitar o **MySQL Remoto**.
   - No painel da Hostinger, procure por **MySQL Remoto** (Remote MySQL).
   - Adicione o IP `%` (se permitido pela Hostinger para acesso de qualquer lugar, ou procure gerenciar os acessos) para o banco de dados recém-criado, permitindo que servidores externos (Render) se conectem a ele.
6. Construa a sua _Connection String_ (URL de Conexão). Ela deve ter este formato:
   `mysql://USUARIO:SENHA@IP_DO_SERVIDOR:3306/NOME_DO_BANCO`
   *(O IP do servidor MySQL você encontra na aba de informações do banco de dados na Hostinger).*

> **Tenha esta Connection String em mãos** para o Passo 3.

---

## Passo 2: O Código no GitHub

O Render precisa "puxar" o seu código automaticamente do GitHub para construir (fazer o build) do site.

*Nós já empurramos a versão mais recente do código (preparada para MySQL e Prisma v7) para o seu GitHub privado em `GabriAz/Controle`.*

---

## Passo 3: O Servidor no Render

Com o banco de dados na Hostinger pronto, agora vamos colocar a aplicação para rodar no Render.

1. Faça login no **[Render Dashboard](https://dashboard.render.com/)**. Você pode usar a sua conta do GitHub para entrar.
2. No painel, clique em **New** (ou Novo) e depois em **Web Service**.
3. Selecione a opção para conectar um repositório existente: **"Build and deploy from a Git repository"**.
4. Conecte sua conta do GitHub (se ainda não estiver conectada) e selecione o repositório `GabriAz/Controle`.
5. Preencha as configurações do projeto:
   - **Name**: `controle-studio-que` (ou o nome que preferir).
   - **Region**: Selecione uma região preferencialmente nos EUA, geralmente a padrão (ex: `US East - Ohio`) funciona bem.
   - **Branch**: `main`.
   - **Runtime**: `Node`.
   - **Build Command**: `npm install && npx prisma generate && npm run build` (Isto é muito importante, garante que as tabelas do prisma sejam lidas antes de montar o app).
   - **Start Command**: `npm start`
6. Role um pouco para baixo e procure por **Environment Variables** (Variáveis de Ambiente / Segredos). Clique em **Add Environment Variable**. Aqui você adicionará as variáveis (uma por linha):

   - **Chave**: `DATABASE_URL`
     - **Valor**: Cole a sua Connection String da Hostinger (ex: `mysql://USER:SENHA@IP:3306/BANCO`).
   
   - **Chave**: `NEXTAUTH_SECRET`
     - **Valor**: Cole o segredo maluco (pode gerar um pesquisando "generate random string", ou use o do seu `.env` local).
   
   - **Chave**: `NEXTAUTH_URL`
     - **Valor**: A URL final do seu site no Render (ou seu domínio se for usar um próprio). Por padrão o Render gera algo como `https://controle-studio-que.onrender.com`.

   - **Chave**: `GOOGLE_CLIENT_EMAIL`
     - **Valor**: Copie do seu `.env` local (`radardash...iam.gserviceaccount.com`).
   
   - **Chave**: `GOOGLE_PRIVATE_KEY`
     - **Valor**: Copie a enorme chave do `.env` local. **MAS ATENÇÃO**: Garanta que você colou exatamente como está, respeitando ou as quebras de linha.
   
   - **Chave**: `GOOGLE_CALENDAR_ID`
     - **Valor**: O ID do seu calendário.

7. Abaixo, no plano, você pode selecionar o plano **Free** (Gratuito).
8. Clique no botão azul **Create Web Service**.

O Render começará a fazer o build (compilar seu código). Acompanhe os logs na tela.

---

## Passo 4: Migração das Tabelas (No momento em que o Banco conectar pela 1ª vez)

A primeira vez que o código funcionar, o banco de dados da Hostinger ainda estará "vazio" (sem tabelas). O Prisma pode precisar empurrar as tabelas (esboço) para lá.

Assim que você tiver configurado os passos acima, me avise pelo chat se ocorrer algum erro ou então, quando o banco da Hostinger estiver pronto, me envie a sua **DATABASE_URL** para que eu rode o sub-comando do Prisma daqui e crie as tabelas `User`, `Task`, etc., para você, gerando também o primeiro Usuário Administrador de volta.
