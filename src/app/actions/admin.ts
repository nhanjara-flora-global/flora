"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "flora_admin";

// Hệ thống nhỏ: mặc định admin / admin. Ghi đè bằng env trên Vercel khi cần.
const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin";

function credentials() {
  return {
    username: process.env.ADMIN_USERNAME || DEFAULT_USERNAME,
    password: process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD,
  };
}

/**
 * Giá trị đặt trong cookie — hash của user:pass (+ ADMIN_SECRET nếu có),
 * không lưu mật khẩu thô. Đặt ADMIN_SECRET trên Vercel để cookie không thể giả mạo.
 */
function sessionToken() {
  const { username, password } = credentials();
  const secret = process.env.ADMIN_SECRET || "";
  return createHash("sha256")
    .update(`flora:${username}:${password}:${secret}`)
    .digest("hex");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export async function isAdminAuthed() {
  const jar = await cookies();
  const value = jar.get(COOKIE)?.value;
  return !!value && safeEqual(value, sessionToken());
}

export async function adminLogin(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const c = credentials();

  if (!safeEqual(username, c.username) || !safeEqual(password, c.password)) {
    redirect("/admin/login?error=1");
  }

  const jar = await cookies();
  jar.set(COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function adminLogout() {
  const jar = await cookies();
  jar.delete(COOKIE);
  redirect("/admin/login");
}
