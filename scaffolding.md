# Scaffolding Guide — WhiteBoard

WhiteBoard is a modular monolith at MVP: one Next.js application (frontend + API routes) plus a BullMQ worker process, sharing Prisma schema and validation logic. This guide maps the directory structure and the dependency relationships an agent needs before writing code.

## Repository layout

```
whiteboard/
  apps/                  (single Next.js app at MVP — no app-splitting)
    web/
      app/               Next.js App Router pages (learner, parent, institution, scholarship)
      components/        role-specific compositions over shared primitives
      lib/               api client, tanstack-query hooks, auth helpers
      server/            (if using Next.js API routes)
    app/api/             API route handlers (if not using NestJS)
  packages/
    shared/              shared Zod schemas + types (frontend/backend single source of validation)
    ui/                  shadcn/ui primitives + design-token theme
    db/                  Prisma schema, migrations, seed data
    config/              environment validation (zod), constants
  workers/               BullMQ worker process (AI generation, notifications, calendar)
  modules/               (if NestJS) auth, users, curriculum, scheduling, ai, billing, notifications
  tests/                 Playwright E2E journeys; unit/integration for shared + workers
  infra/                 Docker Compose, deploy configs, backup scripts
```

## Dependency relationships

```
packages/db  ←  packages/config  ←  apps/web          (web imports schema + env validation)
                    ↓                    ↓
packages/shared ← apps/web & workers (both consume the same Zod schemas)
packages/ui  ←  apps/web            (design system only, no data deps)
workers      ←  packages/db, packages/shared, packages/config
apps/web     →  HTTP + WebSocket; BullMQ producer (enqueues AI/notification jobs)
workers      →  Pulse BullMQ consumer; calls external providers (LLM, calendar, email/SMS)
```

Key rules:
- **Never import app pages into workers** — workers depend only on `packages/db`, `packages/shared`, `packages/config`.
- **Never inline validation logic** — always from `packages/shared` so frontend and backend can't drift.
- **Design tokens live once** in `packages/ui` theme; components never hardcode colors/spacing.
- **Module boundaries** in `modules/` (if NestJS) or `app/api/` groups mirror the Prompt.md module list (`auth`, `users`, `families`, `learners`, `institutions`, `coursecurriculum`, `learning`, `assessments`, `ai`, `progress`, `scheduling`, `scholarships`, `opportunities`, `applications`, `notifications`, `billing`, `analytics`, `admin`) so any one is extractable to a service later.
- **Tenancy rule:** every query that touches learner/upload/AI content resolves the owning `FamilyAccount` (or `Institution`) server-side before returning data. Enforced in shared query helpers, not scattered per endpoint.

## Local run

`infra/docker-compose.yml` brings up PostgreSQL + Redis. Next.js (or NestJS) runs on host for fast iteration; the worker runs as a second process. See `environments.md` for the full env matrix.