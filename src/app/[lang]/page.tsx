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

const SLIDES = [
  {
    src: "/images/wp/2025_09_banner1-1.jpg",
    alt: "Organic certification consultation — USDA, EU Organic, JAS",
  },
  {
    src: "/images/wp/2025_09_banner22.jpg",
    alt: "Flora Global — Honey No. 9 passion fruit",
  },
];

const PILLAR_HREFS = [
  "/services/premium-agricultural-inputs-the-japanese-foundation",
  "/services/farming-precision-cultivation-the-honey-no-9-legacy",
  "/services/organic-certification-global-compliance-solutions",
  "/services/the-export-logistic-chain-precision-velocity-thermal-integrity",
] as const;

const PILLAR_IMAGES = [
  "/images/wp/2026_03_ELITE.jpg",
  "/images/wp/2026_03_PRECISION-GROWING.jpg",
  "/images/wp/2025_09_tuvanthietke.jpg",
  "/images/wp/2025_09_quanlyduan.jpg",
] as const;

type Props = { params: Promise<{ lang: string }> };

export default async function HomePage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const h = dict.home;
  const [rawProducts, posts] = await Promise.all([
    getProducts(),
    Promise.resolve(getLocalizedPosts(lang)),
  ]);
  const products = localizeProducts(rawProducts, lang);

  return (
    <>
      <HeroSlider slides={SLIDES} />

      <section className="container-page section-y">
        <Reveal className="space-y-16 md:space-y-20">
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
        </Reveal>
      </section>

      <section className="bg-[var(--bg-soft)]">
        <Reveal className="section-y mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="display-md text-[var(--brand)]">
            {h.ecosystemTitle}
            <br />
            {h.ecosystemSubtitle}
          </h2>
          <p className="body-base mt-6 text-justify text-[var(--muted)]">{h.ecosystemP1}</p>
          <p className="body-base mt-4 text-justify text-[var(--muted)]">{h.ecosystemP2}</p>
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
                priceOnRequestLabel={dict.common.priceOnRequest}
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
            href={withLocale(lang, "/news")}
            cta={h.allNews}
          />
          <Reveal className="grid gap-6 md:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={withLocale(lang, `/news/${post.slug}`)}
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
    <div className="mb-8 flex items-end justify-between gap-4">
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
