import { getServiceClientResult } from "@/lib/admin/data";
import { pageKind, SEO_DESC_MAX, SEO_DESC_MIN, SEO_TITLE_MAX, stripLocale } from "@/lib/admin/site";
import { getProducts } from "@/lib/catalog";
import { locales, withLocale } from "@/lib/i18n/config";
import { allArticles } from "@/lib/news";
import type { SeoOverride } from "@/lib/seo-overrides";
import { sitePages } from "@/lib/site-pages";
import type { SlotRow } from "@/lib/site-slots";

/**
 * Đọc cho trang admin bằng service role (không qua cache của web).
 * `setup`: lý do chưa dùng được — để trang hiện hướng dẫn thay vì báo lỗi khó hiểu.
 */
export type AdminLoad<T> = {
  rows: Map<string, T>;
  setup: null | "local" | "config" | "migration";
  error?: string;
};

async function loadTable<T>(table: string, key: keyof T & string): Promise<AdminLoad<T>> {
  const res = await getServiceClientResult();
  if (res.reason === "local") return { rows: new Map(), setup: "local" };
  if (res.reason === "config") return { rows: new Map(), setup: "config", error: res.message };
  const { data, error } = await res.client.from(table).select("*");
  if (error) {
    const missing = /schema cache|does not exist|PGRST205/i.test(`${error.code} ${error.message}`);
    return { rows: new Map(), setup: missing ? "migration" : null, error: error.message };
  }
  return { rows: new Map((data as T[]).map((r) => [String(r[key]), r])), setup: null };
}

export const loadSlotsAdmin = () => loadTable<SlotRow>("site_slots", "key");
export const loadSeoAdmin = () => loadTable<SeoOverride>("seo_overrides", "path");

/* ── Danh sách trang + cảnh báo SEO ───────────────────────────────── */

export type SeoPageRow = {
  /** Chưa gắn ngôn ngữ. */
  path: string;
  kind: string;
  inSitemap: boolean;
  overrides: Partial<Record<(typeof locales)[number], SeoOverride>>;
};

export async function seoPageRows(overrides: Map<string, SeoOverride>): Promise<SeoPageRow[]> {
  const pages = await sitePages();
  const rows: SeoPageRow[] = pages.map((p) => ({
    path: p.path,
    kind: pageKind(p.path),
    inSitemap: true,
    overrides: Object.fromEntries(
      locales.flatMap((l) => {
        const o = overrides.get(withLocale(l, p.path));
        return o ? [[l, o]] : [];
      }),
    ),
  }));
  // SEO đặt tay cho trang không còn trong sitemap (bài đã gỡ, trang phân trang…).
  const known = new Set(pages.map((p) => p.path));
  for (const o of overrides.values()) {
    const path = stripLocale(o.path);
    if (known.has(path)) continue;
    known.add(path);
    rows.push({
      path,
      kind: pageKind(path),
      inSitemap: false,
      overrides: Object.fromEntries(
        locales.flatMap((l) => {
          const own = overrides.get(withLocale(l, path));
          return own ? [[l, own]] : [];
        }),
      ),
    });
  }
  return rows;
}

export type SeoIssue = {
  level: "error" | "warn";
  /** Có ngôn ngữ khi lỗi chỉ thuộc một ngôn ngữ. */
  path: string;
  kind: string;
  text: string;
  /** Chỗ sửa trong admin. */
  edit?: string;
};

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/** Đọc thẳng dữ liệu (bài, sản phẩm, SEO đặt tay) — không mở lại từng trang. */
export async function seoIssues(overrides: Map<string, SeoOverride>): Promise<SeoIssue[]> {
  const [articles, products, pages] = await Promise.all([allArticles(), getProducts(), sitePages()]);
  const issues: SeoIssue[] = [];
  const known = new Set(pages.map((p) => p.path));
  const postEdit = (slug: string) => `/admin/posts?q=${encodeURIComponent(slug)}`;

  const seenTitles = new Map<string, string>();
  for (const a of articles) {
    const path = `/knowledge/${a.slug}`;
    const own = overrides.get(withLocale("vi", path));
    const title = own?.title || a.seoTitle || a.title;
    const desc = own?.description || a.seoDescription || a.excerpt || "";
    const edit = a.origin === "db" ? postEdit(a.slug) : undefined;

    const dup = seenTitles.get(norm(title));
    if (dup) {
      issues.push({ level: "error", path, kind: "Bài viết", text: `Tiêu đề trùng với bài ${dup}`, edit });
    } else seenTitles.set(norm(title), path);

    if (!a.excerpt?.trim() && !own?.description && !a.seoDescription) {
      issues.push({ level: "error", path, kind: "Bài viết", text: "Chưa có đoạn dẫn — mô tả trên Google bị trống", edit });
    } else if (desc.length < SEO_DESC_MIN || desc.length > SEO_DESC_MAX) {
      issues.push({
        level: "warn",
        path,
        kind: "Bài viết",
        text: `Mô tả Google ${desc.length} ký tự (nên ${SEO_DESC_MIN}–${SEO_DESC_MAX})`,
        edit,
      });
    }
    if (title.length > 70) {
      issues.push({
        level: "warn",
        path,
        kind: "Bài viết",
        text: `Tiêu đề ${title.length} ký tự — Google chỉ hiện khoảng ${SEO_TITLE_MAX}–70 ký tự đầu`,
        edit,
      });
    }
    if (!a.cover && !own?.image_url) {
      issues.push({
        level: "warn",
        path,
        kind: "Bài viết",
        text: "Chưa có ảnh bìa — Google / Facebook hiện ảnh minh hoạ chung theo chuyên mục",
        edit,
      });
    }
  }

  for (const p of products) {
    const path = `/products/${p.slug}`;
    const edit = `/admin/products/${p.id}`;
    if (!p.image_url) issues.push({ level: "error", path, kind: "Sản phẩm", text: "Sản phẩm chưa có ảnh", edit });
    const desc = (p.short_description || p.description || "").replace(/<[^>]*>/g, " ").trim();
    if (desc.length < SEO_DESC_MIN) {
      issues.push({
        level: "warn",
        path,
        kind: "Sản phẩm",
        text: desc ? `Mô tả ngắn chỉ ${desc.length} ký tự (nên ≥ ${SEO_DESC_MIN})` : "Chưa có mô tả",
        edit,
      });
    }
  }

  for (const o of overrides.values()) {
    const edit = `/admin/seo/edit?path=${encodeURIComponent(o.path)}`;
    const base = stripLocale(o.path);
    if (o.noindex) {
      issues.push({ level: "warn", path: o.path, kind: pageKind(o.path), text: "Đang đặt “Ẩn khỏi Google”", edit });
    }
    if (!known.has(base)) {
      issues.push({
        level: "warn",
        path: o.path,
        kind: pageKind(o.path),
        text: "SEO đặt tay cho trang không còn trong sitemap (bài đã gỡ / đổi đường dẫn?)",
        edit,
      });
    }
    if (o.title && o.title.length > 70) {
      issues.push({
        level: "warn",
        path: o.path,
        kind: pageKind(o.path),
        text: `Tiêu đề đặt tay ${o.title.length} ký tự — Google cắt bớt`,
        edit,
      });
    }
    if (o.description && (o.description.length < SEO_DESC_MIN || o.description.length > SEO_DESC_MAX)) {
      issues.push({
        level: "warn",
        path: o.path,
        kind: pageKind(o.path),
        text: `Mô tả đặt tay ${o.description.length} ký tự (nên ${SEO_DESC_MIN}–${SEO_DESC_MAX})`,
        edit,
      });
    }
  }

  return issues.sort((a, b) => (a.level === b.level ? 0 : a.level === "error" ? -1 : 1));
}

/* ── Google đang thấy gì ──────────────────────────────────────────── */

export type LiveSeo = {
  status: number;
  title: string | null;
  description: string | null;
  robots: string | null;
  canonical: string | null;
  image: string | null;
};

const decode = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

function metaContent(html: string, attr: "name" | "property", name: string): string | null {
  const tag = html.match(new RegExp(`<meta[^>]*${attr}="${name}"[^>]*>`, "i"))?.[0];
  const content = tag?.match(/content="([^"]*)"/i)?.[1];
  return content != null ? decode(content) : null;
}

/** Mở lại trang trên chính máy chủ này (như Google) để đọc thẻ trong <head>. Lỗi / quá 8 giây → null. */
export async function fetchLiveSeo(origin: string, path: string): Promise<LiveSeo | null> {
  try {
    const res = await fetch(`${origin}${path}`, {
      headers: { "user-agent": "FloraAdminSeoCheck/1.0 (+Googlebot-compatible)" },
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const html = res.status === 200 ? (await res.text()).split("</head>")[0] : "";
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
    return {
      status: res.status,
      title: title != null ? decode(title) : null,
      description: metaContent(html, "name", "description"),
      robots: metaContent(html, "name", "robots"),
      canonical: html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i)?.[1] ?? null,
      image: metaContent(html, "property", "og:image"),
    };
  } catch {
    return null;
  }
}
