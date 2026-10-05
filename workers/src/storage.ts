import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { STORAGE_ROOT } from "@whb/config";

/**
 * Local-disk object storage for uploaded materials (Phase 2).
 *
 * Keys are namespaced per family so a listing can never cross tenants. Every
 * read resolves the key to an absolute path and asserts it stays inside the
 * storage root: a key is derived from user input at upload time, so a missing
 * check here is a directory-traversal read of the whole filesystem.
 *
 * The key namespace is deliberately independent of the backend, so moving to
 * S3/R2 later changes this file only (ADR-005).
 */

const ROOT = path.resolve(process.cwd(), process.env.STORAGE_ROOT ?? STORAGE_ROOT);

/** Build a storage key. Family-scoped so listings cannot cross tenants. */
export function buildStorageKey(familyId: string, materialId: string, extension: string): string {
  return path.posix.join(
    "families",
    sanitizeSegment(familyId),
    "materials",
    `${sanitizeSegment(materialId)}${sanitizeExtension(extension)}`,
  );
}

function sanitizeSegment(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, "");
  if (cleaned.length === 0) {
    throw new Error("Storage key segment is empty after sanitization");
  }
  return cleaned;
}

/** Allow at most one leading dot, so an extension can never carry "..". */
function sanitizeExtension(extension: string): string {
  const body = extension.startsWith(".") ? extension.slice(1) : extension;
  const cleaned = body.replace(/[^a-zA-Z0-9]/g, "");
  return cleaned.length > 0 ? `.${cleaned}` : "";
}

/** Resolve a key to an absolute path, refusing anything outside the root. */
export function resolveStoragePath(key: string): string {
  const resolved = path.resolve(ROOT, key);

  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    throw new Error(`Refusing to access path outside storage root: ${key}`);
  }
  return resolved;
}

export async function putObject(key: string, bytes: Uint8Array): Promise<void> {
  const target = resolveStoragePath(key);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes);
}

export async function getObject(key: string): Promise<Uint8Array> {
  return readFile(resolveStoragePath(key));
}

export function storageRoot(): string {
  return ROOT;
}