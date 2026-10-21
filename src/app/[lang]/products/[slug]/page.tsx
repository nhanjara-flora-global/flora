import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductTabs, type ProductTab } from "@/components/product-tabs";
import { getCategories, getProductBySlug, getProducts } from "@/lib/catalog";
import type { Product } from "@/lib/data/local";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { localizeProduct, localizeProducts } from "@/lib/i18n/localized-catalog";
import { locales, resolveLocale, withLocale, type Locale } from "@/lib/i18n/config";
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

export default async function ProductPage({ params }: Props) {
  const { lang: raw, slug } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);

  const base = await getProductBySlug(slug);
  if (!base) {
    // Category browsing now lives on /products itself (client-side filter
    // chips), so an old /products/{category} link redirects there instead
    // of 404ing.
    const categories = await getCategories();
    if (categories.some((c) => c.slug === slug)) {
      redirect(withLocale(lang, "/products"));
    }
    notFound();
  }
  return <ProductDetail lang={lang} dict={dict} slug={slug} product={localizeProduct(base, lang)} />;
}

function ProductDetail({
  lang,
  dict,
  slug,
  product,
}: {
  lang: Locale;
  dict: Dictionary;
  slug: string;
  product: Product;
}) {
  const pd = dict.productDetail;
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

  const gallery = product.gallery?.length
    ? product.gallery
    : product.image_url
      ? [product.image_url]
      : [];

  const specs = [
    product.origin && { label: pd.originLabel, value: product.origin },
    product.manufacturer && { label: pd.manufacturerLabel, value: product.manufacturer },
    product.packaging && { label: pd.packagingLabel, value: product.packaging },
    product.licenseNo && { label: pd.licenseLabel, value: product.licenseNo },
    product.storageNote && { label: pd.storageLabel, value: product.storageNote },
  ].filter(Boolean) as { label: string; value: string }[];

  const tabs: ProductTab[] = [
    product.description && {
      key: "description",
      label: pd.descriptionTitle,
      content: (
        <p className="body-base max-w-3xl whitespace-pre-line text-[var(--ink)]/85">
          {product.description}
        </p>
      ),
    },
    (!!product.usageSteps?.length || !!product.usageDosage?.length) && {
      key: "process",
      label: pd.processTitle,
      content: (
        <div className="max-w-2xl space-y-8">
          {!!product.usageDosage?.length && (
            <div>
              <p className="display-sm text-[var(--ink)]">{pd.dosageTitle}</p>
              <dl className="mt-3 divide-y divide-[var(--line)] rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)]">
                {product.usageDosage!.map((d) => (
                  <div key={d.group} className="flex flex-col gap-1 px-5 py-3.5">
                    <dt className="body-sm font-semibold text-[var(--ink)]">{d.group}</dt>
                    <dd className="body-sm text-[var(--ink)]/75">{d.amount}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {!!product.usageSteps?.length && (
            <div>
              {!!product.usageDosage?.length && (
                <p className="display-sm text-[var(--ink)]">{pd.techniqueTitle}</p>
              )}
              <ol className={product.usageDosage?.length ? "mt-3 space-y-5" : "space-y-5"}>
                {product.usageSteps!.map((step, i) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="body-base font-semibold text-[var(--ink)]">{step.title}</p>
                      <p className="body-sm mt-1 text-[var(--ink)]/75">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {product.usageNote && (
            <div className="flex gap-3 rounded-[var(--radius-card)] border border-amber-300 bg-amber-50 p-4">
              <svg
                viewBox="0 0 24 24"
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              </svg>
              <div>
                <p className="body-sm font-semibold text-amber-800">{pd.noteLabel}</p>
                <p className="body-sm mt-1 text-amber-800/90">{product.usageNote}</p>
              </div>
            </div>
          )}
        </div>
      ),
    },
    !!specs.length && {
      key: "specs",
      label: pd.specsTitle,
      content: (
        <dl className="max-w-3xl divide-y divide-[var(--line)] rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)]">
          {specs.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <dt className="body-sm shrink-0 text-[var(--muted)] sm:w-56">{s.label}</dt>
              <dd className="body-sm font-medium text-[var(--ink)] sm:text-right">{s.value}</dd>
            </div>
          ))}
        </dl>
      ),
    },
    !!product.capabilityDetails?.length && {
      key: "capability",
      label: pd.capabilityTitle,
      content: (
        <div>
          <p className="body-base max-w-2xl text-[var(--ink)]/85">{pd.capabilityDesc}</p>
          <ul className="mt-5 grid max-w-3xl gap-2.5 sm:grid-cols-2">
            {product.capabilityDetails!.map((text) => (
              <li
                key={text}
                className="flex gap-2.5 rounded-[var(--radius-control)] bg-[var(--surface)] p-3"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="m5 13 4 4L19 7" />
                </svg>
                <span className="body-sm text-[var(--ink)]">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
  ].filter(Boolean) as ProductTab[];

  return (
    <>
      <JsonLd data={[productLd, crumbs]} />
      <Reveal className="container-page section-y grid gap-10 md:grid-cols-2">
        <div>
          <ProductGallery images={gallery} alt={product.name} />
        </div>
        <div className="min-w-0">
          <Link
            href={withLocale(lang, "/products")}
            className="body-sm text-[var(--muted)] hover:text-[var(--brand)]"
          >
            {dict.common.backProducts}
          </Link>
          <h1 className="display-lg mt-4 break-words text-[var(--ink)]">{product.name}</h1>
          {product.short_description && (
            <p className="body-base mt-4 text-[var(--ink)]/85">{product.short_description}</p>
          )}

          {!!product.highlights?.length && (
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {product.highlights.map((text) => (
                <li
                  key={text}
                  className="flex gap-2.5 rounded-[var(--radius-control)] bg-[var(--bg-soft)] p-3"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                  <span className="body-sm text-[var(--ink)]">{text}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="card mt-8 border-[var(--brand)]/25 bg-[var(--brand)]/5 p-5">
            <Link
              href={`${withLocale(lang, "/contact")}?product=${encodeURIComponent(product.name)}#contact-form`}
              className="inline-flex items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-[var(--shadow-soft)] transition hover:bg-[var(--brand-2)]"
            >
              {dict.common.wholesaleCta}
            </Link>
          </div>
        </div>
      </Reveal>

      {tabs.length > 0 && (
        <div className="border-t border-[var(--line)] bg-[var(--bg-soft)]">
          <div className="container-page section-y">
            <ProductTabs tabs={tabs} />
          </div>
        </div>
      )}

      <RelatedProducts lang={lang} dict={dict} product={product} />

      {!!product.faqs?.length && (
        <div className="border-t border-[var(--line)]">
          <div className="container-page section-y max-w-3xl">
            <p className="display-sm text-[var(--ink)]">{pd.faqTitle}</p>
            <div className="mt-5 divide-y divide-[var(--line)] rounded-[var(--radius-card)] border border-[var(--line)]">
              {product.faqs.map((f) => (
                <details key={f.question} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 body-base font-medium text-[var(--ink)] marker:content-none">
                    {f.question}
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 shrink-0 text-[var(--brand)] transition group-open:rotate-45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </summary>
                  <p className="body-sm mt-3 text-[var(--ink)]/80">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

async function RelatedProducts({
  lang,
  dict,
  product,
}: {
  lang: Locale;
  dict: Dictionary;
  product: Product;
}) {
  const category = product.category_slugs?.[0];
  if (!category) return null;

  const rawProducts = await getProducts({ category });
  const related = localizeProducts(rawProducts, lang).filter((p) => p.id !== product.id);
  if (related.length === 0) return null;

  return (
    <div className="border-t border-[var(--line)] bg-[var(--bg-soft)]">
      <div className="container-page section-y">
        <p className="display-sm text-[var(--ink)]">{dict.productDetail.relatedTitle}</p>
        <Reveal className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              href={withLocale(lang, `/products/${p.slug}`)}
              organicLabel={dict.common.organic}
            />
          ))}
        </Reveal>
      </div>
    </div>
  );
}
