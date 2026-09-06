# Environments — WhiteBoard

Three environments are required: local, staging, production. Secrets are strictly split per environment and never shared. This doc records the matrix agents refer to when developing or deploying.

## Environment matrix

| | **Local** | **Staging** | **Production** |
|---|---|---|---|
| **Purpose** | Fast iteration (agents + humans) | Pre-prod E2E + QA + betas | Real users, children's data |
| **Host** | Docker Compose on dev machine | Vercel/Railway/Render (low-cost) | Vercel/Railway/Render (scaled) |
| **PostgreSQL** | Docker container | Managed DB (e.g., Neon/RDS/Supabase) | Managed DB with daily backups |
| **Redis** | Docker container | Managed or containerized | Managed (job queue + cache + rate limit) |
| **Object storage** | Local/minio stub | Cloudflare R2 or S3 staging bucket | R2 or S3 production bucket, versioned |
| **AI provider** | Mock/`anthropic` dev key, low caps | Provider sandbox/dev key | Provider production key, hard monthly caps |
| **Payments** | M-Pesa sandbox + Stripe test keys | M-Pesa sandbox + Stripe test keys | M-Pesa Daraja production + Stripe live |
| **Analytics** | Local/dev PostHog (or disabled) | PostHog/Plausible dev project | PostHog/Plausible production project |
| **Secrets** | `.env.local` (gitignored) | Vercel/env secrets, staging-only | Env secrets, prod-only, rotated |

## Rules

1. **No secret sharing across environments.** API keys, provider credentials, DB passwords are per-environment values in the secrets manager. A stage key must never be usable in production.
2. **Deploys flow local → staging → production.** CI promotes only green builds; destructive DB migrations require a human review step before applying to staging/production.
3. **Backups:** production DB backed up daily; restore drill monthly (devops-engineer owns scheduling, execution is verified by qa with a restore test).
4. **Feature flags gate Phase 2/3+ features.** Nothing ships to 100% of users without a controlled rollout (flag in config per environment).
5. **Proxy/local parity.** `docker compose up` should reproduce the same runtime as staging so environment-specific bugs surface early.

## Common gotchas
- M-Pesa callbacks must be reachable by the Daraja API → staging needs a publicly reachable URL (tunnel or hosted preview); document the callback URL per environment.
- Google Calendar OAuth redirect URIs differ per environment — register each.
- Jitsi: self-hosted instance needs a stable URL per env; external Jitsi can be used for staging while prod decides on self-host later (see ADR-005-related decisions).
- AI usage caps: staging uses dev keys with low budgets; production caps enforced server-side per tier and monitored for cost anomaly.