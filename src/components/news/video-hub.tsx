import Link from "next/link";
import { VIDEOS, videoThumbnail, videoWatchUrl, type Video } from "@/lib/data/videos";
import { withLocale, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { fill, localHref } from "@/lib/news-format";
import { getSlot } from "@/lib/site-slots";
import { AdSlot } from "./ad-slot";
import { FieldStoryBanner } from "./banners";
import { VideoCard } from "./cards";
import { Media } from "./media";
import { SectionHeader } from "./ui";
import { VideoPlayer } from "./video-player";


/**
 * Trang Video (document/flora-design-handoff/pages/video.html). Video được
 * nhúng từ YouTube/TikTok — xem src/lib/data/videos.ts để thêm/bớt.
 */
export async function VideoHub({
  lang,
  dict,
  current,
}: {
  lang: Locale;
  dict: Dictionary;
  current: Video;
}) {
  const n = dict.news;
  const story = await getSlot("field-story", lang);
  const others = VIDEOS.filter((v) => v.id !== current.id);
  const upNext = others.slice(0, 5);
  const howto = others.filter((v) => v.kind === "howto" && !upNext.includes(v)).slice(0, 4);
  const certification = others
    .filter((v) => v.topic === "chung-nhan-tieu-chuan" && !upNext.includes(v) && !howto.includes(v))
    .slice(0, 4);
  const missed = others
    .filter((v) => !upNext.includes(v) && !howto.includes(v) && !certification.includes(v))
    .slice(0, 5);

  const card = (v: Video) => (
    <VideoCard
      key={v.id}
      href={withLocale(lang, `/video/${v.id}`)}
      title={v.title}
      image={videoThumbnail(v)}
      meta={[v.source, dict.newsCategories[v.topic]]}
      onDark
      sizes="(max-width:768px) 100vw, 25vw"
    />
  );
  const platform = current.platform === "youtube" ? "YouTube" : "TikTok";

  return (
    <div className="bg-video-bg text-white">
      <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-6">
        <h1 className="mb-5 text-center text-[28px] font-extrabold md:text-[30px]">{dict.nav.video}</h1>

        <section aria-label={current.title} className="flex flex-wrap gap-6">
          <article className="flex min-w-0 flex-[3_1_560px] flex-col gap-2.5">
            <VideoPlayer key={current.id} video={current} playLabel={fill(n.play, { title: current.title })} />
            <h2 className="mt-1 font-serif text-[22px] font-bold leading-tight md:text-[26px]">{current.title}</h2>
            <p className="text-sm text-on-dark">
              {fill(n.source, { source: current.source })}
              {current.duration && <> · {current.duration}</>}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={withLocale(lang, `/knowledge/category/${current.topic}`)}
                className="bg-[#24402e] px-2.5 py-1.5 text-xs hover:underline"
              >
                {dict.newsCategories[current.topic]}
              </Link>
              <a
                href={videoWatchUrl(current)}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 text-xs text-on-dark underline-offset-2 hover:underline"
              >
                {fill(n.watchOn, { platform })} ↗
              </a>
            </div>
          </article>

          {upNext.length > 0 && (
            <aside aria-labelledby="v-more" className="min-w-0 flex-[1_1_280px]">
              <h2
                id="v-more"
                className="mb-2 border-t border-white pt-2.5 text-[13px] font-bold uppercase tracking-[0.4px]"
              >
                {n.upNext}
              </h2>
              <ul>
                {upNext.map((v, i) => (
                  <li key={v.id} className={i < upNext.length - 1 ? "border-b border-[#2b4434]" : ""}>
                    <Link href={withLocale(lang, `/video/${v.id}`)} className="group flex gap-3 py-3">
                      <Media src={videoThumbnail(v)} alt="" sizes="96px" className="w-24 shrink-0 bg-[#2c4a36]" />
                      <span className="font-serif text-sm font-bold leading-[1.35] group-hover:underline">
                        {v.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </section>

        {missed.length > 0 && (
          <section aria-labelledby="v-missed" className="mt-10">
            <SectionHeader id="v-missed" title={n.missed} onDark />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
              {missed.map(card)}
            </div>
          </section>
        )}

        <AdSlot ad="partnerFarm" size="billboard" tone="cream" surface="dark" reverse lang={lang} dict={dict} className="mt-10" />

        <section aria-labelledby="v-story" className="mt-10">
          <SectionHeader id="v-story" title={n.fieldStory} href={localHref(lang, story.href)} onDark />
          <FieldStoryBanner slot={story} lang={lang} surface="black" />
        </section>

        {howto.length > 0 && (
          <section aria-labelledby="v-howto" className="mt-10">
            <SectionHeader id="v-howto" title={n.howto} onDark />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{howto.map(card)}</div>
          </section>
        )}

        {certification.length > 0 && (
          <section aria-labelledby="v-cert" className="mt-10">
            <SectionHeader id="v-cert" title={dict.newsCategories["chung-nhan-tieu-chuan"]} onDark />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{certification.map(card)}</div>
          </section>
        )}

        <p className="mt-10 text-xs text-on-dark-muted">{n.videoNote}</p>
      </div>
    </div>
  );
}
