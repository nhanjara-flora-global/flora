import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminLogin, isAdminAuthed } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  "1": "Tên đăng nhập hoặc mật khẩu không đúng.",
  rate: "Sai quá nhiều lần. Vui lòng thử lại sau ít phút.",
  config: "Chưa cấu hình ADMIN_PASSWORD trên máy chủ.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdminAuthed()) redirect("/admin");
  const { error } = await searchParams;
  const message = error ? ERRORS[error] : undefined;

  const field =
    "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-soft)] px-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--line)] bg-white p-8 shadow-[var(--shadow-soft)]">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Flora Global
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl">
          Đăng nhập quản trị
        </h1>

        {message && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {message}
          </p>
        )}

        <form action={adminLogin} className="mt-6 space-y-3">
          <input
            type="text"
            name="username"
            required
            autoFocus
            autoComplete="username"
            placeholder="Tên đăng nhập"
            aria-label="Tên đăng nhập"
            className={field}
          />
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="Mật khẩu"
            aria-label="Mật khẩu"
            className={field}
          />
          <button
            type="submit"
            className="w-full rounded-md bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-2)]"
          >
            Đăng nhập
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          Phiên đăng nhập tự hết hạn sau 7 ngày.
        </p>
      </div>
    </div>
  );
}
