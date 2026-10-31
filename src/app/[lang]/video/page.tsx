import type { Metadata } from "next";
import { VideoHub } from "@/components/news/video-hub";
import { VIDEOS, videoThumbnail } from "@/lib/data/videos";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale } from "@/lib/i18n/config";
import { pageSeo } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const dict = getDictionary(locale);
  return pageSeo({
    lang: locale,
    path: "/video",
    title: dict.news.videos,
    description: dict.news.videoNote,
    image: videoThumbnail(VIDEOS[0]) ?? undefined,
  });
}

export default async function VideoPage({ params }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  return <VideoHub lang={lang} dict={getDictionary(lang)} current={VIDEOS[0]} />;
}
