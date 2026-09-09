import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/service/service-detail";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { locales, resolveLocale, withLocale } from "@/lib/i18n/config";
import { getManualPage, getManualServices } from "@/lib/i18n/localized-content";
import { getServices, SERVICE_ORDER } from "@/lib/legacy";
import { parseService } from "@/lib/services/parse-service";
import { getServiceTheme } from "@/lib/services/service-theme";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME, SITE_URL, abs, breadcrumbLd, pageSeo } from "@/lib/seo";

type ServiceSlug = (typeof SERVICE_ORDER)[number];

function serviceLabel(dict: Dictionary, slug: string) {
  return dict.services[slug as ServiceSlug] ?? slug;
}

type Props = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  const services = getServices();
  return locales.flatMap((lang) => services.map((s) => ({ lang, slug: s.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = resolveLocale(lang);
  const service = getManualPage(slug, locale);
  if (!service) return { title: "Not found" };
  return pageSeo({
    lang: locale,
    path: `/services/${slug}`,
    title: service.title,
    description: service.excerpt,
    image: service.cover,
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { lang: raw, slug } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const service = getManualPage(slug, lang);
  if (!service) notFound();

  const theme = getServiceTheme(slug);
  const model = parseService(service.content);
  const label = serviceLabel(dict, slug);

  const sameGroup = getManualServices(lang).filter(
    (svc) => svc.slug !== slug && getServiceTheme(svc.slug).group === theme.group,
  );
  const others = (sameGroup.length >= 3 ? sameGroup : getManualServices(lang).filter((svc) => svc.slug !== slug))
    .slice(0, 6)
    .map((svc) => ({ slug: svc.slug, title: svc.title, label: serviceLabel(dict, svc.slug) }));

  const canonical = abs(withLocale(lang, `/services/${slug}`));
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
    { name: dict.servicesPage.title, path: withLocale(lang, "/services") },
    { name: service.title, path: withLocale(lang, `/services/${slug}`) },
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
      />
    </>
  );
}
