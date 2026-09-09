import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { PageHero } from "@/components/page-hero";
import {
  ServiceCardFeature,
  ServiceCardLarge,
  ServiceRow,
} from "@/components/service/service-card";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import { getManualServices } from "@/lib/i18n/localized-content";
import { SERVICE_ORDER } from "@/lib/legacy";
import { getServiceStrings } from "@/lib/services/service-i18n";
import { getServiceTagline } from "@/lib/services/service-tagline";
import { getServiceTheme, serviceIndex } from "@/lib/services/service-theme";
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
  const s = getServiceStrings(locale);
  return pageSeo({
    lang: locale,
    path: "/services",
    title: dict.servicesPage.title,
    description: s.intro || dict.servicesPage.eyebrow,
    image: "/images/wp/2026_03_PRECISION-GROWING.jpg",
  });
}

export default async function ServicesPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const s = getServiceStrings(lang);
  const services = getManualServices(lang);

  const byGroup = (group: string) =>
    services.filter((svc) => getServiceTheme(svc.slug).group === group);

  // Năm dịch vụ Flora trong lưới 2 cột để lại một thẻ mồ côi ở hàng cuối, nên
  // thẻ đầu chạy full-width dạng feature và bốn thẻ còn lại xếp 2×2.
  const [floraLead, ...floraRest] = byGroup("flora");
  const voac = byGroup("voac");
  const portfolio = byGroup("voac-portfolio");

  const shared = (svc: (typeof services)[number]) => ({
    slug: svc.slug,
    title: svc.title,
    excerpt: getServiceTagline(lang, svc.slug) ?? svc.excerpt,
    label: serviceLabel(dict, svc.slug),
    index: serviceIndex(svc.slug),
    lang,
    readMore: dict.common.readMore,
  });

  return (
    <>
      <PageHero
        eyebrow={dict.servicesPage.eyebrow}
        title={dict.servicesPage.title}
        image="/images/wp/2026_03_PRECISION-GROWING.jpg"
        homeHref={withLocale(lang, "/")}
        crumbs={[{ href: withLocale(lang, "/services"), label: dict.servicesPage.title }]}
      />

      <div className="container-page section-y space-y-20">
        <p className="mx-auto max-w-3xl text-center text-[1.15rem] leading-relaxed text-[var(--muted)]">
          {s.intro}
        </p>

        <section>
          <SectionHead n="01" title={s.divisionFlora} note={s.divisionFloraNote} />
          <div className="space-y-8">
            {floraLead && (
              <Reveal>
                <ServiceCardFeature {...shared(floraLead)} cover={floraLead.cover} />
              </Reveal>
            )}
            <Reveal className="grid gap-8 md:grid-cols-2">
              {floraRest.map((svc) => (
                <ServiceCardLarge key={svc.slug} {...shared(svc)} cover={svc.cover} />
              ))}
            </Reveal>
          </div>
        </section>

        <section>
          <SectionHead n="02" title={s.divisionVoac} note={s.divisionVoacNote} />
          <Reveal className="grid gap-8 md:grid-cols-2">
            {voac.map((svc) => (
              <ServiceCardLarge key={svc.slug} {...shared(svc)} cover={svc.cover} />
            ))}
          </Reveal>
        </section>

        <section>
          <SectionHead n="03" title={s.divisionPortfolio} note={s.divisionPortfolioNote} />
          {/* Năm mục — lưới nào cũng lẻ hàng, nên xếp thành danh sách ngang.
              Cũng phân biệt được đây là tài sản của VOAC, không phải dịch vụ bán. */}
          <Reveal className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {portfolio.map((svc) => (
              <ServiceRow key={svc.slug} {...shared(svc)} />
            ))}
          </Reveal>
        </section>
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
