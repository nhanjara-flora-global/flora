import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminLogin, isAdminAuthed } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  "1": "Mật khẩu không đúng.",
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

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-[var(--bg-soft)] px-4 py-16">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--line)] bg-white p-8 shadow-[var(--shadow-soft)]">
        <p className="eyebrow text-[var(--muted)]">Flora Global</p>
        <h1 className="display-md mt-1 text-[var(--ink)]">Bảng quản trị</h1>
        <p className="body-sm mt-2 text-[var(--muted)]">
          Nhập mật khẩu quản trị để tiếp tục.
        </p>

        {message && (
          <p
            role="alert"
            className="mt-5 rounded-[var(--radius-control)] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
          >
            {message}
          </p>
        )}

        <form action={adminLogin} className="mt-6 space-y-3">
          <label className="block">
            <span className="sr-only">Mật khẩu admin</span>
            <input
              type="password"
              name="password"
              required
              autoFocus
              autoComplete="current-password"
              placeholder="Mật khẩu admin"
              className="w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-[var(--radius-control)] bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--brand-2)]"
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
