import type { Metadata } from "next";
import { AdSlot } from "@/components/news/ad-slot";
import { StoryCard } from "@/components/news/cards";
import { ListingShell } from "@/components/news/shells";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import { getManualServices } from "@/lib/i18n/localized-content";
import { SERVICE_ORDER } from "@/lib/legacy";
import { getServiceTagline } from "@/lib/services/service-tagline";
import { getSolutionCluster } from "@/lib/services/service-theme";
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

  return (
    <ListingShell
      navLabel={dict.news.mainNav}
      band={{
        title: dict.ecosystemPage.title,
        href: withLocale(lang, "/ecosystem"),
        items: services.map((svc) => ({
          href: withLocale(lang, `/ecosystem/${svc.slug}`),
          label: serviceLabel(dict, svc.slug),
        })),
      }}
      ad={<AdSlot ad="partnerFarm" size="leaderboard" tone="light" lang={lang} dict={dict} />}
      title={dict.ecosystemPage.title}
      intro={dict.ecosystemPage.intro}
    >
      <div className="grid gap-x-5 gap-y-8 md:grid-cols-2">
        {services.map((svc) => (
          <StoryCard
            key={svc.slug}
            size="xl"
            sizes="(max-width:768px) 100vw, 50vw"
            story={{
              href: withLocale(lang, `/ecosystem/${svc.slug}`),
              title: svc.title,
              excerpt: getServiceTagline(lang, svc.slug) ?? svc.excerpt,
              image: svc.cover,
              meta: [serviceLabel(dict, svc.slug)],
            }}
          />
        ))}
      </div>
    </ListingShell>
  );
}
