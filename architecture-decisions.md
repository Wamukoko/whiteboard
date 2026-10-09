# Architecture Decisions — WhiteBoard

ADR log for decisions that are expensive to reverse. Each entry records the context, the options, and the decision so future agents (or humans) understand why the codebase is shaped this way.

## ADR-001: Modular monolith vs microservices

**Context:** WhiteBoard is a multi-surface education platform (parent/learner/institution/scholarship) with AI processing, payments, and children's-data compliance. Microservices add operational cost that a small, budget-conscious team can't justify at MVP.

**Decision:** Modular monolith. One deployable app (Next.js, or Next.js + NestJS) with strict module boundaries mirroring the Prompt.md module list. Any module can be extracted into its own service later without a rewrite.

**Status:** Accepted.

## ADR-002: Next.js API routes vs NestJS for the backend

**Context:** The spec explicitly allows either "Next.js API routes for simpler MVP deployments" or "NestJS for a more structured API layer." Both are viable; reversing is expensive.

**Decision:** **Next.js API routes for MVP** (single process, cheapest to run, simplest deploy), structured as domain-module route groups. Adopt NestJS only if the API outgrows route-handler structure (complex DI, cross-module orchestration, many integrations). The `packages/shared` Zod schema boundary is the seam that makes this swap low-cost — business logic never lives inside a route handler.

**Status:** Accepted (with documented swap path).

## ADR-003: PostgreSQL + Prisma as single source of truth

**Context:** Curriculum → subject → strand → lesson hierarchies, multi-curriculum-per-child, and dashboard reporting queries fit relational modeling well. ORM choice affects every data migration.

**Decision:** PostgreSQL with Prisma ORM. Prisma gives type-safe queries, first-class migrations, and an easy model for consent-scoped access through query scoping. Redis is cache/jobs only — never source of truth.

**Status:** Accepted (spec-locked).

## ADR-004: LLM provider abstraction (Anthropic Claude initially)

**Context:** AI features (quiz generation, later tutor/study-guides) depend on an LLM. Provider choice affects cost, quality, and compliance; the spec requires a swap-safe abstraction.

**Decision:** Anthropic Claude via a provider-abstraction interface (generate structured JSON per a Zod-constrained schema). Token usage logged per request, hard monthly caps per tier enforced server-side. Provider swap requires no business-logic changes.

**Status:** Accepted. Provider may change; abstraction protects us.

**Implementation (Phase 2):** Provider and model are data, not code. `packages/shared/src/providers.ts` is the registry (provider kind, API-key env var, default base URL, model list, per-provider default model). `requestQuizGenerationSchema` accepts `provider` + `model`, validates the model against its provider (a closed provider only allows registered models; an OpenAI-compatible provider accepts any non-empty id), and defaults to the deployment default. `workers/src/ai/index.ts` resolves provider/model as request -> env (`AI_PROVIDER`, `AI_MODEL`, `AI_BASE_URL`) -> registry default, then returns either `AnthropicQuizGenerator` (forced tool call) or `OpenAICompatibleQuizGenerator`. The latter speaks `POST {baseUrl}/chat/completions`, so Ollama, vLLM, LM Studio, llama.cpp server, OpenRouter, Groq and friends can be added by configuration alone — no schema, factory or job-handler changes. Token usage is read from the response and estimated when a local server omits it, so caps still bill. Transcription (PDF/image OCR) remains Anthropic-only for now. A DB-backed, admin-editable catalog is the Phase 3+ extension.

## ADR-005: Background jobs via BullMQ (Redis), not synchronous request work

**Context:** AI generation takes up to 15s. Running it inline in the request path would blow the <500ms p95 and drown a constrained mobile user.

**Decision:** BullMQ workers on Redis for AI generation, calendar invites, and notifications. UI shows progress/skeleton states and polls or receives a completion push. Free-tier caps are enforced server-side in the worker path (and re-checked at request time).

**Status:** Accepted.

## ADR-006: FamilyAccount as the tenancy root for learner data

**Context:** Children's educational data must never leak across accounts. The prompt demands cross-family isolation as a blocker.

**Decision:** `FamilyAccount` (and separately `Institution`) are the highest-level scoping entities. Every learner material, AI-generated content, and progress record resolves to a family (or institution) server-side before any read/write. Scholarship providers see only their own applications; institutions only authorized learners.

**Status:** Accepted. Bound to the guardrails; tested explicitly by qa-engineer.

## ADR-007: Tokenized payments only (M-Pesa Daraja + Stripe/Flutterwave)

**Context:** Kenya-first market makes M-Pesa the primary rail; diaspora needs card fallback. Raw card data is a compliance liability in a children's-data platform.

**Decision:** M-Pesa Daraja API for mobile money and tokenized card checkout via Stripe or Flutterwave. No card details ever stored. Subscription-tier enforcement (feature gates, AI caps) is validated server-side on every request, never from client state.

**Status:** Accepted.

## ADR-008: One shared Zod schema package across frontend/backend

**Context:** The spec requires "zod validation shared with the frontend where possible." Divergent validation between layers causes bugs and security gaps.

**Decision:** All request/response schemas live in `packages/shared`. Frontend (React Hook Form) and backend (route handlers or NestJS pipes) import from the same source. A schema change is one PR, not a drift.

**Status:** Accepted.