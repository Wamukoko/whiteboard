# WhiteBoard Workers (BullMQ, ADR-005)

Background job process: AI generation, notifications, calendar invites.

**Phase 1 status:** placeholder only — the queue listener starts, but no jobs
are registered. Phase 2 wires the upload → AI → review pipeline here.

Rules (see `scaffolding.md`):
- Workers import only `packages/db`, `packages/shared`, `packages/config`. Never app pages.
- AI work stays off the request path; UI polls or receives a completion push.
- Server-side monthly caps are enforced here and re-checked at request time.