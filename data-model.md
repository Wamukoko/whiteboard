# Data Model — WhiteBoard

Core entities for the WhiteBoard modular monolith. Full definitions live in the Prisma schema (`packages/db`); this doc records the relationships, tenancy rules, and deletion semantics that agents must apply when touching data.

## Core entities

| Entity | Purpose | Parent scoping |
|---|---|---|
| `User` | Auth principal, one platform identity | global |
| `Role` | RBAC role (LEARNER, PARENT_GUARDIAN, EDUCATOR, etc.) | global |
| `FamilyAccount` | Tenancy root for home learners | global |
| `LearnerProfile` | A child/learner belonging to a family | `FamilyAccount` |
| `Institution` | School/college/TVET/university/NGO | global |
| `InstitutionMembership` | Links users to an institution (staff, learners) | `Institution` |
| `EducatorProfile` | Educator/tutor record | `User` |
| `Curriculum` | CBC, Cambridge, American, Abacus, institution-created | global |
| `Course` / `Subject` / `Topic` / `Lesson` | Curriculum hierarchy | `Curriculum` |
| `LearningProgress` | Per-learner progress on subjects/lessons | `LearnerProfile` |
| `Assessment` / `AssessmentAttempt` | Assessments and attempts | `LearnerProfile` |
| `UploadedMaterial` | Parent/educator uploads (PDF, scans, images) | `FamilyAccount` |
| `GeneratedLearningContent` | AI-generated quizzes/study content | `FamilyAccount` + `UploadedMaterial` origin |
| `Scholarship` / `Opportunity` | Published opportunities | provider org |
| `Application` / `ApplicationDocument` | Scholarship applications + attachments | `LearnerProfile` + `Scholarship` |
| `Subscription` | Family billing tier | `FamilyAccount` |
| `ScheduledSession` | Live Jitsi classes | scheduler + enrolled learners/institution |
| `Notification` | In-app + email/SMS | recipient scope |
| `AuditLog` | Immutable access log | global |

## Key relationships & rules

1. **Multi-curriculum-per-child is first-class.** A `LearnerProfile` joins to multiple `Curriculum` records via an enrollment join table (e.g., CBC + Cambridge simultaneously). This must never be modeled as a single `curriculum_id` column on the learner.

2. **Tenancy scoping.** `UploadedMaterial`, `GeneratedLearningContent`, `LearningProgress`, and `AssessmentAttempt` all carry a family (or institution) scoping key. Every query resolves the owning scope server-side; cross-scope reads are filtered structurally (shared query helpers), not left to endpoint discipline.

3. **AI content origin + review state.** `GeneratedLearningContent` records its source `UploadedMaterial`, the model/provider used, token cost, and a `reviewState` (pending parent review → approved → accessible to child). Unreviewed AI content is not shown to learners.

4. **Consent.** Parent/guardian consent (AI processing, scholarship applications for minors, data sharing) is stored as explicit consent records referencing what was consented to, when, and by whom. Consent state is surfaced wherever dependent data is read.

5. **Deletion cascade.** Deleting a `FamilyAccount` cascades to all learner profiles, uploaded materials, generated content, progress, attempts, and family-scoped applications. Institution deletion removes memberships and institution-scoped content, but learner-owned records persist under their family. Purge is honored within the DPA-defined timeframe; `AuditLog` retains only non-PII references.

6. **Audit.** Access to learner data, consent changes, and scholarship-application events append to `AuditLog` (who, what, when, scope) — required for children's-data compliance and for the platform's verified-dossier claims.

7. **Indexes tuned for dashboards.** Progress-by-child-by-subject, schedule-by-family, and mastery-over-time roll-ups drive index decisions. Result-set denormalization is deferred until a measured query forces it.

## Migration discipline

- Every migration ships with a rollback plan.
- Destructive migrations (drops, renames, type changes) require a reviewed human step before applying to staging/production.
- Prisma generates migrations from `packages/db`; seeds populate the CBC pilot structure from official curriculum documents only — never invented structure.