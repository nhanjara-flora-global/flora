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

// The 4 VOAC consortium/farm-network pages that don't map to a single business
// capability — see the "ecosystem" cluster in service-theme.ts.
const ECOSYSTEM_SLUGS = SERVICE_ORDER.filter((slug) => getSolutionCluster(slug) === "ecosystem");

type Props = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  const services = getServices().filter((s) =>
    ECOSYSTEM_SLUGS.includes(s.slug as (typeof ECOSYSTEM_SLUGS)[number]),
  );
  return locales.flatMap((lang) => services.map((s) => ({ lang, slug: s.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!ECOSYSTEM_SLUGS.includes(slug as (typeof ECOSYSTEM_SLUGS)[number])) return { title: "Not found" };
  const locale = resolveLocale(lang);
  const service = getManualPage(slug, locale);
  if (!service) return { title: "Not found" };
  return pageSeo({
    lang: locale,
    path: `/ecosystem/${slug}`,
    title: service.title,
    description: service.excerpt,
    image: service.cover,
  });
}

export default async function EcosystemDetailPage({ params }: Props) {
  const { lang: raw, slug } = await params;
  if (!ECOSYSTEM_SLUGS.includes(slug as (typeof ECOSYSTEM_SLUGS)[number])) notFound();
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const service = getManualPage(slug, lang);
  if (!service) notFound();

  const theme = getServiceTheme(slug);
  const model = parseService(service.content);
  const label = serviceLabel(dict, slug);

  const others = getManualServices(lang)
    .filter((svc) => svc.slug !== slug && ECOSYSTEM_SLUGS.includes(svc.slug as (typeof ECOSYSTEM_SLUGS)[number]))
    .slice(0, 6)
    .map((svc) => ({ slug: svc.slug, title: svc.title, label: serviceLabel(dict, svc.slug) }));

  const canonical = abs(withLocale(lang, `/ecosystem/${slug}`));
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
    { name: dict.ecosystemPage.title, path: withLocale(lang, "/ecosystem") },
    { name: service.title, path: withLocale(lang, `/ecosystem/${slug}`) },
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
        sectionPath="/ecosystem"
        sectionLabel={dict.ecosystemPage.title}
        after={<RelatedKnowledge lang={lang} dict={dict} category={categoryForService(slug)} />}
      />
    </>
  );
}
