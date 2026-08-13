"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";

export function CartBadge({
  label = "Cart",
  href = "/cart",
}: {
  label?: string;
  href?: string;
}) {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  return (
    <Link
      href={href}
      className="relative border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)] transition hover:border-[var(--brand)]"
    >
      {label}
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[11px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
