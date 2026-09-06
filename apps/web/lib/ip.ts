import crypto from "crypto";

/** Deterministic, non-reversible IP hash for audit logs (no PII, no raw IP). */
export function cryptoHashIp(ip: string): string {
  return crypto
    .createHash("sha256")
    .update(`whb:${ip}`)
    .digest("hex")
    .slice(0, 24);
}