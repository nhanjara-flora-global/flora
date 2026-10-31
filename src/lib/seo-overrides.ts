import { cache } from "react";

/**
 * SEO đặt tay trong /admin/seo, khoá = đường dẫn có ngôn ngữ, không tham số
 * ("/vi/knowledge"). Ô trống = giữ tiêu đề / mô tả / ảnh web tự tạo.
 */
export type SeoOverride = {
  path: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  noindex: boolean;
  updated_at: string;
};

/** Bảng nhỏ: đọc cả bảng một lần mỗi lượt render. Lỗi / chưa có bảng → coi như không có SEO đặt tay. */
export const loadSeoOverrides = cache(async (): Promise<Map<string, SeoOverride>> => {
  if ((process.env.DATA_SOURCE ?? "local") !== "supabase") return new Map();
  try {
    const { createPublicClient } = await import("@/lib/supabase/public");
    const { data, error } = await createPublicClient().from("seo_overrides").select("*");
    if (error || !data) return new Map();
    return new Map((data as SeoOverride[]).map((r) => [r.path, r]));
  } catch {
    return new Map();
  }
});
