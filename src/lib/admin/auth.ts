/**
 * Đăng nhập admin: tên đăng nhập + mật khẩu, phiên là cookie ký HMAC.
 *
 * Cookie mang HMAC của một nonce ngẫu nhiên chứ không mang mật khẩu, nên lộ
 * cookie không lộ `ADMIN_PASSWORD`, và mỗi phiên tự hết hạn sau MAX_AGE_SECONDS.
 * Ký bằng `ADMIN_SECRET` — đổi giá trị này là đăng xuất toàn bộ phiên đang mở.
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "flora_admin";
export const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * Dev để trống env thì dùng admin/admin cho tiện. Trên production KHÔNG có mặc
 * định: thiếu `ADMIN_PASSWORD` là không ai đăng nhập được, thay vì cả internet
 * đăng nhập được bằng admin/admin.
 */
function credentials(): { username: string; password: string } | null {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (process.env.NODE_ENV === "production") {
    if (!password) return null;
    return { username: username || "admin", password };
  }
  return { username: username || "admin", password: password || "admin" };
}

/** So sánh hai chuỗi bí mật trong thời gian hằng định, không phụ thuộc độ dài. */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}

function signingSecret(): string | null {
  const creds = credentials();
  if (!creds) return null;
  return process.env.ADMIN_SECRET || `${creds.username}:${creds.password}`;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function isLoginConfigured(): boolean {
  return credentials() !== null;
}

export function checkCredentials(username: string, password: string): boolean {
  const creds = credentials();
  if (!creds) return false;
  // Cả hai vế đều chạy để không lộ "sai user" hay "sai mật khẩu" qua thời gian.
  const okUser = safeEqual(username, creds.username);
  const okPassword = safeEqual(password, creds.password);
  return okUser && okPassword;
}

export function createSessionToken(): string {
  const secret = signingSecret();
  if (!secret) throw new Error("ADMIN_PASSWORD chưa được cấu hình");
  const payload = `${Date.now()}.${randomBytes(12).toString("hex")}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  const secret = signingSecret();
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
 * Hãm brute-force ở mức "gờ giảm tốc": instance serverless sống ngắn nên bộ đếm
 * này chỉ chặn được trên cùng một instance đang nóng. Cần chắc chắn hơn thì đặt
 * rate limit ở tầng edge.
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
