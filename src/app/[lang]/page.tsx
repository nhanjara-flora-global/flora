import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { HeroSlider } from "@/components/hero-slider";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/catalog";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/legacy";
import { getLocalizedPosts } from "@/lib/i18n/localized-content";
import { localizeProducts } from "@/lib/i18n/localized-catalog";
import { pageSeo } from "@/lib/seo";

// Plain photography, not pre-composed WordPress banner artwork — the old
// banners had their own baked-in headline text, which collided with the
// HeroSlider text overlay added for the homepage rebuild (see document/REEDIT.txt).
const SLIDES = [
  {
    src: "/images/home/hero-greenhouse.jpg",
    alt: "Greenhouse growing vegetables on a farm",
  },
];

const PILLAR_HREFS = [
  "/solutions/premium-agricultural-inputs-the-japanese-foundation",
  "/solutions/farming-precision-cultivation-the-honey-no-9-legacy",
  "/solutions/organic-certification-global-compliance-solutions",
  "/solutions/the-export-logistic-chain-precision-velocity-thermal-integrity",
] as const;

const PILLAR_IMAGES = [
  "/images/wp/2026_03_ELITE.jpg",
  "/images/wp/2026_03_PRECISION-GROWING.jpg",
  "/images/wp/2025_09_tuvanthietke.jpg",
  "/images/wp/2025_09_quanlyduan.jpg",
] as const;

// "Who we serve" entry points — each routes to the section of the site that
// actually answers that persona's question, not a generic contact form.
const WHO_CARDS = [
  { href: "/solutions#precision-farming" },
  { href: "/solutions#sourcing" },
  { href: "/ecosystem" },
] as const;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  return pageSeo({
    lang,
    path: "/",
    title: dict.meta.title,
    titleAbsolute: true,
    description: dict.meta.description,
    image: SLIDES[0].src,
  });
}

export default async function HomePage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const h = dict.home;
  const [rawProducts, posts] = await Promise.all([
    getProducts(),
    getLocalizedPosts(lang),
  ]);
  const products = localizeProducts(rawProducts, lang);

  return (
    <>
      <HeroSlider slides={SLIDES}>
        <div className="ml-auto max-w-2xl lg:mr-[calc(-1*max(0px,(100vw_-_88rem)/2)_-_2.5rem)] rounded-[var(--radius-card)] bg-white p-6 text-[var(--ink)] shadow-[var(--shadow-lift)] md:p-9">
          <p className="eyebrow text-[var(--brand)]">{h.heroEyebrow}</p>
          <h1 className="display-lg mt-3 text-[var(--ink)]">{h.heroTitle}</h1>
          <p className="lead mt-4 max-w-xl text-[var(--muted)]">{h.heroSubtitle}</p>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link
              href={withLocale(lang, "/ecosystem")}
              className="body-sm rounded-[var(--radius-control)] bg-[var(--brand)] px-6 py-3 font-semibold uppercase tracking-wide text-white shadow-[var(--shadow-soft)] transition hover:brightness-110"
            >
              {h.heroCta1}
            </Link>
            <Link
              href={withLocale(lang, "/products")}
              className="body-sm rounded-[var(--radius-control)] border-2 border-[var(--brand)] px-6 py-3 font-semibold uppercase tracking-wide text-[var(--brand)] transition hover:bg-[var(--brand)]/10"
            >
              {h.heroCta2}
            </Link>
          </div>
        </div>
      </HeroSlider>

      <section className="container-page section-y">
        <div className="space-y-16 md:space-y-20">
          {h.pillars.map((pillar, i) => (
            <div
              key={pillar.title}
              className="grid items-center gap-8 md:grid-cols-2 md:gap-14"
            >
              <div className={i % 2 === 1 ? "md:order-2" : undefined}>
                <p className="eyebrow text-[var(--brand)]">{pillar.eyebrow}</p>
                <h2 className="display-lg mt-3">{pillar.title}</h2>
                <p className="body-base mt-4 text-[var(--muted)]">{pillar.body}</p>
                <Link
                  href={withLocale(lang, PILLAR_HREFS[i])}
                  className="body-sm mt-6 inline-block border-b-2 border-[var(--brand)] pb-1 font-semibold uppercase tracking-wide text-[var(--brand)]"
                >
                  {h.learnMore}
                </Link>
              </div>
              <Link
                href={withLocale(lang, PILLAR_HREFS[i])}
                className={`card card-interactive group relative block aspect-[4/3] ${
                  i % 2 === 1 ? "md:order-1" : ""
                }`}
              >
                <Image
                  src={PILLAR_IMAGES[i]}
                  alt={pillar.title}
                  fill
                  sizes="(max-width:768px) 100vw, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--bg-soft)]">
        <Reveal className="container-page section-y">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="display-md text-[var(--brand)]">
              {h.ecosystemTitle}
              <br />
              {h.ecosystemSubtitle}
            </h2>
            <p className="body-base mt-6 text-left text-[var(--muted)] md:text-justify">{h.ecosystemP1}</p>
            <p className="body-base mt-4 text-left text-[var(--muted)] md:text-justify">{h.ecosystemP2}</p>
            <Link
              href={withLocale(lang, "/about-us")}
              className="body-sm mt-8 inline-block rounded-[var(--radius-control)] bg-[var(--accent)] px-7 py-3 font-semibold uppercase tracking-wide text-white shadow-[var(--shadow-soft)] transition hover:brightness-110"
            >
              {h.aboutCta}
            </Link>

            <figure className="mt-12">
              <div className="relative mx-auto aspect-square w-44 overflow-hidden rounded-full shadow-[var(--shadow-soft)] ring-4 ring-white md:w-56">
                <Image
                  src="/images/wp/2025_09_thuyhoa.jpg"
                  alt={h.ceoCaption}
                  fill
                  sizes="224px"
                  className="object-cover"
                />
              </div>
              <figcaption className="body-sm mt-4 text-[var(--muted)]">{h.ceoCaption}</figcaption>
            </figure>
          </div>
        </Reveal>
      </section>

      <section className="container-page section-y">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-[var(--brand)]">{h.whoEyebrow}</p>
          <h2 className="display-lg mt-3">{h.whoTitle}</h2>
        </div>
        <Reveal className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { ...WHO_CARDS[0], title: h.whoFarmerTitle, body: h.whoFarmerBody, cta: h.whoFarmerCta },
            { ...WHO_CARDS[1], title: h.whoBuyerTitle, body: h.whoBuyerBody, cta: h.whoBuyerCta },
            { ...WHO_CARDS[2], title: h.whoPartnerTitle, body: h.whoPartnerBody, cta: h.whoPartnerCta },
          ].map((card) => (
            <Link
              key={card.href}
              href={withLocale(lang, card.href)}
              className="card card-interactive group flex flex-col p-8"
            >
              <h3 className="display-sm text-[var(--ink)] transition-colors group-hover:text-[var(--brand)]">
                {card.title}
              </h3>
              <p className="body-sm mt-3 flex-1 text-[var(--muted)]">{card.body}</p>
              <span className="body-sm mt-6 font-semibold uppercase tracking-wide text-[var(--brand)]">
                {card.cta} →
              </span>
            </Link>
          ))}
        </Reveal>
      </section>

      {products.length > 0 && (
        <section className="container-page section-y">
          <SectionHead
            eyebrow={h.catalogEyebrow}
            title={h.productsTitle}
            href={withLocale(lang, "/products")}
            cta={h.allProducts}
          />
          <Reveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                href={withLocale(lang, `/products/${p.slug}`)}
                organicLabel={dict.common.organic}
              />
            ))}
          </Reveal>
        </section>
      )}

      <section className="bg-[var(--bg-soft)]">
        <div className="container-page section-y">
          <SectionHead
            eyebrow={h.blogEyebrow}
            title={h.newsTitle}
            href={withLocale(lang, "/knowledge")}
            cta={h.allNews}
          />
          <Reveal className="grid gap-6 md:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={withLocale(lang, `/knowledge/${post.slug}`)}
                className="card card-interactive group flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-soft)]">
                  {post.cover ? (
                    <Image
                      src={post.cover}
                      alt={post.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(145deg,#dce8d4_0%,#b7c9a5_45%,#6f8f5a_100%)]" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <time className="meta uppercase text-[var(--muted)]">
                    {formatDate(post.date)}
                  </time>
                  <h3 className="display-sm mt-2 transition-colors group-hover:text-[var(--brand)]">
                    {post.title}
                  </h3>
                  <p className="body-sm mt-3 line-clamp-3 text-[var(--muted)]">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}

function SectionHead({
  eyebrow,
  title,
  href,
  cta,
}: {
  eyebrow: string;
  title: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div>
        <p className="eyebrow text-[var(--brand)]">{eyebrow}</p>
        <h2 className="display-lg mt-2">{title}</h2>
      </div>
      <Link
        href={href}
        className="body-sm shrink-0 font-semibold text-[var(--brand)] hover:underline"
      >
        {cta} →
      </Link>
    </div>
  );
}
