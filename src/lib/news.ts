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
  /** SEO tiếng Việt nhập trong admin (chỉ dùng cho ngôn ngữ gốc). */
  seoTitle?: string | null;
  seoDescription?: string | null;
  /** Bài chưa hiện trên web (nháp / lên lịch) — chỉ có khi admin xem trước. */
  isDraft?: boolean;
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
  seo_title: string | null;
  seo_description: string | null;
  status?: string;
};

const DB_COLUMNS =
  "slug,title,excerpt,content,cover_url,category,published_at,created_at,source_locale,translations,seo_title,seo_description";

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
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
  };
}

async function dbArticles(): Promise<NewsArticle[]> {
  if (!usingSupabase()) return [];
  try {
    const { createPublicClient } = await import("@/lib/supabase/public");
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("posts")
      .select(DB_COLUMNS)
      .eq("status", "published")
      // Bài lên lịch: chưa tới giờ thì chưa hiện (trang tin revalidate 5 phút).
      .lte("published_at", new Date().toISOString())
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

/** Admin xem trước: đọc bài ở mọi trạng thái bằng service role. */
async function dbDraftArticle(slug: string): Promise<NewsArticle | null> {
  const { getServiceClient } = await import("@/lib/admin/data");
  const supabase = await getServiceClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("posts")
    .select(`${DB_COLUMNS},status`)
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  const row = data as DbRow;
  const live =
    row.status === "published" &&
    !!row.published_at &&
    new Date(row.published_at).getTime() <= Date.now();
  return { ...dbToArticle(row), isDraft: !live };
}

export async function articleBySlug(
  slug: string,
  opts: { draft?: boolean } = {},
): Promise<NewsArticle | null> {
  if (opts.draft) {
    const draft = await dbDraftArticle(slug);
    if (draft) return draft;
  }
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
