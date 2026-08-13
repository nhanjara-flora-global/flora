import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article";
import { NewsTabs } from "@/components/news-tabs";
import { PageHero } from "@/components/page-hero";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { locales, resolveLocale, withLocale } from "@/lib/i18n/config";
import { getLocalizedPosts } from "@/lib/i18n/localized-content";
import { NEWS_CATEGORIES } from "@/lib/legacy";

type Props = { params: Promise<{ lang: string; category: string }> };

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    NEWS_CATEGORIES.map((c) => ({ lang, category: c.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, category } = await params;
  const dict = getDictionary(lang);
  const found = NEWS_CATEGORIES.find((c) => c.slug === category);
  return {
    title: found ? dict.newsCategories[found.slug] : dict.newsPage.title,
  };
}

export default async function NewsCategoryPage({ params }: Props) {
  const { lang: raw, category } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const found = NEWS_CATEGORIES.find((c) => c.slug === category);
  if (!found) notFound();

  const posts = getLocalizedPosts(lang, category);
  const label = dict.newsCategories[found.slug];

  return (
    <>
      <PageHero
        eyebrow={dict.newsPage.eyebrow}
        title={label}
        image="/images/wp/2025_09_banner22.jpg"
        homeHref={withLocale(lang, "/")}
        crumbs={[
          { href: withLocale(lang, "/news"), label: dict.newsPage.title },
          { href: withLocale(lang, `/news/category/${found.slug}`), label },
        ]}
      />
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <NewsTabs active={found.slug} locale={lang} dict={dict} />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard
              key={post.slug}
              article={post}
              href={withLocale(lang, `/news/${post.slug}`)}
              readMore={dict.common.readMore}
            />
          ))}
        </div>
      </div>
    </>
  );
}
