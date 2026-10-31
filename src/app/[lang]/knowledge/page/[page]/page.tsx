import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KnowledgeListing, listPageCount } from "@/components/news/knowledge-listing";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/config";
import { getLocalizedPosts } from "@/lib/i18n/localized-content";
import { pageSeo } from "@/lib/seo";

// Trang 2, 3... của /knowledge. Dùng đường dẫn thay vì ?page= để trang vẫn
// được tạo tĩnh và cache (ISR); trang mới phát sinh khi có thêm bài sẽ được
// dựng lần đầu khi có người mở.
export const revalidate = 300;

type Props = { params: Promise<{ lang: string; page: string }> };

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, page } = await params;
  const locale = resolveLocale(lang);
  const dict = getDictionary(locale);
  return pageSeo({
    lang: locale,
    path: `/knowledge/page/${page}`,
    title: `${dict.newsPage.title} – ${page}`,
    description: dict.meta.description,
    image: "/images/wp/2025_09_banner22.jpg",
  });
}

export default async function NewsPagedPage({ params }: Props) {
  const { lang: raw, page: rawPage } = await params;
  const lang = resolveLocale(raw);
  const posts = await getLocalizedPosts(lang);
  const page = Number(rawPage);
  // Trang 1 nằm ở /knowledge; số trang vượt quá thì 404.
  if (!Number.isInteger(page) || page < 2 || page > listPageCount(posts.length)) notFound();

  return <KnowledgeListing lang={lang} dict={getDictionary(lang)} category={null} posts={posts} page={page} />;
}
