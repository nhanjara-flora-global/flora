import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article";
import { ContentLocaleBadge } from "@/components/content-locale-badge";
import { AdSlot } from "@/components/news/ad-slot";
import { RelatedKnowledge } from "@/components/news/related-knowledge";
import { ArticleShell, CtaBox, LinkList } from "@/components/news/shells";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import { getManualPage } from "@/lib/i18n/localized-content";
import { getServiceStrings } from "@/lib/services/service-i18n";
import { SOLUTION_CLUSTER_ORDER } from "@/lib/services/service-theme";
import { pageSeo } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const dict = getDictionary(locale);
  const page = getManualPage("about-us", locale);
  return pageSeo({
    lang: locale,
    path: "/about-us",
    title: page?.title ?? dict.about.title,
    description: page?.excerpt || dict.about.eyebrow,
    image: page?.cover ?? "/images/wp/2025_09_banner1-1.jpg",
  });
}

export default async function AboutPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const s = getServiceStrings(lang);
  const page = getManualPage("about-us", lang);
  if (!page) notFound();

  const clusterLabel: Record<(typeof SOLUTION_CLUSTER_ORDER)[number], string> = {
    "precision-farming": s.clusterPrecisionFarming,
    certification: s.clusterCertification,
    sourcing: s.clusterSourcing,
    export: s.clusterExport,
    ecosystem: s.clusterEcosystem,
  };

  return (
    <ArticleShell
      breadcrumbLabel={dict.news.breadcrumb}
      breadcrumb={[{ href: withLocale(lang, "/about-us"), label: dict.about.title }]}
      kicker={dict.about.eyebrow}
      title={page.title}
      // Ảnh bìa (chân dung CEO) đã nằm trong nội dung — không lặp lại ở đầu bài.
      sidebarLabel={dict.news.sidebar}
      sidebar={
        <>
          <CtaBox
            title={dict.common.readyPartner}
            href={withLocale(lang, "/contact")}
            cta={dict.common.initiatePartnership}
          />
          <LinkList
            title={dict.servicesPage.title}
            href={withLocale(lang, "/solutions")}
            items={SOLUTION_CLUSTER_ORDER.map((c) => ({
              href: c === "ecosystem" ? withLocale(lang, "/ecosystem") : `${withLocale(lang, "/solutions")}#${c}`,
              label: clusterLabel[c],
            }))}
          />
          <AdSlot ad="partnerFarm" size="mpu" tone="image" surface="none" lang={lang} dict={dict} />
        </>
      }
      after={<RelatedKnowledge lang={lang} dict={dict} category="goc-nhin-flora" />}
    >
      <div className="mt-6">
        <ContentLocaleBadge article={page} uiLocale={lang} />
        <ArticleBody html={page.content} className="prose-legacy prose-news" />
      </div>
    </ArticleShell>
  );
}
