/**
 * Content localization: manual curated pages + machine-translated news with cache.
 */
import type { Locale } from "@/lib/i18n/config";
import type { LegacyArticle } from "@/lib/legacy";
import {
  getPage,
  getService,
  getServices,
  SERVICE_SOURCE_LOCALE,
} from "@/lib/legacy";
import {
  allArticles,
  articleBySlug,
  articlesByCategory,
  type NewsArticle,
} from "@/lib/news";
import manualBundle from "@/lib/i18n/content/manual-bundle.json";

export type LocalizedArticle = LegacyArticle & {
  isTranslated: boolean;
  isFallback: boolean;
  method: "original" | "manual" | "machine" | "fallback";
  displayLocale: Locale;
  sourceLocale: Locale;
  category?: string | null;
  categories?: string[];
  /** SEO nhập trong admin — chỉ có ở bản ngôn ngữ gốc. */
  seoTitle?: string | null;
  seoDescription?: string | null;
  /** Admin đang xem trước bài chưa hiện trên web. */
  isDraft?: boolean;
};

type ManualEntry = {
  title: string;
  excerpt: string;
  content: string;
  sourceLocale?: string;
};

type ManualBundle = Record<string, Partial<Record<Locale, ManualEntry>>>;

const manual = manualBundle as ManualBundle;

const DEFAULT_SOURCE_LOCALE: Locale = "en";

export function getManualPage(
  slug: string,
  locale: Locale,
): LocalizedArticle | null {
  const base = slug === "about-us" ? getPage("about-us") : getService(slug);
  if (!base) return null;

  const source = SERVICE_SOURCE_LOCALE[slug] ?? DEFAULT_SOURCE_LOCALE;

  // Ngôn ngữ gốc: nội dung trong wp-content.json là bản thật.
  if (locale === source) {
    return {
      ...base,
      isTranslated: false,
      isFallback: false,
      method: "original",
      displayLocale: source,
      sourceLocale: source,
    };
  }

  // Bản dịch trong manual-bundle.json. Dịch vụ voac = dịch máy; còn lại = biên tập tay.
  const entry = manual[slug]?.[locale];
  if (entry) {
    return {
      ...base,
      title: entry.title,
      excerpt: entry.excerpt,
      content: entry.content,
      isTranslated: true,
      isFallback: false,
      method: SERVICE_SOURCE_LOCALE[slug] ? "machine" : "manual",
      displayLocale: locale,
      sourceLocale: source,
    };
  }

  // Chưa có bản dịch → hiện bản gốc.
  return {
    ...base,
    isTranslated: false,
    isFallback: true,
    method: "fallback",
    displayLocale: source,
    sourceLocale: source,
  };
}

export function getManualServices(locale: Locale): LocalizedArticle[] {
  return getServices()
    .map((s) => getManualPage(s.slug, locale))
    .filter((s): s is LocalizedArticle => s !== null);
}

function localizeArticle(
  article: NewsArticle,
  locale: Locale,
): LocalizedArticle {
  const common = {
    cover: article.cover,
    date: article.date,
    slug: article.slug,
    category: article.category,
    categories: article.categories,
    sourceLocale: article.sourceLocale,
    isDraft: article.isDraft,
  };

  if (locale === article.sourceLocale) {
    return {
      ...common,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      isTranslated: false,
      isFallback: false,
      method: "original",
      displayLocale: article.sourceLocale,
    };
  }

  const entry = article.translations[locale];
  if (entry) {
    return {
      ...common,
      title: entry.title,
      excerpt: entry.excerpt,
      content: entry.content,
      isTranslated: true,
      isFallback: false,
      method: "machine",
      displayLocale: locale,
    };
  }

  return {
    ...common,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    isTranslated: false,
    isFallback: true,
    method: "fallback",
    displayLocale: article.sourceLocale,
  };
}

export async function getLocalizedPost(
  slug: string,
  locale: Locale,
  opts: { draft?: boolean } = {},
): Promise<LocalizedArticle | null> {
  const article = await articleBySlug(slug, opts);
  return article ? localizeArticle(article, locale) : null;
}

export async function getLocalizedPosts(
  locale: Locale,
  category?: string,
): Promise<LocalizedArticle[]> {
  const articles = category
    ? await articlesByCategory(category)
    : await allArticles();
  return articles.map((a) => localizeArticle(a, locale));
}

export function fallbackBadgeLabel(locale: Locale, sourceLocale: Locale): string {
  const names: Record<Locale, string> = {
    en: "English",
    vi: "Tiếng Việt",
  };
  const source = names[sourceLocale] ?? sourceLocale.toUpperCase();
  switch (locale) {
    case "vi":
      return `Đang hiển thị bản gốc (${source}) — bản dịch chưa có`;
    default:
      return `Showing original (${source}) — translation unavailable`;
  }
}

export function machineBadgeLabel(locale: Locale): string {
  switch (locale) {
    case "vi":
      return "Bản dịch máy — có thể chỉnh sửa sau";
    default:
      return "Machine translated — may be refined later";
  }
}

