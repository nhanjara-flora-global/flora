import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  Cell,
  EmptyState,
  Notice,
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_TONE,
  PageHeader,
  Panel,
  Row,
  StatCard,
  Table,
} from "@/components/admin/ui";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  getDashboardData,
  isLocalMode,
} from "@/lib/admin/data";
import { formatDateTime, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Tổng quan" };

export default async function AdminDashboardPage() {
  const data = await getDashboardData();
  const local = isLocalMode();
  const { orders, contacts, products, posts } = data;
  const maxStatus = Math.max(1, ...orders.byStatus.map((s) => s.count));

  return (
    <>
      <PageHeader
        eyebrow="Tổng quan"
        title="Bảng điều khiển"
        description="Số liệu bán hàng, nội dung và liên hệ của Flora Global."
        action={
          <div className="flex flex-wrap gap-2">
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
        }
      />

      {local && (
        <Notice tone="warn" title="Đang chạy ở chế độ local (DATA_SOURCE=local)">
          Đơn hàng, liên hệ và chức năng đăng bài cần Supabase. Đặt{" "}
          <code>DATA_SOURCE=supabase</code> cùng <code>SUPABASE_SERVICE_ROLE_KEY</code> để xem dữ
          liệu thật.
        </Notice>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Doanh thu 30 ngày"
          value={formatPrice(orders.revenue30d)}
          hint={`Tổng tích luỹ ${formatPrice(orders.revenue)}`}
        />
        <StatCard
          label="Đơn 30 ngày"
          value={orders.count30d}
          hint={`${orders.total} đơn trong hệ thống`}
          href="/admin/orders"
        />
        <StatCard
          label="Chờ xác nhận"
          value={orders.pending}
          hint="Đơn cần xử lý sớm"
          href="/admin/orders?status=pending"
        />
        <StatCard
          label="Bài viết"
          value={posts.total}
          hint={`${posts.fullyTranslated} bài đã dịch đủ ngôn ngữ`}
          href="/admin/posts"
        />
        <StatCard
          label="Sản phẩm"
          value={products.total}
          hint={`${products.published} đang bán · ${products.outOfStock} hết hàng`}
          href="/admin/products"
        />
        <StatCard
          label="Liên hệ"
          value={contacts.total}
          hint="Form gửi từ website"
          href="/admin/contacts"
        />
      </div>

      {orders.byStatus.length > 0 && (
        <div className="mt-6">
          <Panel title="Đơn theo trạng thái">
            <ul className="space-y-3">
              {orders.byStatus.map(({ status, count }) => (
                <li key={status} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm text-[var(--muted)]">
                    {ORDER_STATUS_LABEL[status]}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-soft)]">
                    <span
                      className="block h-full rounded-full bg-[var(--brand)]"
                      style={{ width: `${Math.round((count / maxStatus) * 100)}%` }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right text-sm font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Đơn hàng gần đây"
          bleed
          action={
            <Link href="/admin/orders" className="text-sm font-medium text-[var(--brand)]">
              Tất cả →
            </Link>
          }
        >
          {orders.recent.length === 0 ? (
            <EmptyState
              title="Chưa có đơn hàng"
              description={
                local
                  ? "Bật Supabase để đơn đặt trên website được lưu lại."
                  : "Đơn mới sẽ xuất hiện ở đây ngay khi khách đặt hàng."
              }
            />
          ) : (
            <Table head={["Mã đơn", "Khách hàng", "Tổng", "Trạng thái", "Ngày"]}>
              {orders.recent.map((order) => (
                <Row key={order.id}>
                  <Cell>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-[var(--brand)] hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </Cell>
                  <Cell>
                    <span className="block">{order.customer_name}</span>
                    <span className="block text-xs text-[var(--muted)]">
                      {order.customer_phone}
                    </span>
                  </Cell>
                  <Cell>{formatPrice(Number(order.total))}</Cell>
                  <Cell>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge
                        label={ORDER_STATUS_LABEL[order.status]}
                        tone={ORDER_STATUS_TONE[order.status]}
                      />
                      <Badge
                        label={PAYMENT_STATUS_LABEL[order.payment_status]}
                        tone={PAYMENT_STATUS_TONE[order.payment_status]}
                      />
                    </div>
                  </Cell>
                  <Cell muted>{formatDateTime(order.created_at)}</Cell>
                </Row>
              ))}
            </Table>
          )}
        </Panel>

        <Panel
          title="Liên hệ mới"
          action={
            <Link href="/admin/contacts" className="text-sm font-medium text-[var(--brand)]">
              Tất cả →
            </Link>
          }
        >
          {contacts.recent.length === 0 ? (
            <p className="body-sm text-[var(--muted)]">Chưa có liên hệ nào.</p>
          ) : (
            <ul className="space-y-4">
              {contacts.recent.map((contact) => (
                <li
                  key={contact.id}
                  className="border-b border-[var(--line)] pb-4 last:border-0 last:pb-0"
                >
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {contact.email}
                    {contact.phone ? ` · ${contact.phone}` : ""}
                  </p>
                  <p className="body-sm mt-1 line-clamp-2 text-[var(--ink)]">{contact.message}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {formatDateTime(contact.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
