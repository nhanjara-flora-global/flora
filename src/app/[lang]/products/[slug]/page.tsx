import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localizeProduct } from "@/lib/i18n/localized-catalog";
import { locales, resolveLocale, withLocale } from "@/lib/i18n/config";
import { formatPrice } from "@/lib/format";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return locales.flatMap((lang) => products.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang = resolveLocale(raw);
  const base = await getProductBySlug(slug);
  if (!base) return { title: "Not found" };
  const product = localizeProduct(base, lang);
  return {
    title: product.name,
    description: product.short_description ?? undefined,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { lang: raw, slug } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const base = await getProductBySlug(slug);
  if (!base) notFound();
  const product = localizeProduct(base, lang);

  return (
    <Reveal className="container-page section-y grid gap-10 md:grid-cols-2">
      <div className="card relative aspect-square bg-[var(--bg-soft)]">
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
          className="body-sm text-[var(--muted)] hover:text-[var(--brand)]"
        >
          {dict.common.backProducts}
        </Link>
        <h1 className="display-lg mt-4 text-[var(--ink)]">{product.name}</h1>
        <p className="display-md mt-4 text-[var(--brand)]">
          {formatPrice(product.price, product.currency, dict.common.priceOnRequest)}
        </p>
        <p className="body-sm mt-2 text-[var(--muted)]">
          {product.stock_status === "instock"
            ? dict.common.inStock
            : dict.common.outOfStock}
        </p>
        {(product.description || product.short_description) && (
          <p className="body-base mt-6 whitespace-pre-line text-[var(--ink)]/85">
            {product.description || product.short_description}
          </p>
        )}
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
    </Reveal>
  );
}
