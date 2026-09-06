# Testing Strategy — WhiteBoard

WhiteBoard handles children's educational data, AI-generated content, and payments. "Write some tests" is insufficient here — the strategy below is the bar any feature must clear before its phase is complete.

## Levels

### Unit tests (fast, CI-only)
- **Shared validation:** Zod schemas accept valid payloads and reject invalid ones; error messages are plain-language.
- **Business-logic modules:** progress calculation from attempts, subscription-cap math, application-status transitions (Draft → Submitted → Under Review → Shortlisted → Approved → Declined → Awarded), streak/score aggregation.
- **Workers:** quiz-generation parser returns structured output from valid and adversarial LLM responses; notification templating; cost/cap accounting.
- **Target:** ≥70% coverage on business-logic and shared packages. Lower bar on presentational UI; covered by E2E + snapshot.

### Integration tests
- **API with real DB (test Postgres):** endpoints validate via Zod, enforce RBAC, respect family/institution scoping, and apply rate limits. Every module has integration tests before it's marked complete.
- **AI pipeline:** upload → extraction → chunking → generation against a mocked provider returning fixtures — verifies the pipeline and the structured-output contract without external cost.
- **Billing:** subscription gate, cap enforcement, M-Pesa callback handling against sandbox/documented fixtures.

### E2E tests (Playwright)
Critical journeys, run against a staging-like environment:
1. Signup → add child profile → select curriculum → dashboard loads.
2. Material upload → AI quiz generation → parent review → quiz completed → progress updates.
3. Parent multi-child overview renders correct progress per child.
4. Institution admin invites learners, views roster table, and sees scoped telemetry.
5. Scholarship discovery (filters + deadline indicator) → application start → status tracking.
6. Freemium cap hit at the API level with default caps — prove caps are enforced server-side under client manipulation.
7. Live Jitsi session scheduling → join flow → attendance recorded.
8. Billing: subscribe (M-Pesa/card) → tier unlocks → cancellation self-serve.

### Accessibility (WCAG 2.1 AA) checks
- Keyboard operability and visible focus on every interactive element.
- Color contrast across all four role surfaces.
- `prefers-reduced-motion` respected (no forced animation).
- Screen-reader flow for the core learner and parent journeys.
- 360px-wide viewport rendering (no horizontal overflow).

## Non-functional test matrix

| Requirement | How it's verified |
|---|---|
| Initial load < 3s on 3G | Lighthouse + Playwright throttling on learner/parent dashboards |
| Non-AI API p95 < 500ms | Load check on dashboard read endpoints |
| AI generation < 15s | Worker timing test with progress-state assertion |
| Offline/low-bandwidth | Throttled runs + PWA offline-shell check (offline test matrix) |
| No cross-family leakage | Dedicated security test: account A cannot read account B's learner data, uploads, or AI content at any endpoint or worker path |

## Privacy & security tests (mandatory subset)
- Cross-family and cross-institution data isolation, including after deletion cascades.
- Consent-gate: unreviewed AI content is never served to a learner.
- AI-labeling: generated content always carries the AI-generated marker.
- Secret handling: no secrets in repo/logs (static scan in CI).
- RBAC: each permission matrix combo asserted for allow/deny.

## Quality gate in CI

Pipeline order (fails fast, blocks merge): lint → type-check → unit tests → integration tests → build. E2E + accessibility run in the deploy pipeline against the staging environment. A red step blocks the phase from being marked complete.

## Ownership

qa-engineer owns the strategy, the suite, and the release gate. Feature agents (frontend/backend/ai) write the tests for their own work; qa reviews, fills gaps, and runs the manual smoke pass before phase completion.