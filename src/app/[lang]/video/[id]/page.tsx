import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VideoHub } from "@/components/news/video-hub";
import { VIDEOS, videoById, videoThumbnail } from "@/lib/data/videos";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { locales, resolveLocale } from "@/lib/i18n/config";
import { fill } from "@/lib/news-format";
import { pageSeo } from "@/lib/seo";

type Props = { params: Promise<{ lang: string; id: string }> };

export function generateStaticParams() {
  return locales.flatMap((lang) => VIDEOS.map((v) => ({ lang, id: v.id })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params;
  const locale = resolveLocale(lang);
  const dict = getDictionary(locale);
  const video = videoById(id);
  if (!video) return { title: dict.news.videos };
  return pageSeo({
    lang: locale,
    path: `/video/${video.id}`,
    title: video.title,
    description: fill(dict.news.source, { source: video.source }),
    image: videoThumbnail(video) ?? undefined,
  });
}

export default async function VideoDetailPage({ params }: Props) {
  const { lang: raw, id } = await params;
  const lang = resolveLocale(raw);
  const video = videoById(id);
  if (!video) notFound();
  return <VideoHub lang={lang} dict={getDictionary(lang)} current={video} />;
}
