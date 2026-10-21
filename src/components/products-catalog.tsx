"use client";

import { useMemo, useState } from "react";
import { Reveal } from "@/components/reveal";
import { ProductCard } from "@/components/product-card";
import type { Category, Product } from "@/lib/data/local";
import { withLocale, type Locale } from "@/lib/i18n/config";

export function ProductsCatalog({
  lang,
  products,
  categories,
  organicLabel,
  allLabel,
  emptyLabel,
}: {
  lang: Locale;
  products: Product[];
  categories: Category[];
  organicLabel: string;
  allLabel: string;
  emptyLabel: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(
    () => (active ? products.filter((p) => p.category_slugs?.includes(active)) : products),
    [products, active],
  );

  return (
    <div>
      <div className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActive(null)}
          aria-pressed={active === null}
          className={`body-sm rounded-[var(--radius-control)] border px-4 py-2 transition ${
            active === null
              ? "border-[var(--brand)] bg-[var(--brand)] text-white"
              : "border-[var(--line)] text-[var(--ink)] hover:border-[var(--brand)]"
          }`}
        >
          {allLabel}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.slug)}
            aria-pressed={active === c.slug}
            className={`body-sm rounded-[var(--radius-control)] border px-4 py-2 transition ${
              active === c.slug
                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                : "border-[var(--line)] text-[var(--ink)] hover:border-[var(--brand)]"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <Reveal className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            href={withLocale(lang, `/products/${p.slug}`)}
            organicLabel={organicLabel}
          />
        ))}
      </Reveal>
      {filtered.length === 0 && (
        <p className="body-base mt-10 text-[var(--muted)]">{emptyLabel}</p>
      )}
    </div>
  );
}
