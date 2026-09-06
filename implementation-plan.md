# WhiteBoard Implementation Plan

**What it is:** A modular-monolith education platform (Next.js + PostgreSQL + Redis) connecting learners, parents, educators, institutions, and scholarship providers, with AI-generated practice content and low-bandwidth-first design.

**Who uses it:** Learners (multi-curriculum), Parents/Guardians (multi-child management), Educators/Tutors, Learning Institutions, Scholarship Providers, and Platform Administrators.

**What's out of scope (MVP):** Native mobile apps, multi-tenant microservices, advanced ML beyond quiz generation, complex payments beyond M-Pesa + card fallback.

**Key constraints:** Kenya-first low-bandwidth market, mobile-first on mid-range Android, children's-data privacy (Kenya DPA 2019 baseline, GDPR-equivalent principles), WCAG 2.1 AA, gender-equity as a brand differentiator, feature-rich but lightweight engineering.

---

## Phase 1 — Foundation (product foundation, schema, auth, learner/parent basics)

**Goal:** A family can sign up, create child profiles, select a curriculum, and see a working learner + parent dashboard with progress tracking.

- **Scope:**
  - `ui-ux-engineer` → design token system, learner + parent + institution + scholarship surface specs, empty/loading/error states
  - `database-architect` → full Prisma schema (all MVP entities), multi-curriculum-per-child, tenancy scoping, migration + rollback plan
  - `backend-engineer` → auth (email/password + Google OAuth), RBAC, Zod validation, rate limits, core API scaffolding
  - `frontend-engineer` → Next.js app shell, design-system wiring, learner (bottom-tab) + parent (sidebar) dashboards, PWA shell
  - `security-engineer` → auth hardening review, secret handling, consent-at-signup, children's-data scoping review
  - `devops-engineer` → Docker Compose local env, CI pipeline (lint → type-check → test → build), staging/prod envs, Sentry + privacy analytics, daily backups + restore drill
- **Sequencing:** Schema first (blocks auth + dashboards). Auth + frontend shell in parallel once API contracts exist. CI stood up at the same time as the first code.
- **Exit criteria:** A fresh user can sign up, add a child, pick a curriculum, and see a populated parent dashboard; learner dashboard renders on a 360px viewport over throttled 3G; CI passes and backups restore successfully.
- **Decisions needed:** Curriculum coverage for the CBC pilot (which grade bands/strands ship first); hosting provider choice (Vercel vs Railway/Render).
- **Risks:** CBC curriculum accuracy → mitigate by mapping against official KICD documents, never fabricating structure; AI dependency → none in this phase, cost baseline low.

---

## Phase 2 — Learning & AI Quizzes (upload → AI quiz pipeline, progress)

**Goal:** A parent can upload a worksheet, the AI generates a structured quiz, the parent reviews it, the child completes it, and progress updates on the dashboard.

- **Scope:**
  - `ai-engineer` → provider abstraction, upload → OCR/text extraction → chunking → curriculum-aware prompt → structured quiz JSON, token usage logging, per-user monthly caps
  - `database-architect` + `backend-engineer` → UploadedMaterial + GeneratedContent + QuizAttempt schema/API, BullMQ background job wiring, parent-review gate
  - `frontend-engineer` + `ui-ux-engineer` → upload drag-drop flow, quiz-rendering UI, parent review screen, quiz completion + streak/momentum UI (learner surface), progress bars updated from attempts
  - `qa-engineer` → journey tests (upload → generate → review → complete → dashboard update), cross-family leakage tests, cap-bypass tests, AI-label verification
- **Sequencing:** Schema + API first, then AI pipeline, then UI, then tests. AI work can start in parallel with Phase 1 end if the schema lands early.
- **Exit criteria:** Full journey passes E2E on 3G; generated quizzes always parse to valid schema; parent gate blocks unreviewed AI content; caps enforced server-side; no cross-family data exposure in tests.
- **Decisions needed:** LLM provider + pricing model (Anthropic Claude assumed per spec); OCR approach (cloud vs tesseract.js) based on cost.
- **Risks:** AI cost overruns → token logging + hard monthly caps from day one; poor OCR on handwritten notes → default to cloud OCR path, keep tesseract fallback.

---

## Phase 3 — Institutional Affiliation + Scholarship Hub

**Goal:** Institutions can create verified profiles and manage learners/classes; families can discover and apply to scholarship and educational opportunities.

- **Scope:**
  - `database-architect` + `backend-engineer` → Institution, InstitutionMembership, Scholarship, Opportunity, Application, ApplicationDocument schema/API, RBAC for INSTITUTION_ADMIN + SCHOLARSHIP_PROVIDER, application status workflow (Draft → Submitted → Under Review → Shortlisted → Approved → Declined → Awarded)
  - `frontend-engineer` + `ui-ux-engineer` → institution dashboard (metrics row, roster table, mastery distribution), scholarship hub (facet sidebar + card grid, deadline indicators, verified badges), application flow
  - `security-engineer` → scholarship-provider data scoping review, institution authorization review, consent for minors in applications
  - `qa-engineer` → institution learner-registry tests, scholarship application journey tests, permission-boundary tests
- **Sequencing:** Institution + scholarship schemas first (shared Application entity binds them), then institution UI, then scholarship UI, then QA. M-Pesa billing deferred to Phase 4 per build order.
- **Exit criteria:** An institution admin can invite learners and see a roster; a family can filter opportunities, start an application, and track status; a scholarship provider cannot see applicants beyond their own.
- **Decisions needed:** Eligibility/matching rules transparency policy; whether to ship internal application workflows or external-link-only first.
- **Risks:** Licensing of Cambridge/IGCSE content → flag for legal review, never auto-ingest; application-moderation overhead → start with verified-partner publishing only.

---

## Phase 4 — Live Learning, Calendar, Billing, Notifications, Analytics

**Goal:** Families can schedule/join live classes, sync calendars, subscribe with M-Pesa/card, receive notifications, and administrators can see platform analytics.

- **Scope:**
  - `backend-engineer` + `devops-engineer` → Jitsi integration (scheduled sessions, join links, attendance), Google Calendar one-way sync, M-Pesa Daraja + Stripe/Flutterwave tokenized checkout, BullMQ notification jobs (in-app + email/SMS), analytics endpoints
  - `frontend-engineer` + `ui-ux-engineer` → live class scheduling/join screen, calendar view, subscription + billing history UI, notification center
  - `security-engineer` → payment tokenization review, rate limiting for auth/AI as volumes grow, subscription-enforcement server-side audit
  - `qa-engineer` → billing journey E2E (subscribe → gate → cancel), live session join flow, calendar sync verification, freemium cap enforcement at API level
- **Sequencing:** Payments + Jitsi/calendar have no dependency on each other → parallel tracks after schema phase. Notifications + analytics depend on both, so they follow.
- **Exit criteria:** A parent can pay via M-Pesa and the family tier unlocks at server side; a learner can join a scheduled Jitsi session and attendance records; calendar events appear in Google Calendar; admins see accurate platform analytics.
- **Decisions needed:** Billing tier definitions/pricing; M-Pesa callback endpoint responsibilities; Jitsi self-host vs external.
- **Risks:** Payment integration complexity → tokenized provider flows only, test sandbox first; Jitsi bandwidth on low-end devices → attendance + join flow covers the minimum, video quality is provider's concern.

---

## Future considerations (deferred from MVP)

- Additional curricula (Cambridge/GCSE shipping as content, American + Abacus later) — content licensing review required per Phase 2
- AI Tutor chat, study guides, spaced-repetition review — reuse the Phase 2 prompt-and-parse pipeline
- Tutor/content-partner marketplace with revenue share
- Kiswahili full localization (next-intl scaffolded, English-first)
- Offline learning packs (PWA shell exists; full offline lessons deferred)
- Sibling comparison view (opt-in, framed constructively)
- Educational Opportunity Profile for transparent matching (always opt-in, non-discriminatory, never auto-gates eligibility)

## Open decisions (from Step 0)

| Decision | Classification | Resolution |
|---|---|---|
| Network/hosting | Blocks implementation | Assumed: deploy via Vercel/Railway/Render at MVP, note under Phase 1 "Decisions needed" |
| LLM provider | Blocks implementation (Phase 2) | Assumed: Anthropic Claude with provider abstraction — note under Phase 2 |
| CBC pilot scope | Blocks implementation (Phase 1) | Assumed: start with a scoped grade-band pilot; note under Phase 1 |
| Billing tiers/pricing | Blocks implementation (Phase 4) | Deferred decision: note under Phase 4 |
| Content licensing (Cambridge) | Blocks implementation | Deferred: legal review required before ingestion; note under Phase 3/Future |
| Exact localization languages | Nice-to-have | English-first, Kiswahili planned — note under Future considerations |

## Future considerations

- Add `mobile-engineer.md` only if a native iOS/Android target is confirmed — currently PWA covers the mobile surface.
- Re-evaluate modular-monolith -> service extraction when AI quiz generation or billing volume justifies it; the module boundaries already support it.
- Expand test strategy doc when regulated data (children's DPA) or payments drive stricter requirements — currently folded into qa-engineer scope.

---

## Step 0 flags not yet addressable

| Item | Status |
|---|---|
| Surveillance: none | Addressed |
| Repo sync (Step 4a) | Blocked on git/gh availability — see note below |

Per README Step 4a: the GitHub repository at `https://github.com/Wamukoko/whiteboard` is created when the first phase is *implemented* (not at the planning stage), and this requires git + `gh` configured in the environment. If either is missing, state the blocker before proceeding.