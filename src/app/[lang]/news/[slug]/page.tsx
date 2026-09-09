import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { ArticleBody, ArticleCard } from "@/components/article";
import { ContentLocaleBadge } from "@/components/content-locale-badge";
import { PageHero } from "@/components/page-hero";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { locales, resolveLocale, withLocale } from "@/lib/i18n/config";
import {
  getLocalizedPost,
  getLocalizedPosts,
} from "@/lib/i18n/localized-content";
import { formatDate, getPosts, NEWS_CATEGORIES } from "@/lib/legacy";
import { JsonLd } from "@/components/seo/json-ld";
import {
  SITE_NAME,
  SITE_URL,
  abs,
  breadcrumbLd,
  pageSeo,
} from "@/lib/seo";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((lang) => getPosts().map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = resolveLocale(lang);
  const post = await getLocalizedPost(slug, locale);
  if (!post) return { title: "Not found" };
  return pageSeo({
    lang: locale,
    path: `/news/${slug}`,
    title: post.title,
    description: post.excerpt,
    image: post.cover,
    type: "article",
    publishedTime: post.date || undefined,
  });
}

export default async function NewsPostPage({ params }: Props) {
  const { lang: raw, slug } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const post = await getLocalizedPost(slug, lang);
  if (!post) notFound();

  const cats = (post.categories ?? [])
    .map((c) => NEWS_CATEGORIES.find((n) => n.slug === c))
    .filter((c) => c !== undefined);
  const related = (await getLocalizedPosts(lang))
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    ...(post.cover ? { image: [abs(post.cover)] } : {}),
    ...(post.date ? { datePublished: post.date, dateModified: post.date } : {}),
    inLanguage: lang,
    mainEntityOfPage: abs(withLocale(lang, `/news/${slug}`)),
    author: { "@type": "Organization", name: SITE_NAME, "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
  const crumbs = breadcrumbLd([
    { name: SITE_NAME, path: withLocale(lang, "/") },
    { name: dict.newsPage.title, path: withLocale(lang, "/news") },
    { name: post.title, path: withLocale(lang, `/news/${slug}`) },
  ]);

  return (
    <>
      <JsonLd data={[articleLd, crumbs]} />
      <PageHero
        eyebrow={formatDate(post.date)}
        title={post.title}
        image={post.cover}
        homeHref={withLocale(lang, "/")}
        crumbs={[{ href: withLocale(lang, "/news"), label: dict.newsPage.title }]}
      />

      <article className="container-page section-y">
        <div className="mx-auto max-w-3xl">
          {cats.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {cats.map((c) => (
                <Link
                  key={c.slug}
                  href={withLocale(lang, `/news/category/${c.slug}`)}
                  className="meta rounded-[var(--radius-control)] border border-[var(--line)] px-3 py-1.5 uppercase text-[var(--muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  {dict.newsCategories[c.slug]}
                </Link>
              ))}
            </div>
          )}
          <ContentLocaleBadge article={post} uiLocale={lang} />
          <ArticleBody html={post.content} />
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-[var(--bg-soft)]">
          <div className="container-page section-y">
            <h2 className="display-lg mb-8">{dict.common.relatedPosts}</h2>
            <Reveal className="grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <ArticleCard
                  key={p.slug}
                  article={p}
                  href={withLocale(lang, `/news/${p.slug}`)}
                  readMore={dict.common.readMore}
                />
              ))}
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
