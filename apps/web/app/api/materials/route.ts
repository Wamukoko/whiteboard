import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@whb/db";
import { buildStorageKey, putObject } from "@whb/workers/web";
import { isAuthFailure, resolveParentContext, extensionForMime, isAllowedMimeType, uploadLimitBytes } from "@/lib/learning";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/materials — upload a source document (PDF / image / text).
 *
 * Tenancy: the familyId comes from the session, and the target learner is
 * verified to belong to that family before a byte is written. The filesystem
 * key is namespaced by family so a listing can never cross tenants.
 *
 * GET /api/materials — list the family's materials with generation status,
 * newest first, for the parent review screen.
 */

export async function POST(request: NextRequest) {
  const context = await resolveParentContext();
  if (isAuthFailure(context)) return context.response;
  const { user, familyId } = context;

  const limit = rateLimit(`materials:${user.id}`, { max: 30, windowSeconds: 3600 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many uploads. Try again later." } },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Expected multipart form data." } },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  const learnerIdRaw = formData.get("learnerId");
  const learnerId = typeof learnerIdRaw === "string" ? learnerIdRaw.trim() : "";

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: { code: "NO_FILE", message: "Attach a file to upload." } },
      { status: 400 },
    );
  }
  if (!learnerId) {
    return NextResponse.json(
      { error: { code: "NO_LEARNER", message: "Choose which learner this is for." } },
      { status: 400 },
    );
  }

  if (!isAllowedMimeType(file.type)) {
    return NextResponse.json(
      {
        error: {
          code: "UNSUPPORTED_TYPE",
          message: "Supported formats: PDF, PNG, JPEG, WebP, or plain text.",
        },
      },
      { status: 415 },
    );
  }

  const maxBytes = uploadLimitBytes();
  if (file.size <= 0 || file.size > maxBytes) {
    return NextResponse.json(
      {
        error: {
          code: "FILE_TOO_LARGE",
          message: `Files must be between 1 byte and ${Math.round(maxBytes / (1024 * 1024))}MB.`,
        },
      },
      { status: 413 },
    );
  }

  const learner = await prisma.learnerProfile.findFirst({
    where: { id: learnerId, familyId },
    select: { id: true },
  });
  if (!learner) {
    return NextResponse.json(
      { error: { code: "LEARNER_NOT_FOUND", message: "That learner is not in your family." } },
      { status: 404 },
    );
  }

  const extension = extensionForMime(file.type);
  if (!extension) {
    return NextResponse.json(
      { error: { code: "UNSUPPORTED_TYPE", message: "Unsupported file type." } },
      { status: 415 },
    );
  }

  // Id is minted here (not by Prisma) so the storage key can be derived before
  // the row exists. A crash between disk write and row insert leaves an orphan
  // blob, never a row pointing at a missing file.
  const materialId = randomUUID();
  const storageKey = buildStorageKey(familyId, materialId, extension);
  const bytes = new Uint8Array(await file.arrayBuffer());

  await putObject(storageKey, bytes);

  const fileName = file.name.trim().slice(0, 255) || `upload.${extension}`;

  const material = await prisma.uploadedMaterial.create({
    data: {
      id: materialId,
      familyId,
      uploadedById: user.id,
      fileName,
      mimeType: file.type,
      sizeBytes: file.size,
      storageKey,
      extractionState: "PENDING",
    },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      extractionState: true,
      createdAt: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "material.upload",
      scopeType: "family",
      scopeId: familyId,
    },
  });

  return NextResponse.json({ ok: true, data: { material } }, { status: 201 });
}

export async function GET() {
  const context = await resolveParentContext();
  if (isAuthFailure(context)) return context.response;
  const { familyId } = context;

  const materials = await prisma.uploadedMaterial.findMany({
    where: { familyId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      extractionState: true,
      failureReason: true,
      createdAt: true,
      generated: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          learnerId: true,
          generationState: true,
          reviewState: true,
          failureReason: true,
          model: true,
          createdAt: true,
        },
      },
    },
  });

  return NextResponse.json({ ok: true, data: { materials } });
}
