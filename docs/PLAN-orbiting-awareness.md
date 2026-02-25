# PLAN - Orbiting Awareness System

## Overview
Diferente de listas estáticas, o "Orbiting Awareness" trata o tempo como uma órbita. À medida que o prazo de uma tarefa se aproxima, sua gravidade aumenta, crescendo em prioridade visual e em frequência de notificações. O foco central é aliviar a carga cognitiva do usuário, onde o sistema se encarrega de lembrar, alertar progressivamente (escalonamento de ruído) e repriorizar tudo com base em sobrevivência e urgência matemática.

## Project Type
**WEB** (com forte presença de backend para cron jobs/notificações).

## Success Criteria
1. O sistema deve gerar automaticamente um identificador único sequencial (ex: \#ANT-102) por tarefa.
2. A listagem ("The Radar") deve repriorizar dinamicamente todas as tarefas com base no Índice de Urgência ($U = \frac{Prioridade}{Tempo\_Restante}$).
3. A interface deve aplicar _Color-Coding de Stress_, alterando a cor de fundo dos cards (cinza → laranja → vermelho neon) conforme a aproximação de 3h, 2h e 30min.
4. O sistema de "Seven-Step Notifications" deve disparar as 7 ondas de alertas em seus respectivos tempos com suporte à personalização (Quick-Edit).
5. Durante os últimos 30min ("Modo Crítico"), o sistema deve exigir resposta (Sticky Notification / Adiar vs Iniciar) para não permitir estouro de prazo.
6. A entrada de dados via Input Inteligente com _slash commands_ (ex: `#tarefa Criar Branding Art Cana P1 @25/02 14:00`) deve ser funcional.

## Tech Stack
- **Frontend**: Next.js (React) + Tailwind CSS (para color-coding transicional fluido).
- **Backend**: Node.js APIs para roteamento, Parse do Input Inteligente e gerenciamento de banco.
- **Database**: PostgreSQL ou banco serverless (Supabase/Firebase) para persistência segura e eficiente.
- **Background Jobs**: Node Cron Worker ou in-built Next.js background workers (via Vercel Cron ou Trigger.dev) monitorando minuto a minuto.
- **Notificações**: Push Notification do PWA para web (ou Webhooks / integração push nativa via OneSignal, e Telegram).

## File Structure
```text
/
├── .agent/
├── src/
│   ├── app/                 # Rotas (Next.js App Router)
│   │   ├── api/             # Endpoints (Tasks, Cron triggers, etc.)
│   │   ├── components/      # Componentes UI (RadarList, TaskCard, QuickEdit)
│   │   ├── (radar)/         # View Principal "The Radar"
│   ├── lib/
│   │   ├── cron/            # Lógica dos Workers (Seven-Step engine)
│   │   ├── utils/           # Funções de tempo, cálculo de U e Parse Inteligente
│   ├── db/                  # Schema, models (Prisma/Drizzle)
├── docs/                    # Onde repousa este plano
```

## Task Breakdown
| ID | Título | Agente Recomendado | Skill Recomendada | INPUT → OUTPUT → VERIFY |
|---|---|---|---|---|
| 01 | Setup de DB e Models | `database-architect` | `database-design` | Schema da tarefa → Migrate → DB verificado podendo salvar dados via script local. |
| 02 | Engine do Input Inteligente | `backend-specialist` | `python-patterns` ou `nodejs-best-practices` | String pura (ex `#tarefa...`) → JSON parseado com dados e datas corretas → Teste unitário de RegExp regex funcional. |
| 03 | Algoritmo de Cálculo U ($U$) | `backend-specialist` | `clean-code` | Dados da tarefa / timestamp atual → Posição / Índice realocado → Teste garante P3 de 30min cima de P1 5d. |
| 04 | UI: View "The Radar" e Cards | `frontend-specialist` | `frontend-design` | Mock de tarefas → Lista vertical reordenável com degradê de fundo responsivo a timer → Validar UX limpa sem bugs ou repetições. |
| 05 | Engine "Seven-Step Notifications" | `backend-specialist` | `server-management` | Tarefa e régua → Disparo em 3d, 1d, 3h, etc. → Testar acionamentos / mock de webhooks em horários previstos via cron simulado. |
| 06 | Integração Final: Cron & UI | `orchestrator` | `app-builder` | UI + Cron + DB → Fluxo E2E de criação, alerta ativo "Modo Crítico" de 30min com adiamento justificado → Verificar recalculo da régua ao adiar. |

## ✅ Phase X: Verification
- [ ] Segurança: `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .` 
- [ ] UX Audit: `python .agent/skills/frontend-design/scripts/ux_audit.py .`
- [ ] Testes E2E (Playwright) para conferir _Input Inteligente_
- [ ] Teste unitário garante que o cálculo $U$ respeita a _Ordem de Sobrevivência_.
- [ ] Regras "No Purple", Socratic Gate passadas.
