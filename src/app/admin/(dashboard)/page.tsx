import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { allArticles } from "@/lib/news";
import { formatPrice } from "@/lib/format";

async function fromDb<T>(
  table: string,
  columns: string,
): Promise<T[]> {
  if ((process.env.DATA_SOURCE ?? "local") !== "supabase") return [];
  const { createServiceClient } = await import("@/lib/supabase/service");
  const supabase = createServiceClient();
  const { data } = await supabase
    .from(table)
    .select(columns)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as T[];
}

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
};
type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
};

export default async function AdminDashboard() {
  const [products, articles, orders, contacts] = await Promise.all([
    getProducts(),
    allArticles(),
    fromDb<Order>("orders", "id, order_number, customer_name, total, status, created_at"),
    fromDb<Contact>("contact_submissions", "id, name, email, phone, message, created_at"),
  ]);

  return (
    <>
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
          Tổng quan
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">
          Bảng điều khiển
        </h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Sản phẩm" value={products.length} />
        <Stat label="Bài viết" value={articles.length} href="/admin/posts" />
        <Stat label="Đơn hàng" value={orders.length} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-2)]"
        >
          + Viết bài mới
        </Link>
        <Link
          href="/admin/posts"
          className="rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:border-[var(--brand)]"
        >
          Quản lý bài viết
        </Link>
      </div>

      <Section title="Sản phẩm">
        <Table head={["Tên", "Giá", "Kho"]}>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-[var(--line)]">
              <td className="px-3 py-2">{p.name}</td>
              <td className="px-3 py-2">{formatPrice(p.price)}</td>
              <td className="px-3 py-2">{p.stock_status}</td>
            </tr>
          ))}
        </Table>
      </Section>

      <Section title="Đơn hàng gần đây">
        {orders.length === 0 ? (
          <Empty>Chưa có đơn (bật Supabase để lưu đơn).</Empty>
        ) : (
          <Table head={["Mã", "Khách", "Tổng", "Trạng thái"]}>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-[var(--line)]">
                <td className="px-3 py-2">{o.order_number}</td>
                <td className="px-3 py-2">{o.customer_name}</td>
                <td className="px-3 py-2">{formatPrice(Number(o.total))}</td>
                <td className="px-3 py-2">{o.status}</td>
              </tr>
            ))}
          </Table>
        )}
      </Section>

      <Section title="Liên hệ">
        {contacts.length === 0 ? (
          <Empty>Chưa có liên hệ nào.</Empty>
        ) : (
          <ul className="space-y-3">
            {contacts.map((c) => (
              <li
                key={c.id}
                className="rounded-md border border-[var(--line)] bg-white p-4 text-sm"
              >
                <p className="font-medium">
                  {c.name} · {c.email}
                </p>
                <p className="text-[var(--muted)]">{c.phone}</p>
                <p className="mt-2 whitespace-pre-line">{c.message}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const body = (
    <div className="rounded-md border border-[var(--line)] bg-white p-4">
      <p className="text-xs uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--brand)]">{value}</p>
    </div>
  );
  return href ? (
    <Link href={href} className="block hover:opacity-90">
      {body}
    </Link>
  ) : (
    body
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Table({
  head,
  children,
}: {
  head: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-[var(--line)] bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[var(--line)] bg-[var(--bg-soft)]">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[var(--muted)]">{children}</p>;
}
