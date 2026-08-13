import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/data/local";
import { formatPrice } from "@/lib/format";

export function ProductCard({
  product,
  href,
  organicLabel = "Organic",
  priceOnRequestLabel,
}: {
  product: Product;
  href?: string;
  organicLabel?: string;
  priceOnRequestLabel?: string;
}) {
  return (
    <Link
      href={href ?? `/products/${product.slug}`}
      className="group flex flex-col overflow-hidden border border-[var(--line)] bg-white transition hover:border-[var(--brand)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-soft)]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width:768px) 100vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(145deg,#dce8d4_0%,#b7c9a5_45%,#6f8f5a_100%)]" />
        )}
        <div className="absolute inset-0 flex items-end p-4">
          <span className="bg-white/90 px-2 py-1 text-[11px] uppercase tracking-wider text-[var(--brand)]">
            {organicLabel}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-[family-name:var(--font-display)] text-lg leading-snug text-[var(--ink)] group-hover:text-[var(--brand)]">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm text-[var(--muted)]">{product.short_description}</p>
        <p className="mt-auto pt-2 text-base font-semibold text-[var(--brand)]">
          {formatPrice(product.price, product.currency, priceOnRequestLabel)}
        </p>
      </div>
    </Link>
  );
}
