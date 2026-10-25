import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function generateReviewToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashReviewToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function tokensMatch(token: string, hashHex: string): boolean {
  const a = Buffer.from(hashReviewToken(token), "hex");
  const b = Buffer.from(hashHex, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
