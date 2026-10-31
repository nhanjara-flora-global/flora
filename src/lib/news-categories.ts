import { cache } from "react";
import { locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { NEWS_CATEGORIES } from "@/lib/legacy";

/**
 * Chuyên mục bài Kiến thức. Danh sách sửa được ở /admin/post-categories (bảng
 * `post_categories`, migration 0005). Chưa chạy migration, bảng trống hoặc đọc
 * lỗi → dùng 5 chuyên mục mặc định dưới đây, web hiện y như trước.
 */

export type NewsCategory = {
  slug: string;
  /** Tên theo ngôn ngữ; thiếu ngôn ngữ nào thì dùng tên tiếng Việt. */
  names: Partial<Record<Locale, string>>;
  /** Đoạn giới thiệu dưới tiêu đề trang chuyên mục, cũng là mô tả SEO. */
  descriptions: Partial<Record<Locale, string>>;
  /** Slug sản phẩm trong hộp "Sản phẩm liên quan" của bài thuộc chuyên mục. */
  relatedProduct: string | null;
  sortOrder: number;
};

export type CategoryRow = {
  slug: string;
  names: Partial<Record<Locale, string>> | null;
  descriptions: Partial<Record<Locale, string>> | null;
  related_product: string | null;
  sort_order: number;
  updated_at?: string;
};

const DEFAULT_RELATED_PRODUCT: Record<string, string> = {
  "canh-tac-huu-co": "phan-ga-huu-co-nhat-ban",
  "chung-nhan-tieu-chuan": "phan-ga-huu-co-nhat-ban",
  "goc-nhin-flora": "phan-ga-huu-co-nhat-ban",
  "xuat-khau-logistics": "bot-hat-sen-100-nguyen-chat",
  "thi-truong-xu-huong": "bot-hat-sen-100-nguyen-chat",
};

export const DEFAULT_NEWS_CATEGORIES: NewsCategory[] = NEWS_CATEGORIES.map((c, i) => ({
  slug: c.slug,
  names: Object.fromEntries(locales.map((l) => [l, getDictionary(l).newsCategories[c.slug]])),
  descriptions: {},
  relatedProduct: DEFAULT_RELATED_PRODUCT[c.slug] ?? null,
  sortOrder: (i + 1) * 10,
}));

export function rowToCategory(r: CategoryRow): NewsCategory {
  return {
    slug: r.slug,
    names: r.names ?? {},
    descriptions: r.descriptions ?? {},
    relatedProduct: r.related_product || null,
    sortOrder: r.sort_order,
  };
}

/** Bảng nhỏ: đọc một lần mỗi lượt render, dùng chung cho menu, trang chủ, trang bài. */
export const getNewsCategories = cache(async (): Promise<NewsCategory[]> => {
  if ((process.env.DATA_SOURCE ?? "local") !== "supabase") return DEFAULT_NEWS_CATEGORIES;
  try {
    const { createPublicClient } = await import("@/lib/supabase/public");
    const { data, error } = await createPublicClient()
      .from("post_categories")
      .select("*")
      .order("sort_order")
      .order("slug");
    if (error || !data?.length) return DEFAULT_NEWS_CATEGORIES;
    return (data as CategoryRow[]).map(rowToCategory);
  } catch {
    return DEFAULT_NEWS_CATEGORIES;
  }
});

export async function getNewsCategory(slug: string): Promise<NewsCategory | null> {
  return (await getNewsCategories()).find((c) => c.slug === slug) ?? null;
}

export function categoryName(c: NewsCategory, lang: Locale): string {
  return c.names[lang]?.trim() || c.names.vi?.trim() || c.slug;
}

/** Không có giới thiệu đúng ngôn ngữ thì bỏ trống — không hiện tiếng Việt trên trang tiếng Anh. */
export function categoryDescription(c: NewsCategory, lang: Locale): string | null {
  return c.descriptions[lang]?.trim() || null;
}

/** slug → tên hiển thị cho dòng meta dưới bài; slug không còn chuyên mục → null. */
export function categoryLabeler(cats: NewsCategory[], lang: Locale) {
  const names = new Map(cats.map((c) => [c.slug, categoryName(c, lang)]));
  return (slug: string | null | undefined): string | null => (slug ? (names.get(slug) ?? null) : null);
}
