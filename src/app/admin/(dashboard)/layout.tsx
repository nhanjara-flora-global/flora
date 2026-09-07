import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { adminLogout, isAdminAuthed } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-[var(--bg-soft)] text-[var(--ink)]">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-[var(--line)] bg-white md:flex">
        <div className="border-b border-[var(--line)] px-5 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Flora Global
          </p>
          <p className="font-[family-name:var(--font-display)] text-lg">Admin</p>
        </div>
        <div className="flex-1 p-3">
          <AdminNav orientation="sidebar" />
        </div>
        <div className="border-t border-[var(--line)] p-3">
          <Link
            href="/vi"
            target="_blank"
            className="block rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--brand)]"
          >
            Xem website ↗
          </Link>
          <form action={adminLogout}>
            <button
              type="submit"
              className="w-full rounded-md px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
            >
              Đăng xuất
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-[var(--line)] bg-white px-5 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-display)] text-lg">Admin</span>
            <form action={adminLogout}>
              <button type="submit" className="text-sm text-red-700">
                Thoát
              </button>
            </form>
          </div>
          <div className="mt-2">
            <AdminNav orientation="bar" />
          </div>
        </header>
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
