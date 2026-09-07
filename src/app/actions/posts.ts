"use server";

import { revalidatePath } from "next/cache";
import { isAdminAuthed } from "@/app/actions/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceClientResult } from "@/lib/admin/data";
import { locales } from "@/lib/i18n/config";
import { slugify, textToHtml } from "@/lib/slug.mjs";
import { translateArticle } from "@/lib/gt-translate.mjs";
import { NEWS_CATEGORIES } from "@/lib/legacy";

const CATEGORY_SLUGS: readonly string[] = NEWS_CATEGORIES.map((c) => c.slug);
const TARGET_LOCALES = locales.filter((l) => l !== "vi");

export type PostInput = {
  id?: string;
  title: string;
  category: string;
  excerpt: string;
  content: string; // văn bản hoặc HTML tiếng Việt
  coverUrl?: string;
  date?: string; // yyyy-mm-dd
  status: "draft" | "published";
};

export type PostResult =
  | { ok: true; id: string; slug: string }
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

export async function savePost(input: PostInput): Promise<PostResult> {
  if (!(await isAdminAuthed())) return { ok: false, error: "Chưa đăng nhập." };

  const title = input.title.trim();
  const excerpt = input.excerpt.trim();
  const contentHtml = textToHtml(input.content);

  if (!title) return { ok: false, error: "Thiếu tiêu đề." };
  if (!CATEGORY_SLUGS.includes(input.category)) {
    return { ok: false, error: "Chuyên mục không hợp lệ." };
  }
  if (!contentHtml) return { ok: false, error: "Thiếu nội dung." };

  const service = await supabaseFor();
  if (!service.ok) return { ok: false, error: service.error };
  const supabase = service.client;
  const slug = input.id ? undefined : slugify(title);

  if (slug !== undefined) {
    const { data: clash } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (clash) {
      return { ok: false, error: `Slug "${slug}" đã tồn tại — đổi tiêu đề.` };
    }
  }

  // Dịch khi publish (bản nháp không dịch để lưu nhanh).
  let translations: Record<string, unknown> | undefined;
  if (input.status === "published") {
    translations = await translateArticle(
      { title, excerpt, content: contentHtml },
      TARGET_LOCALES,
      "vi",
    );
  }

  const row: Record<string, unknown> = {
    title,
    excerpt,
    content: contentHtml,
    category: input.category,
    cover_url: input.coverUrl?.trim() || null,
    status: input.status,
    source_locale: "vi",
    published_at: input.date
      ? new Date(`${input.date}T08:00:00+07:00`).toISOString()
      : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (translations) row.translations = translations;

  let savedId = input.id;
  if (input.id) {
    const { error } = await supabase
      .from("posts")
      .update(row)
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
  } else {
    row.slug = slug;
    const { data, error } = await supabase
      .from("posts")
      .insert(row)
      .select("id")
      .single();
    if (error || !data) {
      return { ok: false, error: error?.message ?? "Không lưu được." };
    }
    savedId = data.id;
  }

  revalidateNews();
  return { ok: true, id: savedId!, slug: slug ?? "" };
}

export async function setPostStatus(
  id: string,
  status: "draft" | "published" | "archived",
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminAuthed())) return { ok: false, error: "Chưa đăng nhập." };
  const service = await supabaseFor();
  if (!service.ok) return { ok: false, error: service.error };
  const supabase = service.client;

  // Publish lần đầu mà chưa có bản dịch → dịch luôn.
  if (status === "published") {
    const { data } = await supabase
      .from("posts")
      .select("title,excerpt,content,translations")
      .eq("id", id)
      .maybeSingle();
    if (data && (!data.translations || Object.keys(data.translations).length === 0)) {
      const translations = await translateArticle(
        { title: data.title, excerpt: data.excerpt ?? "", content: data.content ?? "" },
        TARGET_LOCALES,
        "vi",
      );
      await supabase.from("posts").update({ translations }).eq("id", id);
    }
  }

  const { error } = await supabase
    .from("posts")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
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
): Promise<{ ok: boolean; error?: string }> {
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
  return upErr ? { ok: false, error: upErr.message } : { ok: true };
}

function revalidateNews() {
  for (const lang of locales) {
    revalidatePath(`/${lang}/news`);
    revalidatePath(`/${lang}/news/[slug]`, "page");
    revalidatePath(`/${lang}/news/category/[category]`, "page");
    revalidatePath(`/${lang}`);
  }
}
