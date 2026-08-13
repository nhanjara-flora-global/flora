"use client";

import { useState } from "react";
import type { Product } from "@/lib/data/local";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export function AddToCartButton({
  product,
  contactHref = "/contact",
  requestQuoteLabel = "Liên hệ báo giá",
  addToCartLabel = "Thêm vào giỏ",
  addedToCartLabel = "Đã thêm vào giỏ",
}: {
  product: Product;
  contactHref?: string;
  requestQuoteLabel?: string;
  addToCartLabel?: string;
  addedToCartLabel?: string;
}) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  if (product.price == null) {
    return (
      <a
        href={contactHref}
        className="inline-flex items-center justify-center rounded-sm bg-[var(--brand)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--brand-2)]"
      >
        {requestQuoteLabel}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        addItem({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          imageUrl: product.image_url,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
      }}
      className="inline-flex items-center justify-center rounded-sm bg-[var(--brand)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--brand-2)]"
    >
      {added
        ? addedToCartLabel
        : `${addToCartLabel} · ${formatPrice(product.price, product.currency)}`}
    </button>
  );
}
