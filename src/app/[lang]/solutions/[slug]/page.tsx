import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RelatedKnowledge, categoryForService } from "@/components/news/related-knowledge";
import { ServiceDetail } from "@/components/service/service-detail";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { locales, resolveLocale, withLocale } from "@/lib/i18n/config";
import { getManualPage, getManualServices } from "@/lib/i18n/localized-content";
import { getServices, SERVICE_ORDER } from "@/lib/legacy";
import { parseService } from "@/lib/services/parse-service";
import { getServiceTheme, getSolutionCluster } from "@/lib/services/service-theme";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME, SITE_URL, abs, breadcrumbLd, pageSeo } from "@/lib/seo";

type ServiceSlug = (typeof SERVICE_ORDER)[number];

function serviceLabel(dict: Dictionary, slug: string) {
  return dict.services[slug as ServiceSlug] ?? slug;
}

// Every service slug whose cluster isn't "ecosystem" — the 10 that live under
// /solutions. The other 4 (VOAC consortium/farm-network pages) live at /ecosystem.
const SOLUTION_SLUGS = SERVICE_ORDER.filter(
  (slug) => getSolutionCluster(slug) !== "ecosystem",
);

type Props = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  const services = getServices().filter((s) =>
    SOLUTION_SLUGS.includes(s.slug as (typeof SOLUTION_SLUGS)[number]),
  );
  return locales.flatMap((lang) => services.map((s) => ({ lang, slug: s.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!SOLUTION_SLUGS.includes(slug as (typeof SOLUTION_SLUGS)[number])) return { title: "Not found" };
  const locale = resolveLocale(lang);
  const service = getManualPage(slug, locale);
  if (!service) return { title: "Not found" };
  return pageSeo({
    lang: locale,
    path: `/solutions/${slug}`,
    title: service.title,
    description: service.excerpt,
    image: service.cover,
  });
}

export default async function SolutionDetailPage({ params }: Props) {
  const { lang: raw, slug } = await params;
  if (!SOLUTION_SLUGS.includes(slug as (typeof SOLUTION_SLUGS)[number])) notFound();
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const service = getManualPage(slug, lang);
  if (!service) notFound();

  const theme = getServiceTheme(slug);
  const model = parseService(service.content);
  const label = serviceLabel(dict, slug);
  const cluster = getSolutionCluster(slug as ServiceSlug);

  const sameCluster = getManualServices(lang).filter(
    (svc) => svc.slug !== slug && getSolutionCluster(svc.slug as ServiceSlug) === cluster,
  );
  const others = (
    sameCluster.length >= 3
      ? sameCluster
      : getManualServices(lang).filter(
          (svc) => svc.slug !== slug && SOLUTION_SLUGS.includes(svc.slug as (typeof SOLUTION_SLUGS)[number]),
        )
  )
    .slice(0, 6)
    .map((svc) => ({ slug: svc.slug, title: svc.title, label: serviceLabel(dict, svc.slug) }));

  const canonical = abs(withLocale(lang, `/solutions/${slug}`));
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.excerpt,
    serviceType: label,
    url: canonical,
    provider: { "@type": "Organization", name: SITE_NAME, "@id": `${SITE_URL}/#organization` },
    areaServed: "Worldwide",
    ...(service.cover ? { image: abs(service.cover) } : {}),
  };
  const crumbs = breadcrumbLd([
    { name: SITE_NAME, path: withLocale(lang, "/") },
    { name: dict.servicesPage.title, path: withLocale(lang, "/solutions") },
    { name: service.title, path: withLocale(lang, `/solutions/${slug}`) },
  ]);

  return (
    <>
      <JsonLd data={[serviceLd, crumbs]} />
      <ServiceDetail
        service={service}
        model={model}
        theme={theme}
        label={label}
        lang={lang}
        dict={dict}
        others={others}
        sectionPath="/solutions"
        sectionLabel={dict.servicesPage.title}
        after={<RelatedKnowledge lang={lang} dict={dict} category={categoryForService(slug)} />}
      />
    </>
  );
}
