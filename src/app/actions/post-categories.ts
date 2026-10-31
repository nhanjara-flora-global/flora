"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isAdminAuthed } from "@/app/actions/admin";
import { getServiceClientResult } from "@/lib/admin/data";
import {
  CATEGORY_DESC_MAX,
  CATEGORY_NAME_MAX,
  CATEGORY_NAME_MIN,
  CATEGORY_SLUG_MAX,
  CATEGORY_SLUG_MIN,
  CATEGORY_SLUG_RE,
  cleanText,
  MIGRATION_FILE,
} from "@/lib/admin/post-categories";
import { getProductBySlug } from "@/lib/catalog";
import { gtText } from "@/lib/gt-translate.mjs";
import { locales, type Locale } from "@/lib/i18n/config";
import { categoriesOf, getPosts as getSeedPosts } from "@/lib/legacy";
import { DEFAULT_NEWS_CATEGORIES, type CategoryRow } from "@/lib/news-categories";
import { slugify } from "@/lib/slug.mjs";

export type CategoryResult = { ok: true; slug: string; note?: string } | { ok: false; error: string };

type Failure = { ok: false; error: string };

const MIGRATION_HINT = `Chưa có bảng chuyên mục trong database — chạy ${MIGRATION_FILE} trong Supabase SQL Editor.`;

async function service(): Promise<{ ok: true; client: SupabaseClient } | Failure> {
  if (!(await isAdminAuthed())) return { ok: false, error: "Phiên đăng nhập đã hết — đăng nhập lại." };
  const res = await getServiceClientResult();
  if (res.reason === "local") return { ok: false, error: "Cần DATA_SOURCE=supabase để lưu. Xem README." };
  if (res.reason === "config") return { ok: false, error: `Supabase chưa cấu hình: ${res.message}` };
  return { ok: true, client: res.client };
}

function dbError(message: string): Failure {
  return {
    ok: false,
    error: /post_categories|schema cache|does not exist|PGRST205/i.test(message) ? MIGRATION_HINT : message,
  };
}

/** Menu, trang chủ, trang chuyên mục, trang bài, sitemap đều đọc chuyên mục → làm mới cả web. */
function revalidateSite() {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}

/**
 * Danh sách hiện tại theo thứ tự. Bảng trống (chưa sửa lần nào, web đang dùng
 * mặc định) thì ghi 5 chuyên mục mặc định trước — lần sửa đầu không làm mất chúng.
 */
async function loadRows(client: SupabaseClient): Promise<{ ok: true; rows: CategoryRow[] } | Failure> {
  const { data, error } = await client
    .from("post_categories")
    .select("*")
    .order("sort_order")
    .order("slug");
  if (error) return dbError(error.message);
  if (data.length) return { ok: true, rows: data as CategoryRow[] };

  const { data: seeded, error: seedError } = await client
    .from("post_categories")
    .insert(
      DEFAULT_NEWS_CATEGORIES.map((c) => ({
        slug: c.slug,
        names: c.names,
        descriptions: c.descriptions,
        related_product: c.relatedProduct,
        sort_order: c.sortOrder,
      })),
    )
    .select("*");
  if (seedError) return dbError(seedError.message);
  return { ok: true, rows: (seeded as CategoryRow[]).sort((a, b) => a.sort_order - b.sort_order) };
}

/** Bản tiếng Anh để trống → dịch máy. Dịch lỗi (endpoint trả lại nguyên văn) thì để trống. */
async function machineTranslate(vi: string, target: Locale): Promise<string> {
  if (!vi) return "";
  try {
    const out = cleanText(await gtText(vi, "vi", target));
    return out && out !== vi && !/[ăâêôơưđ]/i.test(out) ? out : "";
  } catch {
    return "";
  }
}

const OTHER_LOCALES = locales.filter((l) => l !== "vi");

/* ── Thêm / sửa ───────────────────────────────────────────────────── */

export type CategoryInput = {
  /** null = thêm mới. Chuyên mục đã có giữ nguyên đường dẫn để không hỏng link cũ. */
  original: string | null;
  /** Chỉ dùng khi thêm mới; trống = tạo theo tên tiếng Việt. */
  slug: string;
  names: Partial<Record<Locale, string>>;
  descriptions: Partial<Record<Locale, string>>;
  /** Slug sản phẩm; trống = không hiện hộp "Sản phẩm liên quan". */
  relatedProduct: string;
};

export async function saveCategory(input: CategoryInput): Promise<CategoryResult> {
  const names: Partial<Record<Locale, string>> = {};
  const descriptions: Partial<Record<Locale, string>> = {};
  for (const l of locales) {
    const name = cleanText(input.names[l]);
    const desc = cleanText(input.descriptions[l]);
    if (name.length > CATEGORY_NAME_MAX) return { ok: false, error: `Tên tối đa ${CATEGORY_NAME_MAX} ký tự.` };
    if (desc.length > CATEGORY_DESC_MAX) return { ok: false, error: `Giới thiệu tối đa ${CATEGORY_DESC_MAX} ký tự.` };
    if (name) names[l] = name;
    if (desc) descriptions[l] = desc;
  }
  if (!names.vi || names.vi.length < CATEGORY_NAME_MIN) {
    return { ok: false, error: "Nhập tên chuyên mục tiếng Việt." };
  }

  const relatedProduct = input.relatedProduct.trim();
  if (relatedProduct && !(await getProductBySlug(relatedProduct))) {
    return { ok: false, error: "Sản phẩm liên quan không còn bán trên web — chọn sản phẩm khác." };
  }

  const s = await service();
  if (!s.ok) return s;
  const loaded = await loadRows(s.client);
  if (!loaded.ok) return loaded;
  const rows = loaded.rows;

  let slug: string;
  let sortOrder: number;
  if (input.original) {
    const current = rows.find((r) => r.slug === input.original);
    if (!current) return { ok: false, error: "Chuyên mục này đã bị xoá — tải lại trang." };
    slug = current.slug;
    sortOrder = current.sort_order;
  } else {
    slug = input.slug.trim() || slugify(names.vi).slice(0, CATEGORY_SLUG_MAX).replace(/-+$/, "");
    if (slug.length < CATEGORY_SLUG_MIN || slug.length > CATEGORY_SLUG_MAX || !CATEGORY_SLUG_RE.test(slug)) {
      return { ok: false, error: "Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch nối (2–60 ký tự)." };
    }
    if (rows.some((r) => r.slug === slug)) {
      return { ok: false, error: `Đã có chuyên mục dùng đường dẫn “${slug}”.` };
    }
    sortOrder = Math.max(0, ...rows.map((r) => r.sort_order)) + 10;
  }

  // Ô tiếng Anh để trống → dịch máy từ tiếng Việt.
  const untranslated: string[] = [];
  for (const l of OTHER_LOCALES) {
    if (!names[l]) {
      const t = await machineTranslate(names.vi, l);
      if (t) names[l] = t;
      else untranslated.push("tên");
    }
    if (descriptions.vi && !descriptions[l]) {
      const t = await machineTranslate(descriptions.vi, l);
      if (t) descriptions[l] = t;
      else untranslated.push("giới thiệu");
    }
  }

  const { error } = await s.client.from("post_categories").upsert({
    slug,
    names,
    descriptions,
    related_product: relatedProduct || null,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  });
  if (error) return dbError(error.message);

  revalidateSite();
  return {
    ok: true,
    slug,
    note: untranslated.length
      ? `Chưa dịch được ${untranslated.join(" và ")} sang tiếng Anh — trang /en tạm dùng tiếng Việt. Gõ bản tiếng Anh rồi lưu lại.`
      : undefined,
  };
}

/* ── Sắp xếp ──────────────────────────────────────────────────────── */

export async function moveCategory(slug: string, direction: "up" | "down"): Promise<CategoryResult> {
  const s = await service();
  if (!s.ok) return s;
  const loaded = await loadRows(s.client);
  if (!loaded.ok) return loaded;
  const rows = [...loaded.rows];

  const i = rows.findIndex((r) => r.slug === slug);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0) return { ok: false, error: "Chuyên mục này đã bị xoá — tải lại trang." };
  if (j < 0 || j >= rows.length) return { ok: true, slug };
  [rows[i], rows[j]] = [rows[j], rows[i]];

  const now = new Date().toISOString();
  const { error } = await s.client
    .from("post_categories")
    .upsert(rows.map((r, k) => ({ ...r, sort_order: (k + 1) * 10, updated_at: now })));
  if (error) return dbError(error.message);

  revalidateSite();
  return { ok: true, slug };
}

/* ── Xoá ──────────────────────────────────────────────────────────── */

/** Chuyên mục còn bài thì bắt buộc chọn `moveTo` — bài được chuyển sang đó rồi mới xoá. */
export async function deleteCategory(slug: string, moveTo: string | null): Promise<CategoryResult> {
  const s = await service();
  if (!s.ok) return s;
  const loaded = await loadRows(s.client);
  if (!loaded.ok) return loaded;
  const rows = loaded.rows;

  if (!rows.some((r) => r.slug === slug)) return { ok: false, error: "Chuyên mục này đã bị xoá — tải lại trang." };
  if (rows.length <= 1) return { ok: false, error: "Phải còn ít nhất một chuyên mục." };

  const { data: posts, error: readError } = await s.client.from("posts").select("slug, category");
  if (readError) return dbError(readError.message);
  const dbSlugs = new Set((posts ?? []).map((p) => p.slug as string));
  const seedOnly = getSeedPosts().filter((p) => !dbSlugs.has(p.slug) && categoriesOf(p.slug).includes(slug));
  if (seedOnly.length) {
    return {
      ok: false,
      error: `Còn ${seedOnly.length} bài mẫu trong file wp-content.json chưa có trong database nên không chuyển được — chạy npm run posts:sync trước rồi xoá lại.`,
    };
  }

  const count = (posts ?? []).filter((p) => p.category === slug).length;
  let note: string | undefined;
  if (count > 0) {
    const target = rows.find((r) => r.slug === moveTo);
    if (!target || target.slug === slug) {
      return { ok: false, error: `Chuyên mục còn ${count} bài — chọn chuyên mục để chuyển bài sang.` };
    }
    const { error } = await s.client.from("posts").update({ category: target.slug }).eq("category", slug);
    if (error) return dbError(error.message);
    note = `Đã chuyển ${count} bài sang “${target.names?.vi ?? target.slug}”.`;
  }

  const { error } = await s.client.from("post_categories").delete().eq("slug", slug);
  if (error) return dbError(error.message);

  revalidateSite();
  return { ok: true, slug, note };
}
