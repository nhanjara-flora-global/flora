import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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

      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          {services.map((service, i) => (
            <Link
              key={service.slug}
              href={withLocale(lang, `/services/${service.slug}`)}
              className="group flex flex-col border border-[var(--line)] transition hover:border-[var(--brand)]"
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
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--brand)]">
                  {String(i + 1).padStart(2, "0")} · {serviceLabel(dict, service.slug)}
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-snug group-hover:text-[var(--brand)]">
                  {service.title}
                </h2>
                <p className="mt-3 line-clamp-4 text-sm text-[var(--muted)]">{service.excerpt}</p>
                <span className="mt-5 text-sm font-semibold text-[var(--brand)]">
                  {dict.common.readMore}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
