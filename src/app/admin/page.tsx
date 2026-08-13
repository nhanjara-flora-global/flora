import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminLogout, isAdminAuthed } from "@/app/actions/admin";
import { getProducts } from "@/lib/catalog";
import { getPosts } from "@/lib/legacy";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

async function getOrders() {
  if ((process.env.DATA_SOURCE ?? "local") === "local") return [];
  const { createServiceClient } = await import("@/lib/supabase/service");
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, total, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

async function getContacts() {
  if ((process.env.DATA_SOURCE ?? "local") === "local") return [];
  const { createServiceClient } = await import("@/lib/supabase/service");
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("contact_submissions")
    .select("id, name, email, phone, message, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

export default async function AdminPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const [products, orders, contacts] = await Promise.all([
    getProducts(),
    getOrders(),
    getContacts(),
  ]);
  const posts = getPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Dashboard</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Admin</h1>
        </div>
        <form action={adminLogout}>
          <button type="submit" className="text-sm text-red-700 hover:underline">
            Đăng xuất
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Sản phẩm" value={products.length} />
        <Stat label="Bài viết" value={posts.length} />
        <Stat label="Đơn hàng" value={orders.length} />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Sản phẩm</h2>
        <div className="mt-3 overflow-x-auto border border-[var(--line)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--bg)]">
              <tr>
                <th className="px-3 py-2">Tên</th>
                <th className="px-3 py-2">Giá</th>
                <th className="px-3 py-2">Kho</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-[var(--line)]">
                  <td className="px-3 py-2">
                    <Link href={`/products/${p.slug}`} className="hover:text-[var(--brand)]">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{formatPrice(p.price)}</td>
                  <td className="px-3 py-2">{p.stock_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Đơn hàng gần đây</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Chưa có đơn (local mode chỉ log console — bật Supabase để lưu đơn).
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto border border-[var(--line)] bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--bg)]">
                <tr>
                  <th className="px-3 py-2">Mã</th>
                  <th className="px-3 py-2">Khách</th>
                  <th className="px-3 py-2">Tổng</th>
                  <th className="px-3 py-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-[var(--line)]">
                    <td className="px-3 py-2">{o.order_number}</td>
                    <td className="px-3 py-2">{o.customer_name}</td>
                    <td className="px-3 py-2">{formatPrice(Number(o.total))}</td>
                    <td className="px-3 py-2">{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Liên hệ</h2>
        {contacts.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">Chưa có submission.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {contacts.map((c) => (
              <li key={c.id} className="border border-[var(--line)] bg-white p-4 text-sm">
                <p className="font-medium">
                  {c.name} · {c.email}
                </p>
                <p className="text-[var(--muted)]">{c.phone}</p>
                <p className="mt-2">{c.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[var(--line)] bg-white p-4">
      <p className="text-xs uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--brand)]">{value}</p>
    </div>
  );
}
