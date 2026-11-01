import type { Metadata } from "next";
import Link from "next/link";
import { AdBand, AdCreative, AdSlot, anyAdVisible } from "@/components/news/ad-slot";
import { FieldStoryBanner, HomeStrip } from "@/components/news/banners";
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
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import {
  getLocalizedPosts,
  getManualPage,
  type LocalizedArticle,
} from "@/lib/i18n/localized-content";
import { localizeProducts } from "@/lib/i18n/localized-catalog";
import { PRODUCT_FALLBACK_IMAGE, coverFor } from "@/lib/media";
import { categoryLabeler, categoryName, getNewsCategories } from "@/lib/news-categories";
import { formatNewsDate, localHref, serviceHref } from "@/lib/news-format";
import { pageSeo } from "@/lib/seo";
import { getSlot, type ResolvedSlot } from "@/lib/site-slots";
import { servicesByCluster } from "@/lib/services/service-theme";

// Trang chủ hiện bài mới nhất và "x giờ trước" — làm mới sau tối đa 5 phút.
export const revalidate = 300;

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
    image: (await getSlot("home-lead", lang)).image,
  });
}

export default async function HomePage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const h = dict.home;
  const n = dict.news;
  const [rawProducts, posts, newsCategories, strip, lead, side1, side2, fieldStory, showAdPair] = await Promise.all([
    getProducts(),
    getLocalizedPosts(lang),
    getNewsCategories(),
    getSlot("home-strip", lang),
    getSlot("home-lead", lang),
    getSlot("home-side-1", lang),
    getSlot("home-side-2", lang),
    getSlot("field-story", lang),
    anyAdVisible(["sourcing", "lotus"], lang),
  ]);
  const products = localizeProducts(rawProducts, lang);
  const clusters = servicesByCluster();

  const categoryOf = (p: LocalizedArticle) => p.category ?? p.categories?.[0] ?? null;
  const catLabel = categoryLabeler(newsCategories, lang);
  const categoryLabel = (p: LocalizedArticle) => catLabel(categoryOf(p));
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
  const columns = newsCategories.map((c) => ({
    category: c,
    posts: take(4, (p) => (p.categories ?? []).includes(c.slug)),
  })).filter((col) => col.posts.length > 0);
  const recommended = take(10);

  const service = (slug: string) => getManualPage(slug, lang);
  // Banner sửa trong /admin/banners: nhãn hiện ở dòng meta dưới bài.
  const bannerStory = (b: ResolvedSlot): Story => ({
    href: localHref(lang, b.href),
    title: b.copy.title,
    excerpt: b.copy.body,
    image: b.image,
    meta: [b.copy.eyebrow],
  });
  const sourcing = service(SOURCING_SLUG);
  const voacInputs = service(VOAC_INPUTS_SLUG);

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-4">
      <h1 className="sr-only">{dict.meta.title}</h1>

      <HomeStrip slot={strip} lang={lang} />

      {/* Tin nổi bật: 2 tin có ảnh | tin chính | danh sách chữ. */}
      <section aria-label={n.latest} className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-[1fr_2fr_1fr]">
        <div className="order-2 flex flex-col gap-4 max-md:border-t max-md:border-rule max-md:pt-4 lg:order-1">
          <StoryCard story={bannerStory(side1)} size="lg" mobileRow />
          <div className="border-t border-rule pt-4">
            <StoryCard story={bannerStory(side2)} size="lg" mobileRow />
          </div>
        </div>
        <div className="order-1 md:col-span-2 lg:order-2 lg:col-span-1">
          <LeadStory preload story={bannerStory(lead)} />
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
            {/* Điện thoại: ảnh lên trước chữ, như mọi thẻ khác (không thì ảnh trông như của tin bên dưới). */}
            <article className="group relative grid gap-2.5 md:grid-cols-[2fr_3fr] md:gap-5">
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-2xl font-bold leading-tight">
                  <Link href={toStory(latest[0]).href} className="after:absolute after:inset-0 group-hover:underline">
                    {latest[0].title}
                  </Link>
                </h3>
                <p className="text-[15px] leading-[1.55] text-ink-2 md:text-sm">{latest[0].excerpt}</p>
                <Meta parts={toStory(latest[0]).meta ?? []} />
              </div>
              <Media
                src={toStory(latest[0]).image}
                alt=""
                ratio="16/10"
                sizes="(max-width:768px) 100vw, 45vw"
                className="order-first md:order-none"
              />
            </article>
            <StoryCard story={toStory(latest[1])} size="lg" mobileRow />
          </div>
          {latest.length >= 6 && (
            <div className="grid gap-5 border-b border-rule py-5 sm:grid-cols-2 lg:grid-cols-4">
              {latest.slice(2, 6).map((p) => (
                <StoryCard key={p.slug} story={toStory(p)} mobileRow />
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
        <SectionHeader id="s-story" title={n.fieldStory} href={localHref(lang, fieldStory.href)} />
        <FieldStoryBanner slot={fieldStory} lang={lang} />
      </section>

      {showAdPair && (
        <AdBand className="mt-10">
          <div className="flex flex-wrap justify-center gap-4">
            <AdCreative ad="sourcing" size="mpu" tone="image" lang={lang} dict={dict} />
            <AdCreative ad="lotus" size="mpu" tone="primary" lang={lang} dict={dict} />
          </div>
        </AdBand>
      )}

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
                mobileRow
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
                mobileRow
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
                  title={categoryName(category, lang)}
                  href={withLocale(lang, `/knowledge/category/${category.slug}`)}
                />
                <StoryCard story={{ ...toStory(lead), meta: [] }} excerpt={false} size="lg" />
                <ul className="mt-3">
                  {rest.map((p) => (
                    <li key={p.slug} className="border-t border-rule">
                      <Link
                        href={toStory(p).href}
                        className="block py-2.5 font-serif text-base font-bold leading-[1.35] hover:underline md:text-sm"
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
              <p className="text-[15px] leading-normal text-ink-2 md:text-[13px]">{card.body}</p>
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
