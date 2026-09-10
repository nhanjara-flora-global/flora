import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localizeProduct } from "@/lib/i18n/localized-catalog";
import { locales, resolveLocale, withLocale } from "@/lib/i18n/config";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME, abs, breadcrumbLd, pageSeo } from "@/lib/seo";

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
  return pageSeo({
    lang,
    path: `/products/${slug}`,
    title: product.name,
    description:
      product.short_description || product.description?.slice(0, 200) || undefined,
    image: product.image_url,
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const { lang: raw, slug } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const base = await getProductBySlug(slug);
  if (!base) notFound();
  const product = localizeProduct(base, lang);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description || product.description || product.name,
    ...(product.image_url ? { image: abs(product.image_url) } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    brand: { "@type": "Brand", name: SITE_NAME },
    url: abs(withLocale(lang, `/products/${slug}`)),
  };
  const crumbs = breadcrumbLd([
    { name: SITE_NAME, path: withLocale(lang, "/") },
    { name: dict.productsPage.title, path: withLocale(lang, "/products") },
    { name: product.name, path: withLocale(lang, `/products/${slug}`) },
  ]);

  return (
    <>
      <JsonLd data={[productLd, crumbs]} />
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
      <div className="min-w-0">
        <Link
          href={withLocale(lang, "/products")}
          className="body-sm text-[var(--muted)] hover:text-[var(--brand)]"
        >
          {dict.common.backProducts}
        </Link>
        <h1 className="display-lg mt-4 break-words text-[var(--ink)]">
          {product.name}
        </h1>
        <p className="eyebrow mt-4 text-[var(--brand)]">
          {dict.common.wholesaleOnly}
        </p>
        {(product.description || product.short_description) && (
          <p className="body-base mt-6 whitespace-pre-line break-words text-[var(--ink)]/85">
            {product.description || product.short_description}
          </p>
        )}
        <div className="card mt-8 border-[var(--brand)]/25 bg-[var(--brand)]/5 p-5">
          <p className="display-sm text-[var(--brand)]">
            {dict.common.wholesaleTitle}
          </p>
          <Link
            href={`${withLocale(lang, "/contact")}?product=${encodeURIComponent(product.name)}#contact-form`}
            className="mt-5 inline-flex items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-[var(--shadow-soft)] transition hover:bg-[var(--brand-2)]"
          >
            {dict.common.wholesaleCta}
          </Link>
        </div>
      </div>
      </Reveal>
    </>
  );
}
