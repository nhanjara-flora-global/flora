"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "flora_admin";

export async function isAdminAuthed() {
  const jar = await cookies();
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return jar.get(COOKIE)?.value === expected;
}

export async function adminLogin(formData: FormData) {
  const password = String(formData.get("password") || "");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) {
    redirect("/admin/login?error=1");
  }
  const jar = await cookies();
  jar.set(COOKIE, expected, {
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
