# Deploy with Docker Compose

This project uses Next.js + Prisma and a MySQL database.

## 1) Configure environment

Create your runtime env file from the template:

```bash
cp .env.example .env
```

Edit `.env` with real values before production use.

## 2) Build images

```bash
docker compose build
```

## 3) Start services

```bash
docker compose up -d
```

App: `http://localhost:3333`

## 4) Run Prisma migrations

After the database is up, run migrations:

```bash
docker compose run --rm app npx prisma migrate deploy
```

## 5) View logs

```bash
docker compose logs -f app
docker compose logs -f db
```

## 6) Stop services

```bash
docker compose down
```

To also remove DB data volume:

```bash
docker compose down -v
```
