"use client";

import { useActionState } from "react";
import { updateOrder, type UpdateOrderResult } from "@/app/actions/admin";

type Option = { value: string; label: string };

export function OrderStatusForm({
  orderId,
  status,
  paymentStatus,
  statusOptions,
  paymentOptions,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
  statusOptions: Option[];
  paymentOptions: Option[];
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: UpdateOrderResult | null, formData: FormData) => updateOrder(formData),
    null,
  );

  const field =
    "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={orderId} />

      <label className="block">
        <span className="eyebrow text-[var(--muted)]">Trạng thái đơn</span>
        <select name="status" defaultValue={status} className={`${field} mt-1.5`}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="eyebrow text-[var(--muted)]">Thanh toán</span>
        <select name="payment_status" defaultValue={paymentStatus} className={`${field} mt-1.5`}>
          {paymentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--brand-2)] disabled:opacity-60"
      >
        {pending ? "Đang lưu…" : "Lưu thay đổi"}
      </button>

      {state && (
        <p
          role="status"
          className={`body-sm ${state.ok ? "text-emerald-700" : "text-rose-700"}`}
        >
          {state.ok ? "Đã cập nhật đơn hàng." : state.error}
        </p>
      )}
    </form>
  );
}
