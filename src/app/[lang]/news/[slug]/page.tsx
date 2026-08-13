import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody, ArticleCard } from "@/components/article";
import { ContentLocaleBadge } from "@/components/content-locale-badge";
import { PageHero } from "@/components/page-hero";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { locales, resolveLocale, withLocale } from "@/lib/i18n/config";
import {
  getLocalizedPost,
  getLocalizedPosts,
} from "@/lib/i18n/localized-content";
import {
  categoriesOf,
  formatDate,
  getPosts,
  NEWS_CATEGORIES,
} from "@/lib/legacy";

type Props = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((lang) => getPosts().map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = getLocalizedPost(slug, resolveLocale(lang));
  if (!post) return { title: "Not found" };
  return { title: post.title, description: post.excerpt };
}

export default async function NewsPostPage({ params }: Props) {
  const { lang: raw, slug } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const post = getLocalizedPost(slug, lang);
  if (!post) notFound();

  const cats = categoriesOf(slug)
    .map((c) => NEWS_CATEGORIES.find((n) => n.slug === c))
    .filter((c) => c !== undefined);
  const related = getLocalizedPosts(lang)
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={formatDate(post.date)}
        title={post.title}
        image={post.cover}
        homeHref={withLocale(lang, "/")}
        crumbs={[{ href: withLocale(lang, "/news"), label: dict.newsPage.title }]}
      />

      <article className="mx-auto max-w-3xl px-4 py-14 md:px-6">
        {cats.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {cats.map((c) => (
              <Link
                key={c.slug}
                href={withLocale(lang, `/news/category/${c.slug}`)}
                className="border border-[var(--line)] px-3 py-1 text-xs uppercase tracking-wide text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                {dict.newsCategories[c.slug]}
              </Link>
            ))}
          </div>
        )}
        <ContentLocaleBadge article={post} uiLocale={lang} />
        <ArticleBody html={post.content} />
      </article>

      {related.length > 0 && (
        <section className="border-t border-[var(--line)] bg-[var(--bg-soft)]">
          <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
            <h2 className="mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold">
              {dict.common.relatedPosts}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <ArticleCard
                  key={p.slug}
                  article={p}
                  href={withLocale(lang, `/news/${p.slug}`)}
                  readMore={dict.common.readMore}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
