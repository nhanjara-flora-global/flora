import type { Metadata } from "next";
import { KnowledgeListing } from "@/components/news/knowledge-listing";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/config";
import { getLocalizedPosts } from "@/lib/i18n/localized-content";
import { pageSeo } from "@/lib/seo";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const dict = getDictionary(locale);
  return pageSeo({
    lang: locale,
    path: "/knowledge",
    title: dict.newsPage.title,
    description: dict.meta.description,
    image: "/images/wp/2025_09_banner22.jpg",
  });
}

export default async function NewsPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const posts = await getLocalizedPosts(lang);

  return <KnowledgeListing lang={lang} dict={dict} category={null} posts={posts} page={1} />;
}
