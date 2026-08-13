import type { Metadata } from "next";
import { adminLogin } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Admin</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Đăng nhập quản trị Flora Global</p>
      {error === "1" && (
        <p className="mt-4 text-sm text-red-700">Mật khẩu không đúng.</p>
      )}
      <form action={adminLogin} className="mt-6 space-y-4">
        <input
          type="password"
          name="password"
          required
          placeholder="Mật khẩu admin"
          className="w-full rounded-sm border border-[var(--line)] bg-white px-3 py-2"
        />
        <button
          type="submit"
          className="w-full rounded-sm bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
