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
      className="card card-interactive group flex flex-col"
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
          <span className="eyebrow rounded-[var(--radius-control)] bg-white/90 px-2.5 py-1.5 text-[var(--brand)] shadow-sm">
            {organicLabel}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="display-sm text-[var(--ink)] transition-colors group-hover:text-[var(--brand)]">
          {product.name}
        </h3>
        <p className="body-sm line-clamp-2 text-[var(--muted)]">{product.short_description}</p>
        <p className="mt-auto pt-2 font-semibold text-[var(--brand)]">
          {formatPrice(product.price, product.currency, priceOnRequestLabel)}
        </p>
      </div>
    </Link>
  );
}
