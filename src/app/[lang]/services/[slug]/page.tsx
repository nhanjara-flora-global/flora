import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article";
import { ContentLocaleBadge } from "@/components/content-locale-badge";
import { PageHero } from "@/components/page-hero";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { locales, resolveLocale, withLocale } from "@/lib/i18n/config";
import { getManualPage, getManualServices } from "@/lib/i18n/localized-content";
import { getServices, SERVICE_ORDER } from "@/lib/legacy";

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
  return { title: service.title, description: service.excerpt };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { lang: raw, slug } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const service = getManualPage(slug, lang);
  if (!service) notFound();

  const others = getManualServices(lang).filter((s) => s.slug !== slug);

  return (
    <>
      <PageHero
        eyebrow={serviceLabel(dict, service.slug)}
        title={service.title}
        image={service.cover}
        homeHref={withLocale(lang, "/")}
        crumbs={[{ href: withLocale(lang, "/services"), label: dict.servicesPage.title }]}
      />

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-[1fr_280px] md:px-6">
        <article>
          <ContentLocaleBadge article={service} uiLocale={lang} />
          <ArticleBody html={service.content} />
          <div className="mt-12 border-t border-[var(--line)] pt-8">
            <p className="font-[family-name:var(--font-display)] text-xl font-semibold">
              {dict.common.readyPartner}
            </p>
            <Link
              href={withLocale(lang, "/contact")}
              className="mt-4 inline-block bg-[var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[var(--brand-2)]"
            >
              {dict.common.initiatePartnership}
            </Link>
          </div>
        </article>

        <aside>
          <p className="text-sm font-semibold uppercase tracking-wide">
            {dict.common.otherServices}
          </p>
          <div className="mb-4 mt-2 h-0.5 w-10 bg-[var(--brand)]" />
          <ul className="space-y-3 text-sm">
            {others.map((s) => (
              <li key={s.slug}>
                <Link
                  href={withLocale(lang, `/services/${s.slug}`)}
                  className="text-[var(--muted)] hover:text-[var(--brand)]"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
