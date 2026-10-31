"use client";

import { useMemo, useState } from "react";
import { ProductTile } from "@/components/news/cards";
import type { Category, Product } from "@/lib/data/local";
import { withLocale, type Locale } from "@/lib/i18n/config";
import { PRODUCT_FALLBACK_IMAGE } from "@/lib/media";

export function ProductsCatalog({
  lang,
  products,
  categories,
  organicLabel,
  allLabel,
  emptyLabel,
  quoteLabel,
  photoLabel,
}: {
  lang: Locale;
  products: Product[];
  categories: Category[];
  organicLabel: string;
  allLabel: string;
  emptyLabel: string;
  quoteLabel: string;
  /** "Ảnh: {credit}" — ghi nguồn ảnh lấy từ mạng cho sản phẩm chưa có ảnh. */
  photoLabel: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(
    () => (active ? products.filter((p) => p.category_slugs?.includes(active)) : products),
    [products, active],
  );

  const tab = (on: boolean) =>
    `block whitespace-nowrap border-b-[3px] pb-2 pt-2.5 text-[13px] ${
      on ? "border-ink font-bold" : "border-transparent hover:border-[#c8c8c8]"
    }`;

  return (
    <div>
      <div className="-mx-4 overflow-x-auto border-b border-rule px-4">
        <div className="flex w-max gap-[22px]">
          <button type="button" onClick={() => setActive(null)} aria-pressed={active === null} className={tab(active === null)}>
            {allLabel}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.slug)}
              aria-pressed={active === c.slug}
              className={tab(active === c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((p) => {
          const fallback = PRODUCT_FALLBACK_IMAGE[p.slug];
          return (
            <li key={p.id}>
              <ProductTile
                href={withLocale(lang, `/products/${p.slug}`)}
                name={p.name}
                label={organicLabel}
                image={p.image_url ?? fallback?.src ?? null}
                imageTitle={!p.image_url && fallback ? photoLabel.replace("{credit}", fallback.credit) : undefined}
                note={quoteLabel}
              />
            </li>
          );
        })}
      </ul>
      {filtered.length === 0 && <p className="mt-10 text-muted">{emptyLabel}</p>}
    </div>
  );
}
