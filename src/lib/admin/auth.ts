/**
 * Admin session: a signed, self-expiring cookie token.
 *
 * The cookie carries an HMAC of a random nonce instead of the password itself,
 * so a leaked cookie no longer reveals `ADMIN_PASSWORD`, and every session dies
 * on its own after MAX_AGE_SECONDS. Sign with `ADMIN_SESSION_SECRET` when set —
 * rotating it invalidates every session without changing the password.
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "flora_admin";
export const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function sessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  return secret ? secret : null;
}

/** Compare two secrets in constant time regardless of length. */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function isPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}

export function createSessionToken(): string {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_PASSWORD is not configured");
  const payload = `${Date.now()}.${randomBytes(12).toString("hex")}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  const secret = sessionSecret();
  if (!token || !secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [issuedAt, nonce, signature] = parts;

  const issued = Number(issuedAt);
  if (!Number.isFinite(issued)) return false;
  if (Date.now() - issued > MAX_AGE_SECONDS * 1000) return false;

  return safeEqual(signature, sign(`${issuedAt}.${nonce}`, secret));
}

export async function isAdminAuthed(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
}

/**
 * Best-effort brute-force brake. Serverless instances are short-lived, so this
 * only slows an attacker down on a warm instance — it is a speed bump, not a
 * lock. Pair it with a real rate limit at the edge if the site gets targeted.
 */
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; first: number }>();

export function tooManyAttempts(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(key: string): void {
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: Date.now() });
    return;
  }
  entry.count += 1;
}

export function clearAttempts(key: string): void {
  attempts.delete(key);
}
