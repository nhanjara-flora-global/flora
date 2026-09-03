import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { PageHero } from "@/components/page-hero";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import { getManualServices } from "@/lib/i18n/localized-content";
import { SERVICE_ORDER } from "@/lib/legacy";

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
  const services = getManualServices(lang);

  return (
    <>
      <PageHero
        eyebrow={dict.servicesPage.eyebrow}
        title={dict.servicesPage.title}
        image="/images/wp/2026_03_PRECISION-GROWING.jpg"
        homeHref={withLocale(lang, "/")}
        crumbs={[{ href: withLocale(lang, "/services"), label: dict.servicesPage.title }]}
      />

      <div className="container-page section-y">
        <Reveal className="grid gap-8 md:grid-cols-2">
          {services.map((service, i) => (
            <Link
              key={service.slug}
              href={withLocale(lang, `/services/${service.slug}`)}
              className="card card-interactive group flex flex-col"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-[var(--bg-soft)]">
                {service.cover && (
                  <Image
                    src={service.cover}
                    alt={service.title}
                    fill
                    sizes="(max-width:768px) 100vw, 50vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="eyebrow text-[var(--brand)]">
                  {String(i + 1).padStart(2, "0")} · {serviceLabel(dict, service.slug)}
                </p>
                <h2 className="display-md mt-3 transition-colors group-hover:text-[var(--brand)]">
                  {service.title}
                </h2>
                <p className="body-sm mt-3 line-clamp-4 text-[var(--muted)]">{service.excerpt}</p>
                <span className="body-sm mt-5 font-semibold text-[var(--brand)]">
                  {dict.common.readMore}
                </span>
              </div>
            </Link>
          ))}
        </Reveal>
      </div>
    </>
  );
}
