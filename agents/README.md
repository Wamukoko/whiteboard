# WhiteBoard Agent Team

**Roster:** A 8-agent team for WhiteBoard, scoped to a web + PWA education platform with relational data, children's-data privacy, payments, and AI-content risk.

| File | Role | Owns |
|---|---|---|
| `ui-ux-engineer.md` | UI/UX Engineer | Design tokens, visual language, role-specific interfaces, empty/loading/error states, microcopy standards |
| `frontend-engineer.md` | Frontend Engineer | Next.js + TypeScript + Tailwind + shadcn/ui implementation, PWA, TanStack Query, forms |
| `backend-engineer.md` | Backend/API Engineer | NestJS/Next.js API, auth + RBAC, Zod validation, rate limiting, integrations, background jobs |
| `database-architect.md` | Database Architect | PostgreSQL schema via Prisma, migrations, indexes, multi-curriculum-per-child, tenancy scoping |
| `ai-engineer.md` | AI Integration Engineer | LLM abstraction, upload → OCR → chunking → quiz generation, cost controls, content safety |
| `security-engineer.md` | Security Engineer | Auth hardening, children's-data privacy, payment tokenization, AI safety guardrails, secret management |
| `devops-engineer.md` | Devops Engineer | CI/CD, environments, Docker, monitoring, backups + restore drills, cost-conscious hosting |
| `qa-engineer.md` | QA/Testing Engineer | Test coverage, Playwright E2E journeys, server-side enforcement tests, accessibility, offline degradation |

## Handoff orders for typical feature types

| Scenario | Handoff order |
|---|---|
| New UI screen (e.g., parent dashboard) | `ui-ux-engineer -> frontend-engineer -> qa-engineer` |
| New data model + API (e.g., curriculum module) | `database-architect -> backend-engineer -> qa-engineer` |
| New privacy/compliance rule (e.g., consent flow) | `security-engineer -> database-architect -> backend-engineer -> qa-engineer` |
| New AI feature (e.g., quiz generation pipeline) | `ai-engineer + database-architect -> backend-engineer -> frontend-engineer -> qa-engineer` |
| Payments (e.g., M-Pesa subscription) | `security-engineer -> backend-engineer -> qa-engineer` |
| Infrastructure change (e.g., backups, envs) | `devops-engineer -> backend-engineer -> qa-engineer` |

## Usage instructions

**Claude Code:** Drop these files into `.claude/agents/` and they become subagents with the name/description frontmatter driving the router.

**Standalone with any assistant:** Paste the relevant `agents/<role-name>.md` as the system prompt (with the project's shared context: `Prompt.md` sections + guardrails) when that role's work is being done.

**Human contractors:** Hand the role file plus the project prompt as a briefing doc.

## Maintenance note

When `Prompt.md` changes, update the "Domain context you must apply" section of every affected agent file. The roster itself only changes if the project's risk profile or surface count shifts (e.g., adding a native mobile target would introduce `mobile-engineer.md`).