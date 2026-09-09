"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { withLocale, type Locale } from "@/lib/i18n/config";
import { formatPrice } from "@/lib/format";

export function CartView({
  locale,
  names,
}: {
  locale: Locale;
  /** slug -> tên sản phẩm theo ngôn ngữ hiện tại (ghi đè snapshot trong giỏ). */
  names: Record<string, string>;
}) {
  const { items, setQuantity, removeItem, subtotal } = useCart();
  const total = subtotal();
  const vi = locale === "vi";

  return (
    <div className="container-page section-y">
      <div className="mx-auto max-w-3xl">
      <h1 className="display-lg text-[var(--ink)]">{vi ? "Giỏ hàng" : "Cart"}</h1>

      {items.length === 0 ? (
        <div className="card mt-10 p-8 text-center">
          <p className="text-[var(--muted)]">
            {vi ? "Giỏ hàng đang trống." : "Your cart is empty."}
          </p>
          <Link
            href={withLocale(locale, "/products")}
            className="mt-4 inline-block text-sm font-medium text-[var(--brand)] hover:underline"
          >
            {vi ? "Tiếp tục mua hàng →" : "Continue shopping →"}
          </Link>
        </div>
      ) : (
        <>
          <ul className="card mt-8 divide-y divide-[var(--line)]">
            {items.map((item) => (
              <li
                key={item.productId}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Link
                    href={withLocale(locale, `/products/${item.slug}`)}
                    className="font-medium text-[var(--ink)] hover:text-[var(--brand)]"
                  >
                    {names[item.slug] ?? item.name}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      setQuantity(item.productId, Number(e.target.value) || 1)
                    }
                    className="w-16 rounded-[var(--radius-control)] border border-[var(--line)] px-2 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-sm text-red-700 hover:underline"
                  >
                    {vi ? "Xóa" : "Remove"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-lg font-semibold">
              {vi ? "Tạm tính" : "Subtotal"}: {formatPrice(total)}
            </p>
            <Link
              href={withLocale(locale, "/checkout")}
              className="rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white shadow-[var(--shadow-soft)] transition hover:bg-[var(--brand-2)]"
            >
              {vi ? "Thanh toán" : "Checkout"}
            </Link>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
