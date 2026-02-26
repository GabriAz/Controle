# Guia Completo de Deploy: Vercel + Neon (PostgreSQL)

Este documento foi criado para detalhar o passo a passo exato de como colocar o **Studio Que Dashboard** em produção.

A arquitetura escolhida foi **Vercel** (para hospedar o código Frontend+Backend Next.js) e **Neon.tech** (para rodar o banco de dados PostgreSQL). Essa combinação garante latência praticamente zero, já que ambos os servidores costumam ficar muito próximos, além de fornecerem generosos limites gratuitos e zero configuração de servidores.

---

## Passo 1: O Código no GitHub

A Vercel precisa "puxar" o seu código automaticamente para poder construir (fazer o build) do site.

1. Acesse sua conta no **[GitHub](https://github.com/)**.
2. Clique no ícone de **+** no canto superior direito e em **New repository**.
3. Escolha um nome (ex: `studio-que-dashboard`).
4. Marque como **Private** (é importante que seja privado para ninguém ver chaves soltas, se houver).
5. Clique em **Create repository**.
6. Copie a linha parecida com `https://github.com/SeuUsuario/studio-que-dashboard.git`.

> **Mande essa URL pra mim** que eu subo todo o código que está pronto no seu computador para lá.

---

## Passo 2: O Banco de Dados na Neon.tech

Aqui criaremos onde todas as tarefas e usuários serão salvos. O Prisma (nosso ORM) vai se comunicar com ele via conexão TCP.

1. Cesse o site do **[Neon](https://neon.tech/)** e crie uma conta gratuita (você pode fazer login com o Google/GitHub).
2. Clique em **Create Project** (ou New Project).
3. Dê um nome ao projeto (ex: `StudioQueDB`).
4. Selecione a região (`US East N. Virginia` costuma ser a melhor pois é onde a Vercel, por padrão, hospeda as funções gratuitas).
5. Selecione a versão do Postgres (Pode ser a 15 ou 16).
6. Clique em **Create Project**.
7. Na página que abrir, no centro da tela haverá uma caixa preta com as regras de **Connection String** ou **Connection details**. Na aba URL, copie inteira a string. Ela se parece com:
   `postgresql://neondb_owner:SenhaGigante@ep-nome-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`

> **Mande a Connection String do Neon pra mim**. *(Nota: você pode apagar a parte da senha `SenhaGigante` antes de mandar aqui no chat, só preciso da estrutura pra apontar o Prisma para ele primeiro. Depois você usará a string inteira, COM a senha, lá na Vercel).*

---

## Passo 3: Sincronização e Subida (Minha Tarefa)

Assim que eu tiver a URL do Git e a Connection String (mesmo sem senha, só para base), eu:
1. Vou fazer o envio do código todo pro GitHub.
2. (Se for necessário) Vou te pedir a string COM a senha temporariamente para eu rodar `npx prisma db push` e criar as tabelas Vazias (Users, Tasks, etc) no banco novo da Neon.

---

## Passo 4: O Servidor da Vercel

Com o código no GitHub e o banco na Neon criado, a mágica acontece.

1. Faça login na **[Vercel](https://vercel.com/)** com a mesma conta do seu GitHub.
2. Na página principal (Dashboard), clique no botão preto **Add New...** -> **Project**.
3. Na seção "Import Git Repository", encontre o repositório do `studio-que-dashboard` que criamos e clique no botão **Import**.
4. Abrirá uma tela com as configurações do projeto ("Configure Project"). NÂO CLIQUE em Deploy ainda.
5. Abra a sanfona chamada **Environment Variables**. É aqui que colocaremos as senhas e chaves que dão vida ao sistema de verdade. Adicione (uma a uma, colocando Nome e Value) as seguintes:

   * Nome: `DATABASE_URL`
     * Valor: Cole aqui a sua Connection String INTEIRA da Neon (COM a senha).
   * Nome: `NEXTAUTH_SECRET`
     * Valor: Coloque qualquer senha bem grande, maluca e aleatória que te der na cabeça sem espaços (ou crie usando um gerador).
   * Nome: `NEXTAUTH_URL`
     * Valor: Será o site onde o app vai rodar quando der o deploy (ex: `https://studio-que-dashboard.vercel.app` ou o domínio em que ele roda). Na primeira vez, coloque isso.
   * Nome: `GOOGLE_CLIENT_EMAIL`
     * Valor: Copie a mesma lá do `.env` local (`radardash...iam.gserviceaccount.com`).
   * Nome: `GOOGLE_PRIVATE_KEY`
     * Valor: Copie a enorme chave do `.env` local. **MAS ATENÇÃO**: A Vercel entende as quebras de linha `\n` literalmente as vezes. Cole exatamente como está. 
   * Nome: `GOOGLE_CALENDAR_ID`
     * Valor: Cole o ID do calendário no `.env`.

6. Agora sim, clique no grande botão **Deploy**.

Espere um minutinho. Se tudo der certo e a tela encher de confetes digitais, o seu sistema está 100% online!

---

## Passo 5: Criar o Primeiro Usuário

O projeto já estará rodando, mas o seu banco estará vazio. Você clicará em Login e não conseguirá entrar.

Como seu código local da sua máquina ainda está usando o banco local sqlite enquanto conversamos, enviaremos os dados do administrador direto no banco novo.

Para isso, assim que o deploy acabar e eu tiver a confirmação:
1. Eu mudo temporariamente o `.env` apenas na sua máquina apontando o `DATABASE_URL` para o Neon.
2. Rodo `npx prisma studio`.
3. Insiro manualmente pela interface gráfica o usuário administrativo de forma idêntica à forma como ele já exsite na interface local.

E pronto! Está vivo e pronto para você apontar o domínio da Hostinger para a Vercel usando configurações de "A" e "CNAME".
