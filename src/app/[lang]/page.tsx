import Image from "next/image";
import Link from "next/link";
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

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="space-y-16 md:space-y-20">
          {h.pillars.map((pillar, i) => (
            <div
              key={pillar.title}
              className="grid items-center gap-8 md:grid-cols-2 md:gap-14"
            >
              <div className={i % 2 === 1 ? "md:order-2" : undefined}>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--brand)]">
                  {pillar.eyebrow}
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight md:text-4xl">
                  {pillar.title}
                </h2>
                <p className="mt-4 leading-relaxed text-[var(--muted)]">{pillar.body}</p>
                <Link
                  href={withLocale(lang, PILLAR_HREFS[i])}
                  className="mt-6 inline-block border-b-2 border-[var(--brand)] pb-1 text-sm font-semibold uppercase tracking-wide text-[var(--brand)]"
                >
                  {h.learnMore}
                </Link>
              </div>
              <Link
                href={withLocale(lang, PILLAR_HREFS[i])}
                className={`group relative block aspect-[4/3] overflow-hidden ${
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
        <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-snug text-[var(--brand)] md:text-3xl">
            {h.ecosystemTitle}
            <br />
            {h.ecosystemSubtitle}
          </h2>
          <p className="mt-6 text-justify leading-relaxed text-[var(--muted)]">{h.ecosystemP1}</p>
          <p className="mt-4 text-justify leading-relaxed text-[var(--muted)]">{h.ecosystemP2}</p>
          <Link
            href={withLocale(lang, "/about-us")}
            className="mt-8 inline-block bg-[var(--accent)] px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:brightness-110"
          >
            {h.aboutCta}
          </Link>

          <figure className="mt-12">
            <div className="relative mx-auto aspect-square w-44 overflow-hidden rounded-full ring-4 ring-white md:w-56">
              <Image
                src="/images/wp/2025_09_thuyhoa.jpg"
                alt={h.ceoCaption}
                fill
                sizes="224px"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-4 text-sm text-[var(--muted)]">{h.ceoCaption}</figcaption>
          </figure>
        </div>
      </section>

      {products.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <SectionHead
            eyebrow={h.catalogEyebrow}
            title={h.productsTitle}
            href={withLocale(lang, "/products")}
            cta={h.allProducts}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                href={withLocale(lang, `/products/${p.slug}`)}
                organicLabel={dict.common.organic}
                priceOnRequestLabel={dict.common.priceOnRequest}
              />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <SectionHead
            eyebrow={h.blogEyebrow}
            title={h.newsTitle}
            href={withLocale(lang, "/news")}
            cta={h.allNews}
          />
          <div className="grid gap-6 md:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={withLocale(lang, `/news/${post.slug}`)}
                className="group flex flex-col border border-[var(--line)] transition hover:border-[var(--brand)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-soft)]">
                  {post.cover && (
                    <Image
                      src={post.cover}
                      alt={post.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <time className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    {formatDate(post.date)}
                  </time>
                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold leading-snug group-hover:text-[var(--brand)]">
                    {post.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm text-[var(--muted)]">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
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
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--brand)]">{eyebrow}</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
          {title}
        </h2>
      </div>
      <Link href={href} className="text-sm font-semibold text-[var(--brand)] hover:underline">
        {cta} →
      </Link>
    </div>
  );
}
