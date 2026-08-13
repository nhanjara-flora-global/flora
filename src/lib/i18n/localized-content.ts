/**
 * Content localization: manual curated pages + machine-translated news with cache.
 */
import type { Locale } from "@/lib/i18n/config";
import type { LegacyArticle } from "@/lib/legacy";
import { getPage, getPost, getPosts, getService, getServices } from "@/lib/legacy";
import manualBundle from "@/lib/i18n/content/manual-bundle.json";
import newsCache from "@/lib/i18n/content/news-cache.json";

export type LocalizedArticle = LegacyArticle & {
  isTranslated: boolean;
  isFallback: boolean;
  method: "original" | "manual" | "machine" | "fallback";
  displayLocale: Locale;
  sourceLocale: Locale;
};

type ManualEntry = {
  title: string;
  excerpt: string;
  content: string;
  sourceLocale?: string;
};

type ManualBundle = Record<string, Partial<Record<Locale, ManualEntry>>>;
type NewsCache = Record<string, Partial<Record<Locale, ManualEntry>>>;

const manual = manualBundle as ManualBundle;
const cachedNews = newsCache as NewsCache;

const SOURCE_LOCALE: Locale = "en";

function detectSourceLocale(text: string): Locale {
  if (/[ăâêôơưđĂÂÊÔƠƯĐ]/.test(text)) return "vi";
  return "en";
}

export function getManualPage(
  slug: string,
  locale: Locale,
): LocalizedArticle | null {
  const base = slug === "about-us" ? getPage("about-us") : getService(slug);
  if (!base) return null;

  if (locale === "en") {
    return {
      ...base,
      isTranslated: false,
      isFallback: false,
      method: "original",
      displayLocale: "en",
      sourceLocale: SOURCE_LOCALE,
    };
  }

  const entry = manual[slug]?.[locale];
  if (entry) {
    return {
      ...base,
      title: entry.title,
      excerpt: entry.excerpt,
      content: entry.content,
      isTranslated: true,
      isFallback: false,
      method: "manual",
      displayLocale: locale,
      sourceLocale: SOURCE_LOCALE,
    };
  }

  return {
    ...base,
    isTranslated: false,
    isFallback: true,
    method: "fallback",
    displayLocale: "en",
    sourceLocale: SOURCE_LOCALE,
  };
}

export function getManualServices(locale: Locale): LocalizedArticle[] {
  return getServices()
    .map((s) => getManualPage(s.slug, locale))
    .filter((s): s is LocalizedArticle => s !== null);
}

export function getLocalizedPost(
  slug: string,
  locale: Locale,
): LocalizedArticle | null {
  const base = getPost(slug);
  if (!base) return null;

  const sourceLocale = detectSourceLocale(`${base.title}\n${base.content}`);

  if (locale === sourceLocale) {
    return {
      ...base,
      isTranslated: false,
      isFallback: false,
      method: "original",
      displayLocale: sourceLocale,
      sourceLocale,
    };
  }

  const entry = cachedNews[slug]?.[locale];
  if (entry) {
    return {
      ...base,
      title: entry.title,
      excerpt: entry.excerpt,
      content: entry.content,
      isTranslated: true,
      isFallback: false,
      method: "machine",
      displayLocale: locale,
      sourceLocale: (entry.sourceLocale as Locale) || sourceLocale,
    };
  }

  return {
    ...base,
    isTranslated: false,
    isFallback: true,
    method: "fallback",
    displayLocale: sourceLocale,
    sourceLocale,
  };
}

export function getLocalizedPosts(
  locale: Locale,
  category?: string,
): LocalizedArticle[] {
  return getPosts(category)
    .map((p) => getLocalizedPost(p.slug, locale))
    .filter((p): p is LocalizedArticle => p !== null);
}

export function fallbackBadgeLabel(locale: Locale, sourceLocale: Locale): string {
  const names: Record<Locale, string> = {
    en: "English",
    vi: "Tiếng Việt",
    zh: "中文",
    ko: "한국어",
    hi: "हिन्दी",
    si: "සිංහල",
  };
  const source = names[sourceLocale] ?? sourceLocale.toUpperCase();
  switch (locale) {
    case "vi":
      return `Đang hiển thị bản gốc (${source}) — bản dịch chưa có`;
    case "zh":
      return `显示原文（${source}）— 暂无译文`;
    case "ko":
      return `원문 표시 (${source}) — 번역 없음`;
    case "hi":
      return `मूल भाषा में दिखाया जा रहा है (${source}) — अनुवाद उपलब्ध नहीं`;
    case "si":
      return `මුල් භාෂාවෙන් පෙන්වයි (${source}) — පරිවර්තනය නැත`;
    default:
      return `Showing original (${source}) — translation unavailable`;
  }
}

export function machineBadgeLabel(locale: Locale): string {
  switch (locale) {
    case "vi":
      return "Bản dịch máy — có thể chỉnh sửa sau";
    case "zh":
      return "机器翻译 — 稍后可人工校对";
    case "ko":
      return "기계 번역 — 추후 검수 가능";
    case "hi":
      return "मशीन अनुवाद — बाद में संपादन संभव";
    case "si":
      return "යන්ත්‍ර පරිවර්තනය — පසුව සංස්කරණය කළ හැක";
    default:
      return "Machine translated — may be refined later";
  }
}

export function manualBadgeLabel(locale: Locale): string {
  switch (locale) {
    case "vi":
      return "Bản dịch chính thức";
    case "zh":
      return "正式译文";
    case "ko":
      return "공식 번역";
    case "hi":
      return "आधिकारिक अनुवाद";
    case "si":
      return "නිල පරිවර්තනය";
    default:
      return "Official translation";
  }
}
