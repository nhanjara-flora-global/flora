import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article";
import { ContentLocaleBadge } from "@/components/content-locale-badge";
import { PageHero } from "@/components/page-hero";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import { getManualPage } from "@/lib/i18n/localized-content";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const dict = getDictionary(locale);
  const page = getManualPage("about-us", locale);
  return {
    title: page?.title ?? dict.about.title,
    description: dict.about.eyebrow,
  };
}

export default async function AboutPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const page = getManualPage("about-us", lang);
  if (!page) notFound();

  return (
    <>
      <PageHero
        eyebrow={dict.about.eyebrow}
        title={page.title}
        image="/images/wp/2025_09_banner1-1.jpg"
        homeHref={withLocale(lang, "/")}
        crumbs={[{ href: withLocale(lang, "/about-us"), label: dict.about.title }]}
      />
      <div className="mx-auto max-w-3xl px-4 py-14 md:px-6">
        <ContentLocaleBadge article={page} uiLocale={lang} />
        <ArticleBody html={page.content} />
      </div>
    </>
  );
}
