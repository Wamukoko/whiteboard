/**
 * Phase 2 journey QA — run against a live dev/staging server.
 *
 *   pnpm qa:journey
 *
 * Covers the exit-criteria paths that unit tests cannot reach:
 *   upload -> AI-review gate -> assessment materializes only on approval ->
 *   answer key never leaves the server -> server-side grading ->
 *   cross-family isolation -> monthly cap enforced server-side.
 *
 * It provisions its own throwaway families/users (via the real signup API) and
 * deletes them again on exit, so it is safe to run repeatedly against a dev DB.
 * Redis/Anthropic are NOT required: the cap loop tolerates the queue-down path.
 */
import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Prisma auto-loads packages/db/.env (stale local creds), so the web app's env
// is treated as authoritative here — it is the DB the running server uses.
{
  const envPath = resolve(process.cwd(), "../../apps/web/.env.local");
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (match?.[1]) {
        process.env[match[1]] = (match[2] ?? "").replace(/^["']|["']$/g, "");
      }
    }
  }
}

const prisma = new PrismaClient();

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const RUN = Date.now().toString(36);
const A_EMAIL = `qa.journey.a.${RUN}@example.com`;
const B_EMAIL = `qa.journey.b.${RUN}@example.com`;
const PASSWORD = "correct-horse-battery";

const PAYLOAD = {
  metadata: { title: "QA Journey Fractions Quiz", curriculumCode: "CBC", gradeBand: "G4" },
  questions: [
    {
      id: "q1",
      type: "MULTIPLE_CHOICE",
      prompt: "Which fraction equals one half?",
      options: ["2/4", "1/3", "3/4"],
      correctAnswer: "2/4",
      explanation: "2/4 simplifies to 1/2.",
      difficulty: "EASY",
      topic: "Fractions",
    },
    {
      id: "q2",
      type: "TRUE_FALSE",
      prompt: "Three quarters is greater than one half.",
      options: ["True", "False"],
      correctAnswer: "True",
      difficulty: "EASY",
      topic: "Fractions",
    },
    {
      id: "q3",
      type: "SHORT_ANSWER",
      prompt: "Write one quarter using digits.",
      correctAnswer: "1/4",
      difficulty: "MEDIUM",
      topic: "Fractions",
    },
  ],
};
const CORRECT = ["2/4", "True", "1/4"];

let passed = 0;
let failed = 0;
function check(name: string, ok: boolean, detail?: string) {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

class Jar {
  private cookies = new Map<string, string>();

  private absorb(res: Response) {
    const raw: string[] = res.headers.getSetCookie?.() ?? [];
    for (const line of raw) {
      const pair = line.split(";")[0] ?? "";
      const eq = pair.indexOf("=");
      if (eq > 0) this.cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    }
  }

  async fetch(path: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    if (this.cookies.size) {
      headers.set("cookie", [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; "));
    }
    const res = await fetch(`${BASE}${path}`, { ...init, headers, redirect: "manual" });
    this.absorb(res);
    return res;
  }
}

async function signup(email: string, name: string) {
  const res = await fetch(`${BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, email, password: PASSWORD, confirmPassword: PASSWORD, consent: true }),
  });
  if (!res.ok && res.status !== 409) {
    throw new Error(`signup ${email} failed: ${res.status} ${await res.text()}`);
  }
}

async function login(email: string): Promise<Jar> {
  const jar = new Jar();
  const csrfRes = await jar.fetch("/api/auth/csrf");
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
  const body = new URLSearchParams({ csrfToken, email, password: PASSWORD, json: "true" });
  await jar.fetch("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const probe = await jar.fetch("/api/materials");
  if (probe.status !== 200) throw new Error(`login ${email} did not establish a session (${probe.status}).`);
  return jar;
}

async function cleanup() {
  for (const email of [A_EMAIL, B_EMAIL]) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) continue;
    const memberships = await prisma.familyMembership.findMany({ where: { userId: user.id } });
    for (const { familyId } of memberships) {
      const contents = await prisma.generatedLearningContent.findMany({
        where: { familyId },
        select: { id: true },
      });
      const contentIds = contents.map((c) => c.id);
      if (contentIds.length) {
        await prisma.assessment.deleteMany({ where: { sourceContentId: { in: contentIds } } });
      }
      await prisma.familyAccount.delete({ where: { id: familyId } });
    }
    await prisma.user.delete({ where: { id: user.id } });
  }
}

async function main() {
  console.log(`Phase 2 journey QA against ${BASE}\n`);
  await cleanup();
  await signup(A_EMAIL, "QA Journey Alpha");
  await signup(B_EMAIL, "QA Journey Beta");

  const userA = await prisma.user.findUniqueOrThrow({ where: { email: A_EMAIL } });
  const familyA = await prisma.familyMembership.findFirstOrThrow({ where: { userId: userA.id } });
  const learnerA = await prisma.learnerProfile.create({
    data: {
      familyId: familyA.familyId,
      fullName: "QA Alpha Learner",
      dateOfBirth: new Date("2016-03-01"),
      gender: "PREFER_NOT_TO_SAY",
    },
  });

  const content = await prisma.generatedLearningContent.create({
    data: {
      familyId: familyA.familyId,
      learnerId: learnerA.id,
      contentType: "QUIZ",
      provider: "anthropic",
      model: "claude-sonnet-5",
      generationState: "READY",
      reviewState: "PENDING_REVIEW",
      payload: PAYLOAD,
    },
  });

  const jarA = await login(A_EMAIL);
  const jarB = await login(B_EMAIL);

  // --- Upload (real multipart through the route) ---
  console.log("Upload");
  const form = new FormData();
  form.set("file", new Blob(["Fraction worksheet: halves and quarters."], { type: "text/plain" }), "qa.txt");
  form.set("learnerId", learnerA.id);
  const uploadRes = await jarA.fetch("/api/materials", { method: "POST", body: form });
  const uploadJson = (await uploadRes.json()) as { data?: { material?: { id: string } } };
  const materialId = uploadJson.data?.material?.id;
  check("upload returns 201 + material id", uploadRes.status === 201 && Boolean(materialId), `status ${uploadRes.status}`);

  // --- Parent gate: pending content has no learner-visible assessment ---
  console.log("\nParent review gate");
  const listBefore = (await (await jarA.fetch("/api/assessments")).json()) as {
    data: { assessments: { title: string }[] };
  };
  check(
    "pending content is absent from the learner list",
    !listBefore.data.assessments.some((a) => a.title === PAYLOAD.metadata.title),
  );

  const reviewRes = await jarA.fetch(`/api/generation/${content.id}/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ reviewState: "APPROVED" }),
  });
  const reviewJson = (await reviewRes.json()) as { data?: { assessment?: { id: string } } };
  const assessmentId = reviewJson.data?.assessment?.id;
  check("approval materializes an assessment", reviewRes.ok && Boolean(assessmentId), `status ${reviewRes.status}`);

  // --- Answer key never reaches the client ---
  console.log("\nAnswer-key isolation");
  const detailRes = await jarA.fetch(`/api/assessments/${assessmentId}`);
  const detailText = await detailRes.text();
  check("detail response omits correctAnswer", detailRes.ok && !detailText.includes("correctAnswer"));
  const detail = JSON.parse(detailText) as {
    data: { assessment: { aiGenerated: boolean; label: string; questions: { id: string }[] } };
  };
  check("detail carries the AI-generated marker", detail.data.assessment.aiGenerated === true && detail.data.assessment.label === "AI-generated");
  const questionIds = detail.data.assessment.questions.map((q) => q.id);
  check("detail returns all questions", questionIds.length === 3);

  // --- Server-side grading ---
  console.log("\nServer-side grading");
  const answers = Object.fromEntries(questionIds.map((id, i) => [id, CORRECT[i] ?? ""]));
  const attemptRes = await jarA.fetch("/api/attempts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ assessmentId, answers, score: 999, maxScore: 999 }),
  });
  const attempt = (await attemptRes.json()) as { data: { attempt: { score: number; maxScore: number } } };
  check(
    "server ignores client score and grades correctly",
    attemptRes.status === 201 && attempt.data.attempt.score === 3 && attempt.data.attempt.maxScore === 3,
    JSON.stringify(attempt.data?.attempt),
  );

  // --- Cross-family isolation ---
  console.log("\nCross-family isolation");
  const foreignDetail = await jarB.fetch(`/api/assessments/${assessmentId}`);
  check("other family cannot read the quiz", foreignDetail.status === 404, `status ${foreignDetail.status}`);
  const foreignAttempt = await jarB.fetch("/api/attempts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ assessmentId, answers: {} }),
  });
  check("other family cannot submit an attempt", foreignAttempt.status === 404, `status ${foreignAttempt.status}`);

  // --- Monthly cap enforced server-side (drives the real counter) ---
  console.log("\nMonthly cap");
  let capped = false;
  let granted = 0;
  for (let i = 0; i < 40; i += 1) {
    const res = await jarA.fetch("/api/generation", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sourceMaterialId: materialId,
        learnerId: learnerA.id,
        questionCount: 5,
        difficulty: "EASY",
        model: "claude-haiku-4-5",
      }),
    });
    if (res.status === 429) {
      capped = true;
      break;
    }
    if (res.status !== 201 && res.status !== 202) {
      check("generation request accepted", false, `unexpected ${res.status}`);
      break;
    }
    granted += 1;
  }
  check("cap blocks further generation within 40 requests", capped);
  check("cap allowed at least one request first", granted >= 1, `granted ${granted}`);

  console.log(`\n${passed} passed, ${failed} failed`);
  return failed;
}

main()
  .then(async (failed) => {
    await cleanup();
    await prisma.$disconnect();
    process.exit(failed === 0 ? 0 : 1);
  })
  .catch(async (err) => {
    console.error("\nJourney crashed:", err);
    await cleanup().catch(() => undefined);
    await prisma.$disconnect();
    process.exit(1);
  });
