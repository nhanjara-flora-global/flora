/**
 * Đọc / ghi bài cho cổng DIGIS (`/api/digis/v1/bai`). Dùng lại đúng các hàm của
 * /admin: cleanBlocks + blocksToHtml (nội dung dạng khối), postChecks (kiểm tra
 * trước khi đăng), slugify, getNewsCategory.
 *
 * Bản tiếng Anh do DIGIS gửi kèm (không dịch máy) → lưu ở `translations.en`
 * đúng dạng { title, excerpt, content } như bản dịch của admin. Lưu ý: nếu sau này
 * bấm "Lưu" một bài ĐÃ ĐĂNG trong /admin, admin sẽ dịch máy lại và ghi đè bản en.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { blockingChecks, postChecks, type Check } from "@/lib/admin/posts";
import { blocksToHtml, cleanBlocks } from "@/lib/post-blocks";
import { slugify } from "@/lib/slug.mjs";
import { getPost as getSeedPost } from "@/lib/legacy";
import { getNewsCategory } from "@/lib/news-categories";
import { linkBai, loi, trangThai } from "@/lib/digis-api";

export const COT =
  "id, slug, title, excerpt, content, cover_url, status, seo_title, seo_description, published_at, created_at, updated_at, category, source_locale, translations";

type Row = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category: string | null;
  source_locale: string | null;
  translations: Record<string, { title?: string; excerpt?: string; content?: string }> | null;
};

const s = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\r\n?/g, "\n").trim().slice(0, max) : "";

export function kiemTraBai(r: { title: string; excerpt: string; content: string; cover_url: string | null; seo_description: string | null }): Check[] {
  return postChecks({
    title: r.title,
    excerpt: r.excerpt,
    content: r.content,
    coverUrl: r.cover_url,
    seoDescription: r.seo_description ?? "",
  });
}

export function xuatBai(r: Row) {
  const en = r.translations?.en;
  return {
    id: r.id,
    slug: r.slug,
    trang_thai: trangThai(r.status, r.published_at),
    published_at: r.published_at,
    created_at: r.created_at,
    updated_at: r.updated_at,
    chuyen_muc: r.category,
    anh_bia: r.cover_url,
    link: { vi: linkBai("vi", r.slug), en: linkBai("en", r.slug) },
    vi: {
      tieu_de: r.title,
      mo_ta_ngan: r.excerpt ?? "",
      noi_dung_html: r.content ?? "",
      seo_title: r.seo_title,
      seo_description: r.seo_description,
    },
    en: en ? { tieu_de: en.title ?? "", mo_ta_ngan: en.excerpt ?? "", noi_dung_html: en.content ?? "" } : null,
    kiem_tra: kiemTraBai({
      title: r.title,
      excerpt: r.excerpt ?? "",
      content: r.content ?? "",
      cover_url: r.cover_url,
      seo_description: r.seo_description,
    }),
  };
}

export async function docBai(sb: SupabaseClient, id: string): Promise<Row | Response> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return loi(404, "khong_co_bai", "Không có bài này.");
  const { data, error } = await sb.from("posts").select(COT).eq("id", id).maybeSingle();
  if (error) return loi(500, "loi_csdl", error.message);
  if (!data) return loi(404, "khong_co_bai", "Không có bài này.");
  return data as Row;
}

async function slugDaCo(sb: SupabaseClient, slug: string, truId?: string) {
  if (getSeedPost(slug)) return true;
  let q = sb.from("posts").select("id").eq("slug", slug);
  if (truId) q = q.neq("id", truId);
  const { data } = await q.limit(1);
  return !!data?.length;
}

type BanNgonNgu = { title: string; excerpt: string; content: string; seo_title?: string; seo_description?: string };

/** Một bản ngôn ngữ trong body: { tieu_de, mo_ta_ngan, khoi[], seo_title?, seo_description? }. */
function docBan(v: unknown, lang: "vi" | "en", batBuoc: boolean): BanNgonNgu | null | Response {
  if (v === undefined || v === null) {
    return batBuoc ? loi(400, "thieu_truong", `Thiếu bản ${lang}.`, lang) : null;
  }
  if (typeof v !== "object" || Array.isArray(v)) return loi(400, "sai_kieu", `Bản ${lang} phải là object.`, lang);
  const b = v as Record<string, unknown>;
  const title = s(b.tieu_de, 150).replace(/\s+/g, " ");
  const excerpt = s(b.mo_ta_ngan, 600);
  if (!Array.isArray(b.khoi)) return loi(400, "thieu_truong", `Bản ${lang} thiếu mảng khoi.`, `${lang}.khoi`);
  const content = blocksToHtml(cleanBlocks(b.khoi));
  if (!title) return loi(400, "thieu_truong", `Bản ${lang} thiếu tieu_de.`, `${lang}.tieu_de`);
  if (!content) return loi(422, "noi_dung_rong", `Bản ${lang} không còn khối hợp lệ nào.`, `${lang}.khoi`);
  return {
    title,
    excerpt,
    content,
    ...(lang === "vi" ? { seo_title: s(b.seo_title, 150), seo_description: s(b.seo_description, 300) } : {}),
  };
}

/**
 * Body POST / PUT → các cột cần ghi. `cu` = bài hiện có (PUT) hoặc null (POST).
 * Body: { chuyen_muc, anh_bia?, slug?, vi: {...}, en?: {...} } — PUT chỉ cần gửi phần đổi.
 */
export async function lapDong(
  sb: SupabaseClient,
  body: Record<string, unknown>,
  cu: Row | null,
): Promise<Record<string, unknown> | Response> {
  const dong: Record<string, unknown> = {};

  if (body.chuyen_muc !== undefined || !cu) {
    const cm = s(body.chuyen_muc, 80);
    if (!cm || !(await getNewsCategory(cm))) return loi(422, "chuyen_muc_sai", "Chuyên mục không có.", "chuyen_muc");
    dong.category = cm;
  }

  if (body.anh_bia !== undefined) {
    const a = body.anh_bia === null ? "" : s(body.anh_bia, 1000);
    if (a && !/^(https:\/\/|\/(?!\/))\S+$/.test(a)) {
      return loi(422, "anh_sai", "Ảnh bìa phải bắt đầu bằng https:// hoặc /", "anh_bia");
    }
    dong.cover_url = a || null;
  }

  const vi = docBan(body.vi, "vi", !cu);
  if (vi instanceof Response) return vi;
  if (vi) {
    dong.title = vi.title;
    dong.excerpt = vi.excerpt;
    dong.content = vi.content;
    dong.seo_title = vi.seo_title || null;
    dong.seo_description = vi.seo_description || null;
    dong.source_locale = "vi";
  }

  const en = docBan(body.en, "en", false);
  if (en instanceof Response) return en;
  if (en) {
    dong.translations = { ...(cu?.translations ?? {}), en: { title: en.title, excerpt: en.excerpt, content: en.content } };
  }

  // Slug: bài mới tự tạo (trùng thì -2, -3…); bài chưa đăng mới đổi được.
  const muon = typeof body.slug === "string" ? slugify(body.slug) : "";
  if (!cu) {
    const goc = muon || slugify(String(dong.title)) || "bai-viet";
    for (let i = 0; ; i++) {
      const thu = i ? `${goc}-${i + 1}` : goc;
      if (!(await slugDaCo(sb, thu))) {
        dong.slug = thu;
        break;
      }
      if (muon) return loi(409, "slug_trung", `Đường dẫn "${muon}" đã có bài khác dùng.`, "slug");
      if (i >= 20) return loi(409, "slug_trung", "Không tạo được đường dẫn — đổi tiêu đề.", "slug");
    }
  } else if (muon && muon !== cu.slug) {
    if (cu.status === "published") return loi(422, "slug_khoa", "Bài đã đăng / lên lịch giữ nguyên đường dẫn.", "slug");
    if (await slugDaCo(sb, muon, cu.id)) return loi(409, "slug_trung", `Đường dẫn "${muon}" đã có bài khác dùng.`, "slug");
    dong.slug = muon;
  }

  // Bài đang đăng / lên lịch: phải còn qua các mục bắt buộc của "Kiểm tra trước khi đăng".
  if (cu?.status === "published") {
    const chan = blockingChecks(
      kiemTraBai({
        title: String(dong.title ?? cu.title),
        excerpt: String(dong.excerpt ?? cu.excerpt ?? ""),
        content: String(dong.content ?? cu.content ?? ""),
        cover_url: (dong.cover_url as string | null | undefined) ?? cu.cover_url,
        seo_description: (dong.seo_description as string | null | undefined) ?? cu.seo_description,
      }),
    );
    if (chan.length) return loi(422, "chua_dat_kiem_tra", chan.map((c) => c.label).join("; "));
  }

  dong.updated_at = new Date().toISOString();
  return dong;
}

export type { Row as DongBai };
