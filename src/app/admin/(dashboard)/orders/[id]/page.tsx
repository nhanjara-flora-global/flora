import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import {
  Badge,
  Cell,
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_TONE,
  Panel,
  Row,
  Table,
} from "@/components/admin/ui";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABEL,
  getOrder,
} from "@/lib/admin/data";
import { formatDateTime, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Chi tiết đơn" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow text-[var(--muted)]">{label}</p>
      <p className="body-sm mt-0.5 text-[var(--ink)]">{children}</p>
    </div>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrder(id);
  if (!result) notFound();

  const { order, items } = result;
  const address = order.shipping_address ?? {};
  const addressLine = [address.line1, address.ward, address.district, address.province]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Link
        href="/admin/orders"
        className="body-sm text-[var(--muted)] transition hover:text-[var(--brand)]"
      >
        ← Danh sách đơn hàng
      </Link>

      <header className="mt-3 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display-lg text-[var(--ink)]">{order.order_number}</h1>
          <p className="body-sm mt-1 text-[var(--muted)]">
            Đặt lúc {formatDateTime(order.created_at)} ·{" "}
            {PAYMENT_METHOD_LABEL[order.payment_method] ?? order.payment_method}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge label={ORDER_STATUS_LABEL[order.status]} tone={ORDER_STATUS_TONE[order.status]} />
          <Badge
            label={PAYMENT_STATUS_LABEL[order.payment_status]}
            tone={PAYMENT_STATUS_TONE[order.payment_status]}
          />
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Panel title="Sản phẩm" bleed>
            <Table head={["Sản phẩm", "Đơn giá", "SL", "Thành tiền"]}>
              {items.map((item) => (
                <Row key={item.id}>
                  <Cell>
                    {item.product_slug ? (
                      <Link
                        href={`/vi/products/${item.product_slug}`}
                        target="_blank"
                        className="hover:text-[var(--brand)]"
                      >
                        {item.product_name}
                      </Link>
                    ) : (
                      item.product_name
                    )}
                  </Cell>
                  <Cell muted>{formatPrice(item.unit_price)}</Cell>
                  <Cell>{item.quantity}</Cell>
                  <Cell>{formatPrice(item.line_total)}</Cell>
                </Row>
              ))}
            </Table>
            <dl className="space-y-2 border-t border-[var(--line)] px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Tạm tính</dt>
                <dd>{formatPrice(Number(order.subtotal))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Phí vận chuyển</dt>
                <dd>{formatPrice(Number(order.shipping_fee))}</dd>
              </div>
              <div className="flex justify-between border-t border-[var(--line)] pt-2 text-base font-semibold">
                <dt>Tổng cộng</dt>
                <dd className="text-[var(--brand)]">{formatPrice(Number(order.total))}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Khách hàng">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Họ tên">{order.customer_name}</Field>
              <Field label="Điện thoại">
                <a href={`tel:${order.customer_phone}`} className="hover:text-[var(--brand)]">
                  {order.customer_phone}
                </a>
              </Field>
              <Field label="Email">
                <a href={`mailto:${order.customer_email}`} className="hover:text-[var(--brand)]">
                  {order.customer_email}
                </a>
              </Field>
              <Field label="Địa chỉ giao">{addressLine || "—"}</Field>
            </div>
            {order.note && (
              <div className="mt-4 rounded-md bg-[var(--bg-soft)] p-3">
                <p className="eyebrow text-[var(--muted)]">Ghi chú của khách</p>
                <p className="body-sm mt-1">{order.note}</p>
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Cập nhật trạng thái">
          <OrderStatusForm
            orderId={order.id}
            status={order.status}
            paymentStatus={order.payment_status}
            statusOptions={ORDER_STATUSES.map((value) => ({
              value,
              label: ORDER_STATUS_LABEL[value],
            }))}
            paymentOptions={PAYMENT_STATUSES.map((value) => ({
              value,
              label: PAYMENT_STATUS_LABEL[value],
            }))}
          />
        </Panel>
      </div>
    </>
  );
}
