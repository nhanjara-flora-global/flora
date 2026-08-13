import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { locales, resolveLocale, withLocale } from "@/lib/i18n/config";
import { formatPrice } from "@/lib/format";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return locales.flatMap((lang) => products.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.short_description ?? undefined,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { lang: raw, slug } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:px-6">
      <div className="relative aspect-square overflow-hidden border border-[var(--line)] bg-[var(--bg-soft)]">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            priority
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(145deg,#dce8d4_0%,#b7c9a5_45%,#6f8f5a_100%)]" />
        )}
      </div>
      <div>
        <Link
          href={withLocale(lang, "/products")}
          className="text-sm text-[var(--muted)] hover:text-[var(--brand)]"
        >
          {dict.common.backProducts}
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-tight text-[var(--ink)]">
          {product.name}
        </h1>
        <p className="mt-4 text-2xl font-semibold text-[var(--brand)]">
          {formatPrice(product.price, product.currency, dict.common.priceOnRequest)}
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {product.stock_status === "instock"
            ? dict.common.inStock
            : dict.common.outOfStock}
        </p>
        <p className="mt-6 leading-relaxed text-[var(--ink)]/85">{product.description}</p>
        <div className="mt-8">
          <AddToCartButton
            product={product}
            contactHref={withLocale(lang, "/contact")}
            requestQuoteLabel={dict.common.requestQuote}
            addToCartLabel={dict.common.addToCart}
            addedToCartLabel={dict.common.addedToCart}
          />
        </div>
      </div>
    </div>
  );
}
