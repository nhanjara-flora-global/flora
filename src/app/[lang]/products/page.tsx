import type { Metadata } from "next";
import { AdSlot } from "@/components/news/ad-slot";
import { ListingShell } from "@/components/news/shells";
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
    <ListingShell
      navLabel={dict.news.mainNav}
      band={{ title: dict.productsPage.title, href: withLocale(lang, "/products") }}
      ad={<AdSlot ad="certification" size="leaderboard" tone="cream" lang={lang} dict={dict} />}
      title={dict.productsPage.title}
      intro={dict.productsPage.intro}
    >
      <ProductsCatalog
        lang={lang}
        products={products}
        categories={categories}
        organicLabel={dict.common.organic}
        allLabel={dict.productsPage.all}
        emptyLabel={dict.productsPage.empty}
        quoteLabel={dict.news.quote}
        photoLabel={dict.news.photo}
      />
    </ListingShell>
  );
}
