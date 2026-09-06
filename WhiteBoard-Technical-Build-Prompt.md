# White Board — Master Build Prompt for AI Coding Agents

### A Technical Specification & Orchestration Prompt for Building the White Board eLearning Platform

---

## How to Use This Document

This document is written to be used as a **master prompt** for an AI-assisted ("vibe coding") development workflow — whether that's a single agent working sequentially through sections, or multiple specialized agents (frontend, backend, database, AI, DevOps, QA) working in parallel under an orchestrator. Each section below is scoped so it can be handed to the relevant agent as its own working brief, with shared context (tech stack, guardrails, naming conventions) staying consistent across all of them.

---

## 1. Project Overview (Shared Context — Give This to Every Agent)

**Product name:** White Board
**Formerly known as:** SomaPro
**One-line description:** A homeschool-first eLearning web platform for Kenyan families managing children across multiple curricula (CBC, Cambridge/GCSE, American system, Abacus), combining multi-curriculum content structuring, AI-powered practice generation from uploaded materials, open video/calendar integrations, and a freemium subscription model.

**Primary users:**
- **Parent/Guardian (Educator role)** — manages one or more child profiles, curricula, schedules, and subscription
- **Learner (Child role)** — consumes lessons, takes AI-generated quizzes, tracks own progress (age-appropriate UI)
- **Tutor/Content Partner (optional, post-MVP)** — creates and publishes supplementary content via marketplace

**Design ethos:** Feature-rich but lightweight. Every feature must justify its bandwidth, complexity, and cost footprint — this is a low-bandwidth, budget-conscious market. Prefer fewer, well-executed features over feature sprawl.

---

## 2. Architecture Overview

### 2.1 High-Level Architecture Pattern
**Modular monolith at MVP stage, designed for future service extraction.** Do not over-engineer into microservices prematurely — a single well-structured codebase with clear module boundaries (curriculum, users, AI, scheduling, billing) is faster to build, cheaper to run, and easier for a small team/agent set to reason about. Structure code so that any module (e.g., AI quiz generation) could be extracted into its own service later without a rewrite.

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Web/PWA)                     │
│         Next.js (React) + Tailwind + shadcn/ui           │
└───────────────────────┬───────────────────────────────────┘
                         │ HTTPS / REST + WebSocket
┌───────────────────────▼───────────────────────────────────┐
│                  APPLICATION LAYER (API)                  │
│     Next.js API Routes / Node.js (NestJS or Express)      │
│   Modules: Auth · Curriculum · Scheduling · AI · Billing   │
└──────┬───────────┬───────────┬───────────┬────────────────┘
       │           │           │           │
┌──────▼─────┐ ┌───▼──────┐ ┌──▼───────┐ ┌─▼─────────────┐
│ PostgreSQL │ │  Redis   │ │  Object  │ │ Background Job │
│ (primary   │ │ (cache,  │ │ Storage  │ │ Queue (BullMQ) │
│  DB)       │ │ sessions,│ │ (S3-comp-│ │ AI processing, │
│            │ │ rate     │ │ atible)  │ │ notifications  │
│            │ │ limiting)│ │ uploads  │ │                │
└────────────┘ └──────────┘ └──────────┘ └────────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                  │
│  Jitsi Meet API · Google Calendar API · AI/LLM Provider   │
│  M-Pesa Daraja API (+ card fallback) · Email/SMS provider  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Why This Stack
- **Next.js** gives server-side rendering for fast initial loads on slower connections, plus API routes to avoid running two separate servers at MVP stage
- **PostgreSQL** as the single source of truth — relational structure suits curriculum → subject → strand → lesson hierarchies well, and supports complex reporting queries for parent dashboards
- **Redis** handles session storage, caching curriculum content (rarely changes, frequently read), and rate-limiting AI API calls per user/tier
- **Object storage (S3-compatible, e.g., Cloudflare R2 or AWS S3)** for uploaded parent materials (PDFs, scanned notes, images) — never store large binary files in Postgres
- **Background job queue (BullMQ on Redis)** decouples slow operations (AI quiz generation, sending calendar invites, email notifications) from the request/response cycle, keeping the UI responsive

---

## 3. Dependencies (Reference List for Setup Agents)

### 3.1 Frontend
| Dependency | Purpose |
|---|---|
| `next` (React framework) | SSR, routing, API routes |
| `typescript` | Type safety across the codebase |
| `tailwindcss` | Utility-first styling, lightweight CSS output |
| `shadcn/ui` | Accessible, unstyled-by-default component primitives (built on Radix UI) |
| `react-hook-form` + `zod` | Form handling and schema validation, shared validation logic with backend |
| `@tanstack/react-query` | Data fetching, caching, background refetching |
| `recharts` | Lightweight charting for progress dashboards |
| `next-pwa` or Workbox | Progressive Web App support for offline/low-bandwidth mode |
| `next-intl` | Localization (English / Kiswahili) |

### 3.2 Backend
| Dependency | Purpose |
|---|---|
| `NestJS` (or Express if simpler agent workflows preferred) | Structured, modular API framework |
| `Prisma` (ORM) | Type-safe database access, migrations |
| `passport.js` + `jsonwebtoken` | Authentication (session + JWT hybrid) |
| `bullmq` | Background job processing |
| `ioredis` | Redis client |
| `zod` | Shared request/response validation |
| `helmet`, `express-rate-limit` (or NestJS equivalents) | Security middleware |

### 3.3 AI / Integrations
| Dependency | Purpose |
|---|---|
| Anthropic Claude API (or configurable LLM provider abstraction) | Quiz generation, material contextualization, AI tutor chat |
| `pdf-parse` / `pdfjs-dist` | Extracting text from uploaded PDFs before AI processing |
| `tesseract.js` (or cloud OCR) | OCR for scanned/handwritten notes |
| Jitsi Meet External API (`lib-jitsi-meet` or iframe embed) | Live video classes |
| Google Calendar API (OAuth2) | Calendar sync |
| M-Pesa Daraja API | Local mobile money payments (primary for Kenya) |
| Stripe or Flutterwave | Card payment fallback for international/diaspora families |

### 3.4 Infrastructure & Tooling
| Dependency | Purpose |
|---|---|
| Docker + Docker Compose | Local dev environment parity |
| GitHub Actions | CI/CD pipeline |
| Sentry | Error monitoring |
| PostHog or Plausible | Privacy-respecting product analytics |
| Vercel or Railway/Render | Hosting (choose based on cost sensitivity — avoid over-provisioned enterprise cloud at MVP stage) |

---

## 4. Agent Roles & Briefs

Each agent below should be given **Section 1 (Project Overview)** and **Section 8 (Guardrails)** as shared context, plus its own brief.

### 4.1 Frontend Engineer Agent
**Brief:** Build the Next.js + TypeScript + Tailwind + shadcn/ui frontend.
- Implement responsive layouts mobile-first (most Kenyan users will access via mid-range Android devices)
- Build the parent dashboard (multi-child view, progress bars per subject/curriculum, upcoming schedule) and the learner view (simplified, gamified, age-appropriate)
- Implement the upload flow for AI material contextualization (drag-drop, file type validation, upload progress)
- Integrate Jitsi via iframe/SDK embed and Google Calendar OAuth connect flow
- Ensure Lighthouse performance score ≥ 90 and total JS bundle stays lean — audit before adding any new UI library
- Follow shadcn/ui + Radix accessibility primitives; do not hand-roll custom modals/dropdowns without accessibility parity (keyboard nav, ARIA labels, focus trapping)

### 4.2 Backend/API Engineer Agent
**Brief:** Build the modular API layer (NestJS or Express).
- Structure by domain module: `auth`, `users`, `curriculum`, `scheduling`, `ai`, `billing`, `notifications`
- Every endpoint must validate input with `zod` schemas shared with the frontend where possible
- Implement role-based access control (RBAC): Parent, Learner, Tutor/Partner, Admin
- Implement rate limiting per subscription tier (Free tier: capped AI calls/month, enforced server-side, not just UI-side)
- Write integration tests for every module before marking it complete

### 4.3 Database/Data Architect Agent
**Brief:** Design the PostgreSQL schema via Prisma.
- Core entities: `User`, `FamilyAccount`, `Child`, `Curriculum`, `Subject`, `Strand/Topic`, `Lesson`, `UploadedMaterial`, `GeneratedQuiz`, `QuizAttempt`, `Subscription`, `ScheduledSession`
- Design for **multi-curriculum-per-child** as a first-class relationship (a `Child` can be enrolled in multiple `Curriculum` records simultaneously)
- Index heavily on query patterns used by dashboards (e.g., progress-by-child-by-subject) to keep reporting queries fast without denormalization at MVP stage
- Write migration scripts with rollback support; never apply destructive migrations without a reviewed plan
- Enforce foreign key constraints and cascading rules explicitly (e.g., what happens to a child's data if a parent account is deleted — must align with data retention/deletion guardrails in Section 8)

### 4.4 AI Integration Agent
**Brief:** Build the AI contextualization and quiz-generation pipeline.
- Pipeline: upload → text extraction (PDF/OCR) → content chunking → LLM prompt (curriculum- and grade-aware) → structured quiz JSON output → stored in DB → rendered in frontend quiz UI
- Use structured output (JSON schema-constrained generation) for quiz questions — never free-text parsing that could break the UI
- Build a provider-abstraction layer so the underlying LLM can be swapped without rewriting business logic
- Implement cost controls: token usage logging per request, per-user monthly caps tied to subscription tier, and a fallback/cache layer for repeated similar content
- Build the AI Tutor chat (post-MVP) as a scoped, curriculum-aware assistant — not an open-ended general chatbot

### 4.5 DevOps/Infrastructure Agent
**Brief:** Set up CI/CD, environments, and monitoring.
- Three environments: local (Docker Compose), staging, production
- CI pipeline: lint → type-check → unit tests → integration tests → build → deploy (fail fast, block merge on any red step)
- Set up Sentry for error tracking and PostHog/Plausible for privacy-respecting analytics (no third-party ad-tracking pixels — see guardrails)
- Configure automated database backups (daily, with tested restore procedure) given this handles children's educational data
- Set up staging environment secrets separately from production; never share API keys across environments

### 4.6 QA/Testing Agent
**Brief:** Own test coverage and release quality gates.
- Enforce minimum test coverage threshold (suggest 70%+ for business logic modules; UI snapshot tests for critical flows)
- Write end-to-end tests (Playwright) for critical user journeys: signup → child profile creation → curriculum selection → material upload → quiz generation → quiz completion → dashboard update
- Test freemium tier gating explicitly (verify free-tier limits are enforced server-side, not bypassable via client manipulation)
- Test offline/low-bandwidth degradation paths, not just the happy path on fast connections

### 4.7 UI/UX Design Agent
**Brief:** Own the design system and visual language, following the `frontend-design` best-practices approach.
- Establish a design token system (colors, spacing, typography scale) rather than ad hoc Tailwind classes scattered through components
- Design two distinct visual modes: a calmer, information-dense **parent dashboard** and a warmer, gamified **learner interface** with age-appropriate visual language (avoid infantilizing older learners — consider age-banded UI variants)
- Ensure color contrast meets WCAG AA at minimum throughout
- Design empty states, loading states, and error states for every major screen — not just the "happy path" mockup

---

## 5. Industry-Standard Features (MVP + Roadmap)

### 5.1 MVP (Must-Have)
- Secure authentication (email/password + optional Google OAuth)
- Parent dashboard with multi-child support
- CBC curriculum module (strands/sub-strands) for pilot grade bands
- Material upload → AI-generated quiz (MCQ + short answer)
- Progress bar per subject, updated on quiz completion
- Jitsi live session scheduling and join flow
- One-way Google Calendar sync
- Free tier with enforced usage caps
- Basic notification system (in-app + email)

### 5.2 Phase 2 (Should-Have)
- Cambridge/GCSE and American curriculum modules
- Abacus curriculum module
- M-Pesa payment integration for Family/Premium tiers
- Sibling comparison view (opt-in, framed constructively, not competitively)
- Spaced-repetition review scheduling
- Downloadable/offline lesson packs

### 5.3 Phase 3 (Nice-to-Have / Differentiators)
- AI Tutor chat (scoped, curriculum-aware)
- Homeschool co-op scheduling and shared classes
- Tutor/content-partner marketplace with revenue share
- Kiswahili full localization
- Printable report cards / certificates
- Badges and milestone gamification system

---

## 6. Design Practices to Enforce

- **Mobile-first, low-bandwidth-first**: design and test on throttled 3G-equivalent connections before assuming broadband
- **Accessibility by default**: semantic HTML, ARIA where needed, full keyboard navigability, no color-only status indicators
- **Progressive enhancement**: core flows (view lesson, take quiz) must work with minimal JS if the client's connection degrades; heavier features (live video) can require full JS
- **Consistent design tokens**: no hardcoded hex colors or magic-number spacing in components — pull from a central theme config
- **Empty/loading/error states designed upfront**, not bolted on after the "happy path" is built
- **Componentization**: no duplicated UI logic across parent/learner views — shared primitives, role-specific compositions

---

## 7. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load (initial, 3G-equivalent) | < 3 seconds to interactive |
| API response time (p95) | < 500ms for non-AI endpoints |
| AI quiz generation latency | < 15 seconds, with a visible progress/loading state |
| Uptime target | 99.5% (appropriate for a growth-stage product, not over-engineered to enterprise SLAs) |
| Accessibility | WCAG 2.1 AA minimum |
| Data backup frequency | Daily, with monthly restore drills |

---

## 8. Guardrails (Mandatory — All Agents Must Follow)

### 8.1 Security
- **Never hardcode secrets, API keys, or credentials** in source code — all must come from environment variables managed via a secrets manager, never committed to version control
- All user input must be validated and sanitized server-side, regardless of client-side validation
- Enforce HTTPS everywhere; no mixed content
- Passwords hashed with `bcrypt`/`argon2` — never stored or logged in plaintext
- Implement rate limiting on all public-facing endpoints, especially auth and AI endpoints, to prevent abuse and cost overruns

### 8.2 Children's Data & Privacy
- This platform processes **children's educational data** — treat all learner data with the highest privacy standard even where not strictly mandated by local law
- Parents/guardians must explicitly consent to AI processing of uploaded materials at signup
- Uploaded materials and AI-generated content must be scoped to the family account — no cross-family data leakage, ever (test this explicitly)
- Provide a clear, accessible data deletion path (account + child profile deletion must cascade correctly and be honored within a defined timeframe)
- No behavioral advertising, no selling of user data, no third-party ad-tracking pixels
- Comply with Kenya's **Data Protection Act (2019)** requirements for data controllers/processors as a baseline; design with GDPR-equivalent principles in mind for future portability

### 8.3 AI Usage Guardrails
- AI-generated quiz content must be **reviewable by the parent before being presented as authoritative** to the child, at least at MVP stage (avoid unsupervised AI content reaching a child unchecked)
- AI Tutor chat (Phase 3) must be scoped strictly to curriculum-relevant, age-appropriate content — implement content filtering and refuse out-of-scope or unsafe queries
- Log and monitor AI token usage per user to prevent cost blowouts; enforce hard caps per tier server-side
- Do not present AI-generated content as human-verified or "official curriculum-approved" — always label AI-generated material clearly as such

### 8.4 Payments & Billing
- Never store raw payment card details — use tokenized payment provider flows (Stripe/Flutterwave) and M-Pesa's official Daraja API integration patterns only
- All subscription tier enforcement (usage caps, feature gating) must be validated **server-side** on every request, never trusted from client state alone
- Provide clear, itemized billing history and an easy self-service cancellation flow — no dark patterns around subscription cancellation

### 8.5 Engineering Process Guardrails
- No agent merges code without passing lint, type-check, and test suites in CI
- No destructive database migration runs against staging or production without an explicit human review step
- Every new external dependency must be justified against the "feature-rich but lightweight" principle — check bundle size / infra cost impact before adding
- Feature flags should gate any Phase 2/3 feature rollout — nothing ships directly to 100% of users without a controlled rollout
- Document any deviation from this spec inline in code comments and in a shared changelog, so future agents/humans understand why

### 8.6 Content & Curriculum Integrity
- CBC content must be mapped against publicly available official curriculum documents — do not fabricate curriculum structure
- Any licensed curriculum content (Cambridge, American systems) must go through a legal/licensing review before being ingested into the platform — flag this explicitly rather than assuming public availability
- Community/co-op content (Phase 3) must go through a lightweight moderation review before publishing to other families

---

## 9. Deliverable Expectations for Each Agent

When any agent completes a unit of work, it should produce:
1. **Working code** committed to the appropriate module/directory, following the established project structure
2. **Tests** covering the new functionality (unit and, where applicable, integration/E2E)
3. **A short summary** of what was built, any deviations from this spec, and any new dependencies introduced (with justification against the lightweight principle)
4. **Updated documentation** (README or module-level docs) if the change affects setup, configuration, or usage

---

## 10. Suggested Build Order (For Orchestration)

1. Database schema (Data Architect Agent) → foundational, everything depends on it
2. Auth + core API scaffolding (Backend Agent)
3. Frontend shell + design system (UI/UX Agent + Frontend Agent, in parallel once API contracts are defined)
4. Curriculum module (CBC) end-to-end (Backend + Frontend + Data Architect)
5. Upload → AI quiz generation pipeline (AI Agent + Backend Agent)
6. Jitsi + Google Calendar integrations (Backend + Frontend)
7. Dashboard and progress tracking (Frontend + Backend)
8. Freemium tier enforcement (Backend, with QA verifying server-side enforcement)
9. CI/CD, monitoring, backups (DevOps Agent) — should be stood up early (Step 2) and refined throughout, not left to the end
10. Full QA pass and closed beta readiness review
