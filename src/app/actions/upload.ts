"use server";

import { isAdminAuthed } from "@/app/actions/admin";
import { getServiceClientResult } from "@/lib/admin/data";

const BUCKET = "post-images";
const MAX_BYTES = 8 * 1024 * 1024; // 8MB — khớp serverActions.bodySizeLimit
const OK_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** Tải một ảnh lên Supabase Storage (bucket công khai `post-images`). */
export async function uploadPostImage(
  formData: FormData,
): Promise<UploadResult> {
  if (!(await isAdminAuthed())) return { ok: false, error: "Chưa đăng nhập." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Không nhận được file ảnh." };
  }
  if (!OK_TYPES.has(file.type)) {
    return { ok: false, error: "Chỉ nhận JPG, PNG, WebP, GIF, AVIF." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Ảnh vượt quá 8MB — nén lại rồi thử lại." };
  }

  const service = await getServiceClientResult();
  if (service.reason === "local") {
    return {
      ok: false,
      error: "Cần DATA_SOURCE=supabase để tải ảnh lên. Xem README.",
    };
  }
  if (service.reason === "config") {
    return { ok: false, error: `Supabase chưa cấu hình: ${service.message}` };
  }

  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${EXT[file.type]}`;
  const { error } = await service.client.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    const hint = /bucket/i.test(error.message)
      ? " (chạy supabase/migrations/0002_post_images_storage.sql chưa?)"
      : "";
    return { ok: false, error: error.message + hint };
  }

  const { data } = service.client.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
