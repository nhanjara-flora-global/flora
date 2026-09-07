"use server";

import { refresh } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  MAX_AGE_SECONDS,
  checkCredentials,
  clearAttempts,
  createSessionToken,
  isAdminAuthed as readSession,
  isLoginConfigured,
  recordFailedAttempt,
  tooManyAttempts,
} from "@/lib/admin/auth";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  getServiceClient,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/admin/data";

export async function isAdminAuthed(): Promise<boolean> {
  return readSession();
}

async function clientKey(): Promise<string> {
  const list = await headers();
  return (
    list.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    list.get("x-real-ip") ??
    "unknown"
  );
}

export async function adminLogin(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!isLoginConfigured()) {
    redirect("/admin/login?error=config");
  }

  const key = await clientKey();
  if (tooManyAttempts(key)) {
    redirect("/admin/login?error=rate");
  }

  if (!checkCredentials(username, password)) {
    recordFailedAttempt(key);
    redirect("/admin/login?error=1");
  }

  clearAttempts(key);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  redirect("/admin");
}

export async function adminLogout() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export type UpdateOrderResult = { ok: true } | { ok: false; error: string };

/**
 * Server Action gọi được bằng POST trực tiếp, nên kiểm tra phiên lại ở đây chứ
 * không tin vào guard của layout đã render ra form.
 */
export async function updateOrder(formData: FormData): Promise<UpdateOrderResult> {
  if (!(await readSession())) return { ok: false, error: "Phiên đăng nhập đã hết hạn." };

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as OrderStatus;
  const paymentStatus = String(formData.get("payment_status") || "") as PaymentStatus;

  if (!id) return { ok: false, error: "Thiếu mã đơn hàng." };
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: "Trạng thái đơn không hợp lệ." };
  }
  if (!(PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) {
    return { ok: false, error: "Trạng thái thanh toán không hợp lệ." };
  }

  const supabase = await getServiceClient();
  if (!supabase) return { ok: false, error: "Chưa kết nối Supabase — không thể cập nhật." };

  const { error } = await supabase
    .from("orders")
    .update({ status, payment_status: paymentStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[admin] updateOrder:", error);
    return { ok: false, error: "Cập nhật thất bại. Thử lại sau." };
  }

  refresh();
  return { ok: true };
}
