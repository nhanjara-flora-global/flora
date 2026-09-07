/**
 * Nguồn tin tức hợp nhất: bài "seed" trong wp-content.json + bài đăng từ admin
 * lưu trong Supabase (khi DATA_SOURCE=supabase). Bài Supabase ghi đè bài seed
 * nếu trùng slug.
 */
import {
  categoriesOf,
  getPost as seedGetPost,
  getPosts as seedGetPosts,
  type LegacyArticle,
} from "@/lib/legacy";
import newsCacheJson from "@/lib/i18n/content/news-cache.json";
import { type Locale } from "@/lib/i18n/config";

export type ArticleTranslation = {
  title: string;
  excerpt: string;
  content: string;
};

export type NewsArticle = LegacyArticle & {
  category: string | null;
  categories: string[];
  translations: Partial<Record<Locale, ArticleTranslation>>;
  sourceLocale: Locale;
  origin: "seed" | "db";
};

const newsCache = newsCacheJson as Record<
  string,
  Partial<Record<Locale, ArticleTranslation & { sourceLocale?: string }>>
>;

function usingSupabase() {
  return (process.env.DATA_SOURCE ?? "local") === "supabase";
}

/** Tiếng Việt có dấu → nguồn "vi"; ngược lại "en". */
export function detectSourceLocale(text: string): Locale {
  return /[ăâêôơưđĂÂÊÔƠƯĐ]/.test(text) ? "vi" : "en";
}

function seedToArticle(a: LegacyArticle): NewsArticle {
  const categories = categoriesOf(a.slug);
  return {
    ...a,
    category: categories[0] ?? null,
    categories,
    translations: newsCache[a.slug] ?? {},
    sourceLocale: detectSourceLocale(`${a.title}\n${a.content}`),
    origin: "seed",
  };
}

type DbRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  category: string | null;
  published_at: string | null;
  created_at: string | null;
  source_locale: string | null;
  translations: Partial<Record<Locale, ArticleTranslation>> | null;
};

function dbToArticle(r: DbRow): NewsArticle {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? "",
    content: r.content ?? "",
    cover: r.cover_url ?? null,
    date: r.published_at ?? r.created_at ?? new Date().toISOString(),
    category: r.category ?? null,
    categories: r.category ? [r.category] : [],
    translations: r.translations ?? {},
    sourceLocale: (r.source_locale as Locale) ?? "vi",
    origin: "db",
  };
}

async function dbArticles(): Promise<NewsArticle[]> {
  if (!usingSupabase()) return [];
  try {
    const { createPublicClient } = await import("@/lib/supabase/public");
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("posts")
      .select(
        "slug,title,excerpt,content,cover_url,category,published_at,created_at,source_locale,translations",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error || !data) return [];
    return (data as DbRow[]).map(dbToArticle);
  } catch {
    return [];
  }
}

export async function allArticles(): Promise<NewsArticle[]> {
  const bySlug = new Map<string, NewsArticle>();
  for (const a of seedGetPosts().map(seedToArticle)) bySlug.set(a.slug, a);
  for (const a of await dbArticles()) bySlug.set(a.slug, a);
  return [...bySlug.values()].sort(
    (x, y) => +new Date(y.date) - +new Date(x.date),
  );
}

export async function articleBySlug(slug: string): Promise<NewsArticle | null> {
  const db = await dbArticles();
  const hit = db.find((a) => a.slug === slug);
  if (hit) return hit;
  const seed = seedGetPost(slug);
  return seed ? seedToArticle(seed) : null;
}

export async function articlesByCategory(
  category: string,
): Promise<NewsArticle[]> {
  return (await allArticles()).filter((a) => a.categories.includes(category));
}
