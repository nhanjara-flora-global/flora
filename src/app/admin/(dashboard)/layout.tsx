import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { adminLogout, isAdminAuthed } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

function LogoutButton({ className }: { className: string }) {
  return (
    <form action={adminLogout}>
      <button type="submit" className={className}>
        Đăng xuất
      </button>
    </form>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[var(--bg-soft)] lg:flex-row">
      {/* Mobile: brand bar with the nav scrolling underneath it. */}
      <header className="bg-[var(--brand-2)] text-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-[family-name:var(--font-display)] text-lg">
            Flora <span className="opacity-70">Admin</span>
          </Link>
          <LogoutButton className="text-sm text-white/70 transition hover:text-white" />
        </div>
        <AdminNav orientation="bar" />
      </header>

      <aside className="hidden w-60 shrink-0 flex-col bg-[var(--brand-2)] px-4 py-6 text-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        <Link href="/admin" className="px-3">
          <span className="font-[family-name:var(--font-display)] text-xl">Flora Global</span>
          <span className="eyebrow mt-1 block text-white/60">Bảng quản trị</span>
        </Link>

        <div className="mt-8 flex-1">
          <AdminNav orientation="sidebar" />
        </div>

        <div className="space-y-1 border-t border-white/15 pt-4">
          <Link
            href="/vi"
            target="_blank"
            className="block rounded-[var(--radius-control)] px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            Xem website ↗
          </Link>
          <LogoutButton className="w-full rounded-[var(--radius-control)] px-3 py-2 text-left text-sm text-white/75 transition hover:bg-white/10 hover:text-white" />
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}
