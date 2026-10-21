import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { PageHero } from "@/components/page-hero";
import { ServiceCardLarge } from "@/components/service/service-card";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import { getManualServices } from "@/lib/i18n/localized-content";
import { SERVICE_ORDER } from "@/lib/legacy";
import { getServiceTagline } from "@/lib/services/service-tagline";
import { getSolutionCluster, serviceIndex } from "@/lib/services/service-theme";
import { pageSeo } from "@/lib/seo";

type ServiceSlug = (typeof SERVICE_ORDER)[number];

function serviceLabel(dict: Dictionary, slug: string) {
  return dict.services[slug as ServiceSlug] ?? slug;
}

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const dict = getDictionary(locale);
  return pageSeo({
    lang: locale,
    path: "/ecosystem",
    title: dict.ecosystemPage.title,
    description: dict.ecosystemPage.intro,
    image: "/images/wp/2026_03_ELITE.jpg",
  });
}

export default async function EcosystemPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const services = getManualServices(lang).filter(
    (svc) => getSolutionCluster(svc.slug as ServiceSlug) === "ecosystem",
  );

  const shared = (svc: (typeof services)[number]) => ({
    slug: svc.slug,
    title: svc.title,
    excerpt: getServiceTagline(lang, svc.slug) ?? svc.excerpt,
    label: serviceLabel(dict, svc.slug),
    index: serviceIndex(svc.slug),
    lang,
    readMore: dict.common.readMore,
    sectionPath: "/ecosystem",
  });

  return (
    <>
      <PageHero
        eyebrow={dict.ecosystemPage.eyebrow}
        title={dict.ecosystemPage.title}
        image="/videos/tractor-drone-poster.jpg"
        video="/videos/tractor-drone.mp4"
        videoSpeed={0.6}
        homeHref={withLocale(lang, "/")}
        crumbs={[{ href: withLocale(lang, "/ecosystem"), label: dict.ecosystemPage.title }]}
      />

      <div className="container-page section-y">
        <p className="mx-auto max-w-3xl text-center text-[1.15rem] leading-relaxed text-[var(--muted)]">
          {dict.ecosystemPage.intro}
        </p>

        <Reveal className="mt-14 grid gap-8 md:grid-cols-2">
          {services.map((svc) => (
            <ServiceCardLarge key={svc.slug} {...shared(svc)} cover={svc.cover} />
          ))}
        </Reveal>
      </div>
    </>
  );
}
