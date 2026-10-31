"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthed } from "@/app/actions/admin";
import { getServiceClientResult } from "@/lib/admin/data";
import { isHomePath, normalizeSlotLink, SEO_PATH_RE } from "@/lib/admin/site";
import { locales, type Locale } from "@/lib/i18n/config";
import { slotDef, type SlotCopy, type SlotField } from "@/lib/site-slots";

export type SiteActionResult = { ok: true } | { ok: false; error: string };

const MIGRATION_HINT =
  "Chưa có bảng trong database — chạy supabase/migrations/0004_site_content.sql trong Supabase SQL Editor.";

const IMAGE_RE = /^(https:\/\/|\/)[^\s<>"]+$/;
const MAX_LEN: Record<SlotField, number> = { eyebrow: 60, title: 160, body: 320, cta: 40 };

async function service() {
  if (!(await isAdminAuthed())) return { ok: false, error: "Phiên đăng nhập đã hết — đăng nhập lại." } as const;
  const res = await getServiceClientResult();
  if (res.reason === "local") return { ok: false, error: "Cần DATA_SOURCE=supabase để lưu. Xem README." } as const;
  if (res.reason === "config") return { ok: false, error: `Supabase chưa cấu hình: ${res.message}` } as const;
  return { ok: true, client: res.client } as const;
}

function dbError(message: string): SiteActionResult {
  return {
    ok: false,
    error: /site_slots|seo_overrides|schema cache|does not exist/i.test(message) ? MIGRATION_HINT : message,
  };
}

/** Banner / quảng cáo / SEO hiện trên mọi trang (layout có ô quảng cáo) → làm mới cả web. */
function revalidateSite() {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}

/* ── Banner + quảng cáo ───────────────────────────────────────────── */

export type SlotInput = {
  key: string;
  active: boolean;
  href: string;
  imageUrl: string;
  content: Partial<Record<Locale, Partial<SlotCopy>>>;
  /** ISO, null = không giới hạn. */
  startsAt: string | null;
  endsAt: string | null;
};

export async function saveSlot(input: SlotInput): Promise<SiteActionResult> {
  const def = slotDef(input.key);
  if (!def) return { ok: false, error: "Không có ô này." };

  const href = input.href.trim() ? normalizeSlotLink(input.href) : "";
  if (href === null) {
    return {
      ok: false,
      error: "Link phải là đường dẫn trong web (/products/…), https://…, tel:… hoặc mailto:…",
    };
  }
  const imageUrl = input.imageUrl.trim();
  if (imageUrl && !IMAGE_RE.test(imageUrl)) {
    return { ok: false, error: "Link ảnh phải bắt đầu bằng https:// hoặc / và không có dấu cách." };
  }

  const startsAt = input.startsAt ? new Date(input.startsAt) : null;
  const endsAt = input.endsAt ? new Date(input.endsAt) : null;
  if ((startsAt && isNaN(+startsAt)) || (endsAt && isNaN(+endsAt))) {
    return { ok: false, error: "Ngày giờ không hợp lệ." };
  }
  if (startsAt && endsAt && endsAt <= startsAt) {
    return { ok: false, error: "Ngày kết thúc phải sau ngày bắt đầu." };
  }

  // Chỉ giữ ô có chữ của đúng các trường ô này dùng.
  const content: Partial<Record<Locale, Partial<SlotCopy>>> = {};
  for (const lang of locales) {
    for (const f of Object.keys(def.fields) as SlotField[]) {
      const v = input.content[lang]?.[f]?.replace(/\s+/g, " ").trim().slice(0, MAX_LEN[f]);
      if (v) (content[lang] ??= {})[f] = v;
    }
  }

  const s = await service();
  if (!s.ok) return s;

  const untouched =
    !Object.keys(content).length && !href && !imageUrl && input.active && !startsAt && !endsAt;
  const { error } = untouched
    ? await s.client.from("site_slots").delete().eq("key", def.key)
    : await s.client.from("site_slots").upsert({
        key: def.key,
        active: input.active,
        href: href || null,
        image_url: imageUrl || null,
        content,
        starts_at: startsAt?.toISOString() ?? null,
        ends_at: endsAt?.toISOString() ?? null,
        updated_at: new Date().toISOString(),
      });
  if (error) return dbError(error.message);

  revalidateSite();
  return { ok: true };
}

/** Xoá phần đã sửa → ô quay về nội dung mặc định. */
export async function resetSlot(key: string): Promise<SiteActionResult> {
  const def = slotDef(key);
  if (!def) return { ok: false, error: "Không có ô này." };
  const s = await service();
  if (!s.ok) return s;
  const { error } = await s.client.from("site_slots").delete().eq("key", def.key);
  if (error) return dbError(error.message);
  revalidateSite();
  return { ok: true };
}

/* ── SEO đặt tay ──────────────────────────────────────────────────── */

export type SeoInput = {
  /** Có ngôn ngữ, không tham số: "/vi/knowledge". */
  path: string;
  title: string;
  description: string;
  imageUrl: string;
  noindex: boolean;
};

export async function saveSeo(input: SeoInput): Promise<SiteActionResult> {
  const path = input.path.trim();
  if (!SEO_PATH_RE.test(path)) return { ok: false, error: "Đường dẫn trang không hợp lệ." };
  if (input.noindex && isHomePath(path)) {
    return { ok: false, error: "Không được ẩn trang chủ khỏi Google." };
  }
  const title = input.title.replace(/\s+/g, " ").trim().slice(0, 150);
  const description = input.description.replace(/\s+/g, " ").trim().slice(0, 320);
  const imageUrl = input.imageUrl.trim();
  if (/[<>]/.test(title + description)) {
    return { ok: false, error: "Tiêu đề và mô tả không được chứa dấu < >." };
  }
  if (imageUrl && !IMAGE_RE.test(imageUrl)) {
    return { ok: false, error: "Link ảnh phải bắt đầu bằng https:// hoặc / và không có dấu cách." };
  }

  const s = await service();
  if (!s.ok) return s;

  const empty = !title && !description && !imageUrl && !input.noindex;
  const { error } = empty
    ? await s.client.from("seo_overrides").delete().eq("path", path)
    : await s.client.from("seo_overrides").upsert({
        path,
        title: title || null,
        description: description || null,
        image_url: imageUrl || null,
        noindex: input.noindex,
        updated_at: new Date().toISOString(),
      });
  if (error) return dbError(error.message);

  revalidateSite();
  return { ok: true };
}

export async function resetSeo(path: string): Promise<SiteActionResult> {
  if (!SEO_PATH_RE.test(path)) return { ok: false, error: "Đường dẫn trang không hợp lệ." };
  const s = await service();
  if (!s.ok) return s;
  const { error } = await s.client.from("seo_overrides").delete().eq("path", path);
  if (error) return dbError(error.message);
  revalidateSite();
  return { ok: true };
}
