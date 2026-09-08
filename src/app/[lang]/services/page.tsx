import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { PageHero } from "@/components/page-hero";
import { ServiceCardLarge, ServiceCardTile } from "@/components/service/service-card";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import { getManualServices } from "@/lib/i18n/localized-content";
import { SERVICE_ORDER } from "@/lib/legacy";
import { getServiceStrings } from "@/lib/services/service-i18n";
import { getServiceTheme, serviceIndex } from "@/lib/services/service-theme";

type ServiceSlug = (typeof SERVICE_ORDER)[number];

function serviceLabel(dict: Dictionary, slug: string) {
  return dict.services[slug as ServiceSlug] ?? slug;
}

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return { title: dict.servicesPage.title, description: dict.servicesPage.eyebrow };
}

export default async function ServicesPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const s = getServiceStrings(lang);
  const services = getManualServices(lang);

  const flora = services.filter((svc) => getServiceTheme(svc.slug).group === "flora");
  const voac = services.filter((svc) => getServiceTheme(svc.slug).group === "voac");

  return (
    <>
      <PageHero
        eyebrow={dict.servicesPage.eyebrow}
        title={dict.servicesPage.title}
        image="/images/wp/2026_03_PRECISION-GROWING.jpg"
        homeHref={withLocale(lang, "/")}
        crumbs={[{ href: withLocale(lang, "/services"), label: dict.servicesPage.title }]}
      />

      <div className="container-page section-y space-y-16">
        <p className="mx-auto max-w-3xl text-center text-[1.15rem] leading-relaxed text-[var(--muted)]">
          {s.intro}
        </p>

        <section>
          <header className="mb-8 max-w-3xl">
            <p className="eyebrow text-[var(--brand)]">01</p>
            <h2 className="display-md mt-2">{s.divisionFlora}</h2>
            <p className="body-base mt-3 text-[var(--muted)]">{s.divisionFloraNote}</p>
          </header>
          <Reveal className="grid gap-8 md:grid-cols-2">
            {flora.map((svc) => (
              <ServiceCardLarge
                key={svc.slug}
                slug={svc.slug}
                title={svc.title}
                excerpt={getServiceTheme(svc.slug).tagline ?? svc.excerpt}
                label={serviceLabel(dict, svc.slug)}
                index={serviceIndex(svc.slug)}
                lang={lang}
                cover={svc.cover}
                readMore={dict.common.readMore}
              />
            ))}
          </Reveal>
        </section>

        <section>
          <header className="mb-8 max-w-3xl">
            <p className="eyebrow text-[var(--brand)]">02</p>
            <h2 className="display-md mt-2">{s.divisionVoac}</h2>
            <p className="body-base mt-3 text-[var(--muted)]">{s.divisionVoacNote}</p>
          </header>
          <Reveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {voac.map((svc) => (
              <ServiceCardTile
                key={svc.slug}
                slug={svc.slug}
                title={svc.title}
                excerpt={getServiceTheme(svc.slug).tagline ?? svc.excerpt}
                label={serviceLabel(dict, svc.slug)}
                index={serviceIndex(svc.slug)}
                lang={lang}
                readMore={dict.common.readMore}
              />
            ))}
          </Reveal>
        </section>
      </div>
    </>
  );
}
