"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { defaultLocale, isLocale, withLocale, type Locale } from "@/lib/i18n/config";
import { formatPrice } from "@/lib/format";
import { createOrder } from "@/app/actions/orders";

function useLocale(): Locale {
  const pathname = usePathname() || "/";
  const seg = pathname.split("/")[1];
  return isLocale(seg) ? seg : defaultLocale;
}

export default function CheckoutPage() {
  const locale = useLocale();
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const total = subtotal();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const vi = locale === "vi";
  const payload = useMemo(
    () =>
      items.map((i) => ({
        productId: i.productId,
        name: i.name,
        slug: i.slug,
        price: i.price,
        quantity: i.quantity,
      })),
    [items],
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-[var(--muted)]">
          {vi ? "Giỏ hàng đang trống." : "Your cart is empty."}
        </p>
        <Link
          href={withLocale(locale, "/products")}
          className="mt-4 inline-block text-[var(--brand)]"
        >
          {vi ? "Quay lại mua hàng" : "Back to shopping"}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_0.8fr] md:px-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl">
          {vi ? "Thanh toán" : "Checkout"}
        </h1>
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const res = await createOrder({
                customerName: String(fd.get("name") || ""),
                customerEmail: String(fd.get("email") || ""),
                customerPhone: String(fd.get("phone") || ""),
                note: String(fd.get("note") || ""),
                paymentMethod: String(fd.get("payment") || "cod"),
                address: {
                  province: String(fd.get("province") || ""),
                  district: String(fd.get("district") || ""),
                  ward: String(fd.get("ward") || ""),
                  line1: String(fd.get("address") || ""),
                },
                items: payload,
              });
              if (!res.ok) {
                setError(res.error);
                return;
              }
              clear();
              router.push(
                `${withLocale(locale, "/order-success")}?order=${res.orderNumber}`,
              );
            });
          }}
        >
          <Field name="name" label={vi ? "Họ tên *" : "Full name *"} required />
          <Field name="phone" label={vi ? "Điện thoại *" : "Phone *"} required />
          <Field name="email" label="Email *" type="email" required />
          <Field name="address" label={vi ? "Địa chỉ *" : "Address *"} required />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field name="province" label={vi ? "Tỉnh/TP *" : "Province *"} required />
            <Field name="district" label={vi ? "Quận/Huyện *" : "District *"} required />
            <Field name="ward" label={vi ? "Phường/Xã *" : "Ward *"} required />
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block text-[var(--muted)]">{vi ? "Ghi chú" : "Note"}</span>
            <textarea
              name="note"
              rows={3}
              className="w-full border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>
          <fieldset className="space-y-2">
            <legend className="text-sm text-[var(--muted)]">{vi ? "Thanh toán" : "Payment"}</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="payment" value="cod" defaultChecked />
              {vi ? "COD — Thanh toán khi nhận hàng" : "COD — Cash on delivery"}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="payment" value="bank_transfer" />
              {vi ? "Chuyển khoản ngân hàng" : "Bank transfer"}
            </label>
          </fieldset>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="bg-[var(--brand)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--brand-2)] disabled:opacity-60"
          >
            {pending
              ? vi
                ? "Đang đặt hàng..."
                : "Placing order..."
              : vi
                ? "Đặt hàng"
                : "Place order"}
          </button>
        </form>
      </div>
      <aside className="h-fit border border-[var(--line)] bg-white p-5">
        <h2 className="font-semibold">{vi ? "Đơn hàng" : "Order"}</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3">
              <span>
                {i.name} × {i.quantity}
              </span>
              <span>{formatPrice((i.price ?? 0) * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-t border-[var(--line)] pt-4 text-lg font-semibold">
          {vi ? "Tổng" : "Total"}: {formatPrice(total)}
        </p>
      </aside>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-[var(--muted)]">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-sm border border-[var(--line)] bg-white px-3 py-2"
      />
    </label>
  );
}
