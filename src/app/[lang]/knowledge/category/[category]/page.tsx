import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KnowledgeListing } from "@/components/news/knowledge-listing";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { locales, resolveLocale } from "@/lib/i18n/config";
import { getLocalizedPosts } from "@/lib/i18n/localized-content";
import { NEWS_CATEGORIES } from "@/lib/legacy";
import { pageSeo } from "@/lib/seo";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string; category: string }> };

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    NEWS_CATEGORIES.map((c) => ({ lang, category: c.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, category } = await params;
  const locale = resolveLocale(lang);
  const dict = getDictionary(locale);
  const found = NEWS_CATEGORIES.find((c) => c.slug === category);
  if (!found) return { title: dict.newsPage.title };
  const label = dict.newsCategories[found.slug];
  return pageSeo({
    lang: locale,
    path: `/knowledge/category/${found.slug}`,
    title: label,
    description: `${label} — ${dict.newsPage.title} · ${dict.meta.title}`,
    image: "/images/wp/2025_09_banner22.jpg",
  });
}

export default async function NewsCategoryPage({ params }: Props) {
  const { lang: raw, category } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const found = NEWS_CATEGORIES.find((c) => c.slug === category);
  if (!found) notFound();

  const posts = await getLocalizedPosts(lang, category);

  return <KnowledgeListing lang={lang} dict={dict} category={found.slug} posts={posts} page={1} />;
}
