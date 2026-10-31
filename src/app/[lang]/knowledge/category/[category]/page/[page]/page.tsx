import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KnowledgeListing, listPageCount } from "@/components/news/knowledge-listing";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/config";
import { getLocalizedPosts } from "@/lib/i18n/localized-content";
import { NEWS_CATEGORIES } from "@/lib/legacy";
import { pageSeo } from "@/lib/seo";

// Trang 2, 3... của một chuyên mục — xem ghi chú ở /knowledge/page/[page].
export const revalidate = 300;

type Props = { params: Promise<{ lang: string; category: string; page: string }> };

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, category, page } = await params;
  const locale = resolveLocale(lang);
  const dict = getDictionary(locale);
  const found = NEWS_CATEGORIES.find((c) => c.slug === category);
  if (!found) return { title: dict.newsPage.title };
  const label = dict.newsCategories[found.slug];
  return pageSeo({
    lang: locale,
    path: `/knowledge/category/${found.slug}/page/${page}`,
    title: `${label} – ${page}`,
    description: `${label} — ${dict.newsPage.title} · ${dict.meta.title}`,
    image: "/images/wp/2025_09_banner22.jpg",
  });
}

export default async function NewsCategoryPagedPage({ params }: Props) {
  const { lang: raw, category, page: rawPage } = await params;
  const lang = resolveLocale(raw);
  const found = NEWS_CATEGORIES.find((c) => c.slug === category);
  if (!found) notFound();
  const posts = await getLocalizedPosts(lang, category);
  const page = Number(rawPage);
  if (!Number.isInteger(page) || page < 2 || page > listPageCount(posts.length)) notFound();

  return <KnowledgeListing lang={lang} dict={getDictionary(lang)} category={found.slug} posts={posts} page={page} />;
}
