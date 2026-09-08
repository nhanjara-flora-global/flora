import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  Cell,
  EmptyState,
  FilterTabs,
  Notice,
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_TONE,
  PageHeader,
  Pagination,
  Panel,
  Row,
  SearchForm,
  Table,
} from "@/components/admin/ui";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  isLocalMode,
  listOrders,
  parsePage,
} from "@/lib/admin/data";
import { formatDateTime, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Đơn hàng" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status, q, page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const { rows, total, pageCount } = await listOrders({ status, q, page });
  const params = { status, q };

  return (
    <>
      <PageHeader
        eyebrow="Bán hàng"
        title="Đơn hàng"
        description="Theo dõi và cập nhật trạng thái đơn đặt từ website."
      />

      {isLocalMode() && (
        <Notice tone="warn" title="Chế độ local — chưa lưu đơn hàng">
          Đơn đặt trên website hiện chỉ ghi log. Bật <code>DATA_SOURCE=supabase</code> để quản lý
          đơn tại đây.
        </Notice>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          basePath="/admin/orders"
          active={status}
          params={{ q }}
          options={[
            { label: "Tất cả" },
            ...ORDER_STATUSES.map((value) => ({ value, label: ORDER_STATUS_LABEL[value] })),
          ]}
        />
        <SearchForm
          action="/admin/orders"
          placeholder="Mã đơn, tên, email, SĐT…"
          defaultValue={q}
          hidden={{ status }}
        />
      </div>

      <Panel bleed>
        {rows.length === 0 ? (
          <EmptyState
            title="Không có đơn nào"
            description={
              q || status
                ? "Thử bỏ bớt bộ lọc hoặc từ khoá tìm kiếm."
                : "Đơn mới sẽ xuất hiện ở đây ngay khi khách đặt hàng."
            }
          />
        ) : (
          <>
            <Table
              head={["Mã đơn", "Khách hàng", "Tổng", "Thanh toán", "Trạng thái", "Ngày đặt", ""]}
            >
              {rows.map((order) => (
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
                      {order.customer_phone} · {order.customer_email}
                    </span>
                  </Cell>
                  <Cell>{formatPrice(Number(order.total))}</Cell>
                  <Cell>
                    <Badge
                      label={PAYMENT_STATUS_LABEL[order.payment_status]}
                      tone={PAYMENT_STATUS_TONE[order.payment_status]}
                    />
                  </Cell>
                  <Cell>
                    <Badge
                      label={ORDER_STATUS_LABEL[order.status]}
                      tone={ORDER_STATUS_TONE[order.status]}
                    />
                  </Cell>
                  <Cell muted>{formatDateTime(order.created_at)}</Cell>
                  <Cell align="right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm text-[var(--muted)] transition hover:text-[var(--brand)]"
                    >
                      Chi tiết →
                    </Link>
                  </Cell>
                </Row>
              ))}
            </Table>
            <Pagination
              basePath="/admin/orders"
              page={page}
              pageCount={pageCount}
              total={total}
              params={params}
            />
          </>
        )}
      </Panel>
    </>
  );
}
