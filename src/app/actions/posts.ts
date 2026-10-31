"use server";

import { revalidatePath } from "next/cache";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/app/actions/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceClientResult } from "@/lib/admin/data";
import {
  blockingChecks,
  INTENTS,
  postChecks,
  type Intent,
  type PostStatus,
} from "@/lib/admin/posts";
import { locales } from "@/lib/i18n/config";
import { slugify, textToHtml } from "@/lib/slug.mjs";
import { translateArticle } from "@/lib/gt-translate.mjs";
import { getPost as getSeedPost } from "@/lib/legacy";
import { getNewsCategory } from "@/lib/news-categories";

const TARGET_LOCALES = locales.filter((l) => l !== "vi");

export type PostInput = {
  id?: string;
  title: string;
  category: string;
  excerpt: string;
  content: string; // văn bản hoặc HTML tiếng Việt
  coverUrl: string | null;
  /** Chỉ đổi được khi bài chưa đăng — bài đã đăng giữ link cũ. Trống = tự tạo theo tiêu đề. */
  slug?: string;
  seoTitle: string;
  seoDescription: string;
  /** ISO. Giờ tương lai = lên lịch; null = đăng ngay khi bấm Đăng. */
  publishAt: string | null;
};

export type SavedPost = {
  id: string;
  slug: string;
  status: PostStatus;
  publishedAt: string | null;
  /** Các ngôn ngữ đã có bản dịch. */
  translated: string[];
};

export type PostResult =
  | { ok: true; post: SavedPost }
  | { ok: false; error: string };

/** Trả lỗi cho UI thay vì ném ra ngoài — action ném là client nhận rejection trần. */
async function supabaseFor(): Promise<
  { ok: true; client: SupabaseClient } | { ok: false; error: string }
> {
  const service = await getServiceClientResult();
  if (service.reason === "local") {
    return {
      ok: false,
      error: "Cần DATA_SOURCE=supabase để dùng chức năng đăng bài. Xem README.",
    };
  }
  if (service.reason === "config") {
    return { ok: false, error: `Supabase chưa cấu hình: ${service.message}` };
  }
  return { ok: true, client: service.client };
}

/** Slug đã có bài khác dùng — kể cả bài seed trong wp-content.json (bài DB trùng slug sẽ đè bài seed). */
async function slugTaken(supabase: SupabaseClient, slug: string, exceptId?: string) {
  if (getSeedPost(slug)) return true;
  let query = supabase.from("posts").select("id").eq("slug", slug);
  if (exceptId) query = query.neq("id", exceptId);
  const { data } = await query.limit(1);
  return !!data?.length;
}

/**
 * Lưu bài. `save` giữ nguyên trạng thái, `publish` đăng (hoặc lên lịch nếu ngày đăng ở
 * tương lai), `unpublish` gỡ về nháp. Bài ở trạng thái đăng được dịch lại mỗi lần lưu.
 */
export async function savePost(input: PostInput, intent: Intent): Promise<PostResult> {
  if (!(await isAdminAuthed())) return { ok: false, error: "Chưa đăng nhập." };
  if (!INTENTS.includes(intent)) return { ok: false, error: "Yêu cầu không hợp lệ." };

  const title = input.title.replace(/\s+/g, " ").trim();
  const excerpt = input.excerpt.trim();
  const contentHtml = textToHtml(input.content);
  const coverUrl = input.coverUrl?.trim() || null;
  const seoTitle = input.seoTitle.trim().slice(0, 150);
  const seoDescription = input.seoDescription.trim().slice(0, 300);

  if (!title) return { ok: false, error: "Thiếu tiêu đề." };
  if (!(await getNewsCategory(input.category))) {
    return { ok: false, error: "Chuyên mục không hợp lệ." };
  }
  if (coverUrl && !/^(https:\/\/|\/)\S+$/.test(coverUrl)) {
    return { ok: false, error: "Link ảnh bìa phải bắt đầu bằng https:// hoặc /" };
  }
  const publishAt = input.publishAt ? new Date(input.publishAt) : null;
  if (publishAt && Number.isNaN(publishAt.getTime())) {
    return { ok: false, error: "Ngày đăng không hợp lệ." };
  }

  const service = await supabaseFor();
  if (!service.ok) return { ok: false, error: service.error };
  const supabase = service.client;

  const { data: cur, error: curError } = input.id
    ? await supabase
        .from("posts")
        .select("id, slug, status, published_at, translations")
        .eq("id", input.id)
        .maybeSingle()
    : { data: null, error: null };
  if (curError) return { ok: false, error: curError.message };
  if (input.id && !cur) return { ok: false, error: "Bài này không còn — có thể đã bị xoá." };

  const status: PostStatus =
    intent === "publish" ? "published" : intent === "unpublish" ? "draft" : (cur?.status ?? "draft");
  if (status === "published") {
    const blocking = blockingChecks(
      postChecks({ title, excerpt, content: contentHtml, coverUrl, seoDescription }),
    );
    if (blocking.length) {
      return {
        ok: false,
        error: `Chưa đăng được: ${blocking.map((c) => c.label.toLowerCase()).join("; ")}`,
      };
    }
  }
  // Bài đang đăng mà xoá trống ngày → giữ ngày cũ (đăng lại từ nháp thì lấy giờ hiện tại).
  const now = new Date().toISOString();
  const publishedAt =
    publishAt?.toISOString() ??
    (status !== "published"
      ? null
      : intent === "publish"
        ? now
        : (cur?.published_at ?? now));

  // Slug: bài mới tự tạo theo tiêu đề (trùng thì thêm -2, -3…); bài chưa đăng đổi được.
  let slug: string = cur?.slug ?? "";
  const wanted = input.slug ? slugify(input.slug) : "";
  if (!cur) {
    const base = wanted || slugify(title) || "bai-viet";
    for (let i = 0; ; i++) {
      const candidate = i ? `${base}-${i + 1}` : base;
      if (!(await slugTaken(supabase, candidate))) {
        slug = candidate;
        break;
      }
      if (wanted) return { ok: false, error: `Đường dẫn "${wanted}" đã có bài khác dùng — đổi đường dẫn.` };
      if (i >= 20) return { ok: false, error: "Không tạo được đường dẫn — đổi tiêu đề." };
    }
  } else if (cur.status !== "published" && wanted && wanted !== cur.slug) {
    if (await slugTaken(supabase, wanted, cur.id)) {
      return { ok: false, error: `Đường dẫn "${wanted}" đã có bài khác dùng — đổi đường dẫn.` };
    }
    slug = wanted;
  }

  // Dịch khi đăng / cập nhật bài đang đăng (bản nháp không dịch để lưu nhanh).
  const translations =
    status === "published"
      ? await translateArticle({ title, excerpt, content: contentHtml }, TARGET_LOCALES, "vi")
      : undefined;

  const row: Record<string, unknown> = {
    title,
    slug,
    excerpt,
    content: contentHtml,
    category: input.category,
    cover_url: coverUrl,
    seo_title: seoTitle || null,
    seo_description: seoDescription || null,
    status,
    source_locale: "vi",
    published_at: publishedAt,
    updated_at: now,
  };
  if (translations) row.translations = translations;

  let savedId = cur?.id as string | undefined;
  if (cur) {
    const { error } = await supabase.from("posts").update(row).eq("id", cur.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase.from("posts").insert(row).select("id").single();
    if (error || !data) return { ok: false, error: error?.message ?? "Không lưu được." };
    savedId = data.id;
  }

  revalidateNews();
  return {
    ok: true,
    post: {
      id: savedId!,
      slug,
      status,
      publishedAt,
      translated: Object.keys(translations ?? cur?.translations ?? {}),
    },
  };
}

export async function setPostStatus(
  id: string,
  status: "draft" | "published" | "archived",
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminAuthed())) return { ok: false, error: "Chưa đăng nhập." };
  const service = await supabaseFor();
  if (!service.ok) return { ok: false, error: service.error };
  const supabase = service.client;

  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  // Publish lần đầu mà chưa có bản dịch → dịch luôn; chưa có ngày đăng → đăng ngay.
  if (status === "published") {
    const { data } = await supabase
      .from("posts")
      .select("title,excerpt,content,translations,published_at")
      .eq("id", id)
      .maybeSingle();
    if (data && (!data.translations || Object.keys(data.translations).length === 0)) {
      patch.translations = await translateArticle(
        { title: data.title, excerpt: data.excerpt ?? "", content: data.content ?? "" },
        TARGET_LOCALES,
        "vi",
      );
    }
    if (data && !data.published_at) patch.published_at = patch.updated_at;
  }

  const { error } = await supabase.from("posts").update(patch).eq("id", id);
  revalidateNews();
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deletePost(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminAuthed())) return { ok: false, error: "Chưa đăng nhập." };
  const service = await supabaseFor();
  if (!service.ok) return { ok: false, error: service.error };
  const supabase = service.client;
  const { error } = await supabase.from("posts").delete().eq("id", id);
  revalidateNews();
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Dịch lại toàn bộ (khi sửa nội dung tiếng Việt của bài đã publish). */
export async function retranslatePost(
  id: string,
): Promise<{ ok: true; translated: string[] } | { ok: false; error: string }> {
  if (!(await isAdminAuthed())) return { ok: false, error: "Chưa đăng nhập." };
  const service = await supabaseFor();
  if (!service.ok) return { ok: false, error: service.error };
  const supabase = service.client;
  const { data, error } = await supabase
    .from("posts")
    .select("title,excerpt,content")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return { ok: false, error: "Không tìm thấy bài." };
  const translations = await translateArticle(
    { title: data.title, excerpt: data.excerpt ?? "", content: data.content ?? "" },
    TARGET_LOCALES,
    "vi",
  );
  const { error: upErr } = await supabase
    .from("posts")
    .update({ translations, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidateNews();
  return upErr ? { ok: false, error: upErr.message } : { ok: true, translated: Object.keys(translations) };
}

/** Tắt chế độ xem trước (bật ở /admin/preview) rồi quay về danh sách bài. */
export async function exitPreview() {
  (await draftMode()).disable();
  redirect("/admin/posts");
}

function revalidateNews() {
  revalidatePath("/admin/posts");
  for (const lang of locales) {
    revalidatePath(`/${lang}/knowledge`);
    revalidatePath(`/${lang}/knowledge/[slug]`, "page");
    revalidatePath(`/${lang}/knowledge/category/[category]`, "page");
    revalidatePath(`/${lang}`);
  }
}
