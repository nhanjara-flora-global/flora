import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminLogout, isAdminAuthed } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/posts", label: "Bài viết" },
];

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
        <nav className="flex-1 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg-soft)] hover:text-[var(--brand)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={adminLogout} className="border-t border-[var(--line)] p-3">
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
          >
            Đăng xuất
          </button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--line)] bg-white px-5 py-3 md:hidden">
          <span className="font-[family-name:var(--font-display)] text-lg">Admin</span>
          <nav className="flex gap-3 text-sm">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="text-[var(--brand)]">
                {item.label}
              </Link>
            ))}
            <form action={adminLogout}>
              <button type="submit" className="text-red-700">
                Thoát
              </button>
            </form>
          </nav>
        </header>
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
