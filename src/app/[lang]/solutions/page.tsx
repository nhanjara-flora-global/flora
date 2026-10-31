import type { Metadata } from "next";
import { AdSlot } from "@/components/news/ad-slot";
import { FeatureStory, StoryCard, type Story } from "@/components/news/cards";
import { ListingShell } from "@/components/news/shells";
import { SectionHeader } from "@/components/news/ui";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import { getManualServices } from "@/lib/i18n/localized-content";
import { SERVICE_ORDER } from "@/lib/legacy";
import { getServiceStrings, type ServiceStrings } from "@/lib/services/service-i18n";
import { getServiceTagline } from "@/lib/services/service-tagline";
import { getSolutionCluster, type SolutionCluster } from "@/lib/services/service-theme";
import { pageSeo } from "@/lib/seo";

type ServiceSlug = (typeof SERVICE_ORDER)[number];

function serviceLabel(dict: Dictionary, slug: string) {
  return dict.services[slug as ServiceSlug] ?? slug;
}

// Ecosystem cluster lives at its own /ecosystem section — Solutions only
// covers the 4 capability clusters a buyer/farmer is actually choosing between.
const SOLUTIONS_CLUSTERS: {
  cluster: Exclude<SolutionCluster, "ecosystem">;
  title: (s: ServiceStrings) => string;
  note: (s: ServiceStrings) => string;
}[] = [
  {
    cluster: "precision-farming",
    title: (s) => s.clusterPrecisionFarming,
    note: (s) => s.clusterPrecisionFarmingNote,
  },
  {
    cluster: "certification",
    title: (s) => s.clusterCertification,
    note: (s) => s.clusterCertificationNote,
  },
  {
    cluster: "sourcing",
    title: (s) => s.clusterSourcing,
    note: (s) => s.clusterSourcingNote,
  },
  {
    cluster: "export",
    title: (s) => s.clusterExport,
    note: (s) => s.clusterExportNote,
  },
];

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const dict = getDictionary(locale);
  const s = getServiceStrings(locale);
  return pageSeo({
    lang: locale,
    path: "/solutions",
    title: dict.servicesPage.title,
    description: s.intro || dict.servicesPage.eyebrow,
    image: "/images/wp/2026_03_PRECISION-GROWING.jpg",
  });
}

export default async function SolutionsPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const s = getServiceStrings(lang);
  const services = getManualServices(lang);

  const toStory = (svc: (typeof services)[number]): Story => ({
    href: withLocale(lang, `/solutions/${svc.slug}`),
    title: svc.title,
    excerpt: getServiceTagline(lang, svc.slug) ?? svc.excerpt,
    image: svc.cover,
    meta: [serviceLabel(dict, svc.slug)],
  });

  return (
    <ListingShell
      ad={<AdSlot ad="certification" size="leaderboard" tone="cream" lang={lang} dict={dict} />}
      title={dict.servicesPage.title}
      intro={s.intro}
    >
      <div className="flex flex-col gap-10">
        {SOLUTIONS_CLUSTERS.map(({ cluster, title, note }) => {
          const items = services.filter((svc) => getSolutionCluster(svc.slug as ServiceSlug) === cluster);
          if (items.length === 0) return null;
          const [lead, ...rest] = items;
          return (
            // scroll-mt: chừa chỗ cho header dính khi bấm link #cụm trên menu.
            <section key={cluster} id={cluster} aria-labelledby={`h-${cluster}`} className="scroll-mt-32">
              <SectionHeader id={`h-${cluster}`} title={title(s)} />
              <p className="-mt-1 mb-5 max-w-3xl text-sm leading-relaxed text-ink-2">{note(s)}</p>
              <FeatureStory story={toStory(lead)} kicker={serviceLabel(dict, lead.slug)} cta={dict.news.readMore} />
              {rest.length > 0 && (
                <div className="mt-6 grid gap-5 border-t border-rule pt-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((svc) => (
                    <StoryCard key={svc.slug} story={toStory(svc)} size="lg" />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </ListingShell>
  );
}
