import { getServiceClientResult } from "@/lib/admin/data";
import { getProducts } from "@/lib/catalog";
import { categoriesOf, getPosts as getSeedPosts } from "@/lib/legacy";
import {
  DEFAULT_NEWS_CATEGORIES,
  rowToCategory,
  type CategoryRow,
  type NewsCategory,
} from "@/lib/news-categories";

export type CategoryAdmin = NewsCategory & {
  /** Bài trong database thuộc chuyên mục (mọi trạng thái). */
  dbPosts: number;
  /** Bài mẫu trong wp-content.json chưa có trong database — admin không chuyển được. */
  seedOnlyPosts: number;
};

export type CategoriesAdminLoad = {
  categories: CategoryAdmin[];
  products: { slug: string; name: string }[];
  /** Bài trong database không thuộc chuyên mục nào còn lại. */
  orphanPosts: number;
  setup: null | "local" | "config" | "migration";
  error?: string;
};

/** Đọc bằng service role (không qua cache của web) + đếm bài từng chuyên mục. */
export async function loadCategoriesAdmin(): Promise<CategoriesAdminLoad> {
  const products = (await getProducts()).map((p) => ({ slug: p.slug, name: p.name }));
  const withCounts = (cats: NewsCategory[], posts: { slug: string; category: string | null }[]) => {
    const dbSlugs = new Set(posts.map((p) => p.slug));
    const seedOnly = getSeedPosts().filter((p) => !dbSlugs.has(p.slug));
    return cats.map((c) => ({
      ...c,
      dbPosts: posts.filter((p) => p.category === c.slug).length,
      seedOnlyPosts: seedOnly.filter((p) => categoriesOf(p.slug).includes(c.slug)).length,
    }));
  };

  const res = await getServiceClientResult();
  if (res.reason === "local") {
    return { categories: withCounts(DEFAULT_NEWS_CATEGORIES, []), products, orphanPosts: 0, setup: "local" };
  }
  if (res.reason === "config") {
    return {
      categories: withCounts(DEFAULT_NEWS_CATEGORIES, []),
      products,
      orphanPosts: 0,
      setup: "config",
      error: res.message,
    };
  }

  const [cats, posts] = await Promise.all([
    res.client.from("post_categories").select("*").order("sort_order").order("slug"),
    res.client.from("posts").select("slug, category"),
  ]);
  const postRows = (posts.data ?? []) as { slug: string; category: string | null }[];

  if (cats.error) {
    const missing = /schema cache|does not exist|PGRST205/i.test(`${cats.error.code} ${cats.error.message}`);
    return {
      categories: withCounts(DEFAULT_NEWS_CATEGORIES, postRows),
      products,
      orphanPosts: 0,
      setup: missing ? "migration" : null,
      error: cats.error.message,
    };
  }

  // Bảng trống = chưa sửa lần nào → web đang dùng mặc định; lần lưu đầu sẽ ghi chúng vào bảng.
  const list = cats.data.length ? (cats.data as CategoryRow[]).map(rowToCategory) : DEFAULT_NEWS_CATEGORIES;
  const known = new Set(list.map((c) => c.slug));
  return {
    categories: withCounts(list, postRows),
    products,
    orphanPosts: postRows.filter((p) => !p.category || !known.has(p.category)).length,
    setup: null,
    error: posts.error?.message,
  };
}
