import { Fragment } from "react";
import { VIDEOS, videosForTopic, videoThumbnail } from "@/lib/data/videos";
import { withLocale, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { LocalizedArticle } from "@/lib/i18n/localized-content";
import { NEWS_CATEGORIES } from "@/lib/legacy";
import { coverFor } from "@/lib/media";
import { formatNewsDate } from "@/lib/news-format";
import { AdSlot } from "./ad-slot";
import { LeadStory, RowStory, StoryCard, TextStory, VideoCard, type Story } from "./cards";
import { NewsletterSignup } from "./newsletter";
import { ListingShell } from "./shells";
import { Pagination, SectionHeader } from "./ui";

export const LIST_PAGE_SIZE = 10;
/** Số bài trang 1 dùng cho khối tin nổi bật (5) và lưới 4 thẻ phía trên danh sách. */
const TOP_COUNT = 5;
const GRID_COUNT = 4;

export function listPageCount(total: number): number {
  return Math.max(1, Math.ceil(Math.max(0, total - TOP_COUNT - GRID_COUNT) / LIST_PAGE_SIZE));
}

/**
 * Trang chuyên mục Kiến thức kiểu báo (document/flora-design-handoff/pages/
 * kien-thuc-phan-bon.html). `category = null` là trang /knowledge tổng.
 * Trang 2 trở đi chỉ còn danh sách "Mới nhất" và phân trang.
 */
export function KnowledgeListing({
  lang,
  dict,
  category,
  posts,
  page,
}: {
  lang: Locale;
  dict: Dictionary;
  category: (typeof NEWS_CATEGORIES)[number]["slug"] | null;
  posts: LocalizedArticle[];
  page: number;
}) {
  const n = dict.news;
  const base = category ? `/knowledge/category/${category}` : "/knowledge";
  const title = category ? dict.newsCategories[category] : dict.newsPage.title;

  const toStory = (p: LocalizedArticle, withCategory = !category): Story => {
    const cat = p.category ?? p.categories?.[0] ?? null;
    return {
      href: withLocale(lang, `/knowledge/${p.slug}`),
      title: p.title,
      excerpt: p.excerpt,
      image: coverFor({ cover: p.cover, category: cat }),
      meta: [
        formatNewsDate(p.date, lang),
        withCategory && cat && cat in dict.newsCategories
          ? dict.newsCategories[cat as keyof typeof dict.newsCategories]
          : null,
      ],
    };
  };

  const top = page === 1 ? posts.slice(0, TOP_COUNT) : [];
  const grid = page === 1 ? posts.slice(TOP_COUNT, TOP_COUNT + GRID_COUNT) : [];
  const rest = posts.slice(TOP_COUNT + GRID_COUNT);
  const pages = listPageCount(posts.length);
  const list = rest.slice((page - 1) * LIST_PAGE_SIZE, page * LIST_PAGE_SIZE);
  const [lead, ...sides] = top;
  const videos = category ? videosForTopic(category, 4) : VIDEOS.filter((v) => v.kind === "howto").slice(0, 4);

  return (
    <ListingShell
      navLabel={n.mainNav}
      band={{
        title: dict.newsPage.title,
        href: withLocale(lang, "/knowledge"),
        items: NEWS_CATEGORIES.map((c) => ({
          href: withLocale(lang, `/knowledge/category/${c.slug}`),
          label: dict.newsCategories[c.slug],
          active: c.slug === category,
        })),
      }}
      ad={<AdSlot ad="ashFertilizer" size="leaderboard" tone="dark" lang={lang} dict={dict} />}
      title={title}
    >
      {posts.length === 0 && <p className="text-muted">{n.empty}</p>}

      {lead && (
        <section aria-label={title} className="grid items-start gap-6 md:grid-cols-2 lg:grid-cols-[1fr_2fr_1fr]">
          <div className="md:col-span-2 lg:order-2 lg:col-span-1">
            <LeadStory story={toStory(lead)} preload centered />
          </div>
          {[sides.slice(0, 2), sides.slice(2, 4)].map((col, ci) =>
            col.length ? (
              <div key={ci} className={`flex flex-col gap-4 ${ci === 0 ? "lg:order-1" : "lg:order-3"}`}>
                {col.map((p, i) => (
                  <TextStory
                    key={p.slug}
                    story={toStory(p)}
                    className={i === 0 && col.length > 1 ? "border-b border-rule pb-4" : ""}
                  />
                ))}
              </div>
            ) : null,
          )}
        </section>
      )}

      {page === 1 && posts.length > 0 && (
        <AdSlot ad="chickenManure" size="mpu" tone="cream" lang={lang} dict={dict} className="mt-9" />
      )}

      {grid.length > 0 && (
        <section aria-labelledby="k-more" className="mt-9">
          <SectionHeader id="k-more" title={n.featured} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {grid.map((p) => (
              <StoryCard key={p.slug} story={toStory(p)} />
            ))}
          </div>
        </section>
      )}

      {page === 1 && videos.length > 0 && (
        <section aria-labelledby="k-video" className="mt-9 bg-dark px-5 pb-6 pt-5 text-white">
          <SectionHeader id="k-video" title={n.watchVideos} href={withLocale(lang, "/video")} onDark />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {videos.map((v) => (
              <VideoCard
                key={v.id}
                href={withLocale(lang, `/video/${v.id}`)}
                title={v.title}
                image={videoThumbnail(v)}
                meta={[v.source]}
                onDark
              />
            ))}
          </div>
        </section>
      )}

      {page === 1 && posts.length > 0 && (
        <div className="mt-9">
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
      )}

      {list.length > 0 && (
        <section aria-labelledby="k-latest" className="mt-9">
          <SectionHeader id="k-latest" title={n.latestList} />
          <div className="mx-auto flex max-w-[920px] flex-col">
            {list.map((p, i) => {
              const story = toStory(p);
              const [date, ...meta] = story.meta ?? [];
              return (
                <Fragment key={p.slug}>
                  <RowStory story={{ ...story, meta }} date={date ?? ""} />
                  {i === 2 && list.length > 4 && (
                    <AdSlot ad="voacInputs" size="leaderboard" tone="light" lang={lang} dict={dict} className="my-5" />
                  )}
                </Fragment>
              );
            })}
            <Pagination
              page={page}
              pages={pages}
              hrefFor={(p) => withLocale(lang, p === 1 ? base : `${base}/page/${p}`)}
              label={n.pagination}
              prevLabel={n.prevPage}
              nextLabel={n.nextPage}
            />
          </div>
        </section>
      )}
    </ListingShell>
  );
}
