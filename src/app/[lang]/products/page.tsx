import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/catalog";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localizeCategories, localizeProducts } from "@/lib/i18n/localized-catalog";
import { resolveLocale, withLocale } from "@/lib/i18n/config";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ category?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return { title: dict.productsPage.title, description: dict.productsPage.intro };
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const { category } = await searchParams;
  const [rawProducts, rawCategories] = await Promise.all([
    getProducts({ category }),
    getCategories(),
  ]);
  const products = localizeProducts(rawProducts, lang);
  const categories = localizeCategories(rawCategories, lang);

  return (
    <>
      <PageHero
        eyebrow={dict.productsPage.eyebrow}
        title={dict.productsPage.title}
        image="/images/wp/2026_03_ELITE.jpg"
        homeHref={withLocale(lang, "/")}
        crumbs={[{ href: withLocale(lang, "/products"), label: dict.productsPage.title }]}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <p className="max-w-2xl text-[var(--muted)]">{dict.productsPage.intro}</p>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href={withLocale(lang, "/products")}
            className={`border px-4 py-2 text-sm ${
              !category
                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                : "border-[var(--line)] text-[var(--ink)] hover:border-[var(--brand)]"
            }`}
          >
            {dict.productsPage.all}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`${withLocale(lang, "/products")}?category=${c.slug}`}
              className={`border px-4 py-2 text-sm ${
                category === c.slug
                  ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                  : "border-[var(--line)] text-[var(--ink)] hover:border-[var(--brand)]"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              href={withLocale(lang, `/products/${p.slug}`)}
              organicLabel={dict.common.organic}
              priceOnRequestLabel={dict.common.priceOnRequest}
            />
          ))}
        </div>
        {products.length === 0 && (
          <p className="mt-10 text-[var(--muted)]">{dict.productsPage.empty}</p>
        )}
      </div>
    </>
  );
}
