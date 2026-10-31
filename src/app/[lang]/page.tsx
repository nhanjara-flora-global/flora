import type { Metadata } from "next";
import Link from "next/link";
import { AdBand, AdCreative, AdSlot } from "@/components/news/ad-slot";
import {
  FeatureStory,
  LeadStory,
  ProductTile,
  StoryCard,
  TextStory,
  ThumbStory,
  VideoCard,
  type Story,
} from "@/components/news/cards";
import { Carousel, CarouselItem } from "@/components/news/carousel";
import { Media } from "@/components/news/media";
import { NewsletterSignup } from "@/components/news/newsletter";
import { Meta, RankedList, SectionHeader } from "@/components/news/ui";
import { getProducts } from "@/lib/catalog";
import { VIDEOS, videoThumbnail } from "@/lib/data/videos";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale, type Locale } from "@/lib/i18n/config";
import {
  getLocalizedPosts,
  getManualPage,
  type LocalizedArticle,
} from "@/lib/i18n/localized-content";
import { localizeProducts } from "@/lib/i18n/localized-catalog";
import { NEWS_CATEGORIES } from "@/lib/legacy";
import { PRODUCT_FALLBACK_IMAGE, coverFor } from "@/lib/media";
import { formatNewsDate, serviceHref } from "@/lib/news-format";
import { pageSeo } from "@/lib/seo";
import { servicesByCluster } from "@/lib/services/service-theme";

// Trang chủ hiện bài mới nhất và "x giờ trước" — làm mới sau tối đa 5 phút.
export const revalidate = 300;

const HERO_IMAGE = "/images/home/hero-greenhouse.jpg";

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

/** Bài nền tảng cho khối "Kiến thức nổi bật"; slug nào không còn thì lấy bài kế tiếp. */
const FEATURED_SLUGS = [
  "phan-bon-huu-co-phan-loai-cach-u-hoai-va-nguyen-tac-su-dung",
  "tong-quan-cac-tieu-chuan-huu-co-quoc-te-usda-organic-eu-organic-va-jas",
];

const SOURCING_SLUG = "strategic-sourcing-procurement-your-bridge-to-vietnam";
const VOAC_INPUTS_SLUG = "voac-nguyen-lieu-nong-nghiep-huu-co-voac";

// "Who we serve" — mỗi nhóm khách tới đúng phần trả lời câu hỏi của họ.
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
    image: HERO_IMAGE,
  });
}

/** Tiêu đề trụ cột trong từ điển viết HOA toàn bộ — đổi về kiểu câu cho tiêu đề báo. */
function sentenceCase(text: string, locale: Locale): string {
  if (text !== text.toLocaleUpperCase(locale)) return text;
  const lower = text.toLocaleLowerCase(locale);
  return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
}

export default async function HomePage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const h = dict.home;
  const n = dict.news;
  const [rawProducts, posts] = await Promise.all([getProducts(), getLocalizedPosts(lang)]);
  const products = localizeProducts(rawProducts, lang);
  const clusters = servicesByCluster();

  const categoryOf = (p: LocalizedArticle) => p.category ?? p.categories?.[0] ?? null;
  const categoryLabel = (p: LocalizedArticle) => {
    const c = categoryOf(p);
    return c && c in dict.newsCategories
      ? dict.newsCategories[c as keyof typeof dict.newsCategories]
      : null;
  };
  const toStory = (p: LocalizedArticle): Story => ({
    href: withLocale(lang, `/knowledge/${p.slug}`),
    title: p.title,
    excerpt: p.excerpt,
    image: coverFor({ cover: p.cover, category: categoryOf(p) }),
    meta: [formatNewsDate(p.date, lang), categoryLabel(p)],
  });

  // Mỗi bài chỉ xuất hiện một lần trên trang; khối nào thiếu bài thì tự ẩn.
  const used = new Set<string>();
  const take = (count: number, filter: (p: LocalizedArticle) => boolean = () => true) => {
    const picked = posts.filter((p) => !used.has(p.slug) && filter(p)).slice(0, count);
    for (const p of picked) used.add(p.slug);
    return picked;
  };

  const topList = take(6);
  const featured = [
    ...FEATURED_SLUGS.map((slug) => posts.find((p) => p.slug === slug)).filter(
      (p): p is LocalizedArticle => !!p && !used.has(p.slug),
    ),
  ];
  for (const p of featured) used.add(p.slug);
  featured.push(...take(2 - featured.length));
  const latest = take(10);
  const columns = NEWS_CATEGORIES.map((c) => ({
    category: c,
    posts: take(4, (p) => (p.categories ?? []).includes(c.slug)),
  })).filter((col) => col.posts.length > 0);
  const recommended = take(10);

  const service = (slug: string) => getManualPage(slug, lang);
  const pillarStory = (i: 0 | 3, label: string): Story => ({
    href: withLocale(lang, PILLAR_HREFS[i]),
    title: sentenceCase(h.pillars[i].title, lang),
    excerpt: h.pillars[i].body,
    image: PILLAR_IMAGES[i],
    meta: [label],
  });
  const sourcing = service(SOURCING_SLUG);
  const voacInputs = service(VOAC_INPUTS_SLUG);

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-4">
      <h1 className="sr-only">{dict.meta.title}</h1>

      <Link
        href={withLocale(lang, "/ecosystem")}
        className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-primary px-5 py-3 text-white"
      >
        <span className="text-[13px] font-extrabold uppercase tracking-[0.5px]">{h.heroEyebrow}</span>
        <span className="flex-[1_1_240px] text-sm">{n.ecosystemStrip}</span>
        <span className="bg-harvest px-3 py-1.5 text-[13px] font-bold">{n.explore}</span>
      </Link>

      {/* Tin nổi bật: 2 tin có ảnh | tin chính | danh sách chữ. */}
      <section aria-label={n.latest} className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-[1fr_2fr_1fr]">
        <div className="order-2 flex flex-col gap-4 lg:order-1">
          <StoryCard story={pillarStory(0, dict.nav.services)} size="lg" />
          <div className="border-t border-rule pt-4">
            <StoryCard story={pillarStory(3, dict.nav.export)} size="lg" />
          </div>
        </div>
        <div className="order-1 md:col-span-2 lg:order-2 lg:col-span-1">
          <LeadStory
            preload
            story={{
              href: withLocale(lang, "/ecosystem"),
              title: h.heroTitle,
              excerpt: h.heroSubtitle,
              image: HERO_IMAGE,
              meta: [dict.nav.ecosystem],
            }}
          />
        </div>
        {topList.length > 0 && (
          <div className="order-3 flex flex-col">
            {topList.slice(0, 4).map((p, i) => (
              <TextStory
                key={p.slug}
                story={toStory(p)}
                excerpt={i < 2}
                className={`border-b border-rule ${i === 0 ? "pb-3.5" : "py-3.5"}`}
              />
            ))}
            {topList[4] && (
              <ThumbStory story={toStory(topList[4])} className="border-b border-rule py-3.5" />
            )}
            {topList[5] && <TextStory story={toStory(topList[5])} size="sm" excerpt={false} className="py-3.5" />}
          </div>
        )}
      </section>

      <AdSlot ad="certification" size="leaderboard" tone="cream" lang={lang} dict={dict} className="mt-10" />

      {latest.length >= 2 && (
        <section aria-labelledby="s-latest" className="mt-10">
          <SectionHeader id="s-latest" title={n.latest} href={withLocale(lang, "/knowledge")} />
          <div className="grid gap-5 border-b border-rule pb-5 lg:grid-cols-[3fr_1fr]">
            <article className="group relative grid gap-5 md:grid-cols-[2fr_3fr]">
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-2xl font-bold leading-tight">
                  <Link href={toStory(latest[0]).href} className="after:absolute after:inset-0 group-hover:underline">
                    {latest[0].title}
                  </Link>
                </h3>
                <p className="text-sm leading-[1.55] text-ink-2">{latest[0].excerpt}</p>
                <Meta parts={toStory(latest[0]).meta ?? []} />
              </div>
              <Media src={toStory(latest[0]).image} alt="" ratio="16/10" sizes="(max-width:768px) 100vw, 45vw" />
            </article>
            <StoryCard story={toStory(latest[1])} size="lg" />
          </div>
          {latest.length >= 6 && (
            <div className="grid gap-5 border-b border-rule py-5 sm:grid-cols-2 lg:grid-cols-4">
              {latest.slice(2, 6).map((p) => (
                <StoryCard key={p.slug} story={toStory(p)} />
              ))}
            </div>
          )}
          {latest.length > 6 && (
            <div className="grid gap-5 pt-4 sm:grid-cols-2 lg:grid-cols-4">
              {latest.slice(6, 10).map((p) => (
                <TextStory key={p.slug} story={toStory(p)} size="sm" excerpt={false} />
              ))}
            </div>
          )}
        </section>
      )}

      {featured.length > 0 && (
        <section aria-labelledby="s-featured" className="mt-10">
          <SectionHeader id="s-featured" title={n.featured} href={withLocale(lang, "/knowledge")} />
          <div className="grid gap-5 md:grid-cols-2">
            {featured.map((p) => (
              <StoryCard key={p.slug} story={toStory(p)} size="xl" sizes="(max-width:768px) 100vw, 50vw" />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="s-story" className="mt-10">
        <SectionHeader id="s-story" title={n.fieldStory} href={withLocale(lang, PILLAR_HREFS[1])} />
        <div className="flex flex-wrap bg-dark text-white">
          <Media
            src={PILLAR_IMAGES[1]}
            alt={n.honeyTitle}
            ratio=""
            sizes="(max-width:768px) 100vw, 60vw"
            className="min-h-[240px] flex-[3_1_480px] md:min-h-[320px]"
          />
          <div className="flex flex-[2_1_300px] flex-col justify-center gap-3 p-6 md:p-8">
            <h3 className="font-serif text-2xl font-bold leading-[1.2] md:text-[28px]">{n.honeyTitle}</h3>
            <p className="text-sm leading-relaxed text-[#d5ded7]">{h.pillars[1].body}</p>
            <Link
              href={withLocale(lang, PILLAR_HREFS[1])}
              className="self-start bg-white px-3.5 py-2 text-[13px] font-bold text-ink hover:bg-[#e8e8e8]"
            >
              {n.readMore}
            </Link>
          </div>
        </div>
      </section>

      <AdBand label={n.ad} className="mt-10">
        <div className="flex flex-wrap justify-center gap-4">
          <AdCreative ad="sourcing" size="mpu" tone="image" lang={lang} dict={dict} />
          <AdCreative ad="lotus" size="mpu" tone="primary" lang={lang} dict={dict} />
        </div>
      </AdBand>

      {products.length > 0 && (
        <section className="mt-10">
          <Carousel
            title={h.productsTitle}
            href={withLocale(lang, "/products")}
            prevLabel={n.prev}
            nextLabel={n.next}
          >
            {products.map((p) => {
              const fallback = PRODUCT_FALLBACK_IMAGE[p.slug];
              return (
                <CarouselItem key={p.id}>
                  <ProductTile
                    href={withLocale(lang, `/products/${p.slug}`)}
                    name={p.name}
                    label={dict.common.organic}
                    image={p.image_url ?? fallback?.src ?? null}
                    imageTitle={p.image_url ? undefined : fallback && n.photo.replace("{credit}", fallback.credit)}
                    note={n.quote}
                  />
                </CarouselItem>
              );
            })}
            {voacInputs && (
              <CarouselItem>
                <ProductTile
                  href={serviceHref(lang, VOAC_INPUTS_SLUG)}
                  name={voacInputs.title}
                  label="VOAC"
                  image={voacInputs.cover}
                  note={dict.nav.services}
                />
              </CarouselItem>
            )}
          </Carousel>
        </section>
      )}

      <section className="mt-10">
        <Carousel
          title={n.videos}
          href={withLocale(lang, "/video")}
          prevLabel={n.prev}
          nextLabel={n.next}
          itemWidth={236}
        >
          {VIDEOS.slice(0, 8).map((v) => (
            <CarouselItem key={v.id}>
              <VideoCard
                href={withLocale(lang, `/video/${v.id}`)}
                title={v.title}
                image={videoThumbnail(v)}
                meta={[v.source, dict.newsCategories[v.topic]]}
              />
            </CarouselItem>
          ))}
        </Carousel>
      </section>

      <section aria-labelledby="s-eco" className="mt-10">
        <SectionHeader id="s-eco" title={dict.nav.ecosystem} href={withLocale(lang, "/ecosystem")} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {clusters.ecosystem.map((slug) => {
            const s = service(slug);
            if (!s) return null;
            return (
              <StoryCard
                key={slug}
                story={{ href: serviceHref(lang, slug), title: s.title, image: s.cover, meta: [dict.nav.ecosystem] }}
                excerpt={false}
              />
            );
          })}
        </div>
      </section>

      <section aria-labelledby="s-cert" className="mt-10 bg-dark px-5 pb-7 pt-5 text-white">
        <SectionHeader
          id="s-cert"
          title={dict.newsCategories["chung-nhan-tieu-chuan"]}
          href={`${withLocale(lang, "/solutions")}#certification`}
          onDark
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {clusters.certification.map((slug) => {
            const s = service(slug);
            if (!s) return null;
            return (
              <StoryCard
                key={slug}
                story={{ href: serviceHref(lang, slug), title: s.title, image: s.cover }}
                excerpt={false}
                onDark
              />
            );
          })}
        </div>
      </section>

      {columns.length > 0 && (
        <section aria-label={dict.nav.news} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {columns.map(({ category, posts: list }) => {
            const [lead, ...rest] = list;
            return (
              <div key={category.slug} className="flex flex-col">
                <SectionHeader
                  title={dict.newsCategories[category.slug]}
                  href={withLocale(lang, `/knowledge/category/${category.slug}`)}
                />
                <StoryCard story={{ ...toStory(lead), meta: [] }} excerpt={false} size="lg" />
                <ul className="mt-3">
                  {rest.map((p) => (
                    <li key={p.slug} className="border-t border-rule">
                      <Link
                        href={toStory(p).href}
                        className="block py-2.5 font-serif text-sm font-bold leading-[1.35] hover:underline"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}

      <div className="mt-10">
        <NewsletterSignup
          locale={lang}
          copy={{
            ad: n.ad,
            title: n.newsletterTitle,
            body: n.newsletterBody,
            email: n.newsletterEmail,
            submit: n.newsletterSubmit,
            done: n.newsletterDone,
            error: n.newsletterError,
          }}
        />
      </div>

      {recommended.length > 0 && (
        <section aria-labelledby="s-rec" className="mt-10">
          <SectionHeader id="s-rec" title={n.recommended} />
          <RankedList items={recommended.map((p) => ({ href: toStory(p).href, title: p.title }))} />
        </section>
      )}

      {sourcing && (
        <section aria-labelledby="s-sourcing" className="mt-10">
          <SectionHeader
            id="s-sourcing"
            title={n.ads.sourcing.eyebrow}
            href={serviceHref(lang, SOURCING_SLUG)}
          />
          <FeatureStory
            story={{
              href: serviceHref(lang, SOURCING_SLUG),
              title: sourcing.title,
              excerpt: h.whoBuyerBody,
              image: "/images/voac/voac-tim-nguon-core-sourcing.jpg",
            }}
            cta={h.whoBuyerCta}
          />
        </section>
      )}

      <section aria-labelledby="s-who" className="mt-10">
        <SectionHeader id="s-who" title={h.whoTitle} />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { ...WHO_CARDS[0], title: h.whoFarmerTitle, body: h.whoFarmerBody, cta: h.whoFarmerCta },
            { ...WHO_CARDS[1], title: h.whoBuyerTitle, body: h.whoBuyerBody, cta: h.whoBuyerCta },
            { ...WHO_CARDS[2], title: h.whoPartnerTitle, body: h.whoPartnerBody, cta: h.whoPartnerCta },
          ].map((card) => (
            <article key={card.href} className="flex flex-col gap-1.5 border-t-[3px] border-harvest pt-3">
              <h3 className="font-serif text-lg font-bold leading-[1.3]">{card.title}</h3>
              <p className="text-[13px] leading-normal text-ink-2">{card.body}</p>
              <Link href={withLocale(lang, card.href)} className="py-1 text-[13px] font-bold hover:underline">
                {card.cta} <span aria-hidden="true">›</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <AdSlot ad="partnerFarm" size="billboard" tone="light" reverse lang={lang} dict={dict} className="mt-10" />
    </div>
  );
}
