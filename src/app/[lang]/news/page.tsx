import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { ArticleCard } from "@/components/article";
import { NewsTabs } from "@/components/news-tabs";
import { PageHero } from "@/components/page-hero";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import { getLocalizedPosts } from "@/lib/i18n/localized-content";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return { title: dict.newsPage.title, description: dict.meta.description };
}

export default async function NewsPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const posts = await getLocalizedPosts(lang);

  return (
    <>
      <PageHero
        eyebrow={dict.newsPage.eyebrow}
        title={dict.newsPage.title}
        image="/images/wp/2025_09_banner22.jpg"
        homeHref={withLocale(lang, "/")}
        crumbs={[{ href: withLocale(lang, "/news"), label: dict.newsPage.title }]}
      />
      <div className="container-page section-y">
        <NewsTabs active={null} locale={lang} dict={dict} />
        <Reveal className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard
              key={post.slug}
              article={post}
              href={withLocale(lang, `/news/${post.slug}`)}
              readMore={dict.common.readMore}
            />
          ))}
        </Reveal>
      </div>
    </>
  );
}
