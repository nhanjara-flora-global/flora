import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ProductsCatalog } from "@/components/products-catalog";
import { getCategories, getProducts } from "@/lib/catalog";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localizeCategories, localizeProducts } from "@/lib/i18n/localized-catalog";
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import { pageSeo } from "@/lib/seo";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const dict = getDictionary(locale);
  return pageSeo({
    lang: locale,
    path: "/products",
    title: dict.productsPage.title,
    description: dict.productsPage.intro,
    image: "/images/wp/2026_03_ELITE.jpg",
  });
}

export default async function ProductsPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const [rawProducts, rawCategories] = await Promise.all([getProducts(), getCategories()]);
  const products = localizeProducts(rawProducts, lang);
  const categories = localizeCategories(rawCategories, lang);

  return (
    <>
      <PageHero
        eyebrow={dict.productsPage.eyebrow}
        title={dict.productsPage.title}
        image="/videos/farmers-field-poster.jpg"
        video="/videos/farmers-field.mp4"
        videoSpeed={0.6}
        homeHref={withLocale(lang, "/")}
        crumbs={[{ href: withLocale(lang, "/products"), label: dict.productsPage.title }]}
      />
      <div className="container-page section-y">
        <p className="lead max-w-2xl text-[var(--muted)]">{dict.productsPage.intro}</p>

        <ProductsCatalog
          lang={lang}
          products={products}
          categories={categories}
          organicLabel={dict.common.organic}
          allLabel={dict.productsPage.all}
          emptyLabel={dict.productsPage.empty}
        />
      </div>
    </>
  );
}
