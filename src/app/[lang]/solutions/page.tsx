import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { PageHero } from "@/components/page-hero";
import { ServiceCardFeature, ServiceCardLarge } from "@/components/service/service-card";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import { getManualServices } from "@/lib/i18n/localized-content";
import { SERVICE_ORDER } from "@/lib/legacy";
import { getServiceStrings, type ServiceStrings } from "@/lib/services/service-i18n";
import { getServiceTagline } from "@/lib/services/service-tagline";
import {
  getSolutionCluster,
  serviceIndex,
  type SolutionCluster,
} from "@/lib/services/service-theme";
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

  const byCluster = (cluster: SolutionCluster) =>
    services.filter((svc) => getSolutionCluster(svc.slug as ServiceSlug) === cluster);

  const shared = (svc: (typeof services)[number]) => ({
    slug: svc.slug,
    title: svc.title,
    excerpt: getServiceTagline(lang, svc.slug) ?? svc.excerpt,
    label: serviceLabel(dict, svc.slug),
    index: serviceIndex(svc.slug),
    lang,
    readMore: dict.common.readMore,
    sectionPath: "/solutions",
  });

  return (
    <>
      <PageHero
        eyebrow={dict.servicesPage.eyebrow}
        title={dict.servicesPage.title}
        image="/videos/solutions-hero-poster.jpg"
        video="/videos/solutions-hero.mp4"
        homeHref={withLocale(lang, "/")}
        crumbs={[{ href: withLocale(lang, "/solutions"), label: dict.servicesPage.title }]}
      />

      <div className="container-page section-y space-y-20">
        <p className="mx-auto max-w-3xl text-center text-[1.15rem] leading-relaxed text-[var(--muted)]">
          {s.intro}
        </p>

        {SOLUTIONS_CLUSTERS.map(({ cluster, title, note }, i) => {
          const items = byCluster(cluster);
          if (items.length === 0) return null;
          const [lead, ...rest] = items;
          return (
            <section key={cluster} id={cluster} className="scroll-mt-28">
              <SectionHead n={String(i + 1).padStart(2, "0")} title={title(s)} note={note(s)} />
              <div className="space-y-8">
                <Reveal>
                  <ServiceCardFeature {...shared(lead)} cover={lead.cover} />
                </Reveal>
                {rest.length > 0 && (
                  <Reveal className="grid gap-8 md:grid-cols-2">
                    {rest.map((svc) => (
                      <ServiceCardLarge key={svc.slug} {...shared(svc)} cover={svc.cover} />
                    ))}
                  </Reveal>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function SectionHead({ n, title, note }: { n: string; title: string; note: string }) {
  return (
    <header className="mb-8 max-w-3xl">
      <p className="eyebrow text-[var(--brand)]">{n}</p>
      <h2 className="display-md mt-2">{title}</h2>
      <p className="body-base mt-3 text-[var(--muted)]">{note}</p>
    </header>
  );
}
