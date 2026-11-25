/**
 * Cổng API nội dung cho hệ thống vận hành DIGIS (`/api/digis/v1/*`).
 *
 * DIGIS dùng cổng này để tạo bài Kiến thức song ngữ (vi + en), tải ảnh, lên lịch
 * và đọc danh sách bài cho báo cáo. Bài đi qua đúng các bước kiểm tra, dựng HTML
 * và làm mới trang như khi đăng trong /admin — admin vẫn xem, sửa được như bài thường.
 *
 * Giới hạn: chỉ chạm bảng `posts` và bucket ảnh `post-images`. Không có lệnh xoá,
 * không đọc / ghi đơn hàng, liên hệ, người dùng, cài đặt.
 *
 * Xác thực: header `Authorization: Bearer <token>`. Web chỉ giữ mã băm SHA-256 của
 * token: biến môi trường `DIGIS_API_TOKEN_SHA256` trên Vercel, hoặc HASH_MAC_DINH
 * dưới đây (mã băm của chuỗi ngẫu nhiên 64 ký tự — công khai cũng không dò ngược
 * được). Đổi token = đổi mã băm. Không có mã băm → mọi lời gọi trả 503.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/service";
import { locales, type Locale } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/seo";

export const PHIEN_BAN = "1.0.0";

const HASH_MAC_DINH = "da39175ed7154674d9dafc9645d0a417c5493c632e1bc469e97a63c4e9478f6f";

function hashDung(): string {
  return (process.env.DIGIS_API_TOKEN_SHA256 || HASH_MAC_DINH).trim().toLowerCase();
}

export function loi(status: number, ma: string, chiTiet: string, truong?: string) {
  return Response.json(
    { loi: ma, chi_tiet: chiTiet, ...(truong ? { truong } : {}) },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export function ok(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

/** null = được phép; còn lại là Response lỗi để trả thẳng. */
export function kiemToken(req: Request): Response | null {
  const can = hashDung();
  if (!/^[0-9a-f]{64}$/.test(can)) return loi(503, "chua_cau_hinh", "Cổng DIGIS chưa có mã băm token.");
  const m = /^Bearer\s+(\S+)$/i.exec(req.headers.get("authorization") ?? "");
  if (!m) return loi(401, "khong_hop_le", "Thiếu hoặc sai token.");
  const nhan = createHash("sha256").update(m[1]).digest();
  const dung = Buffer.from(can, "hex");
  if (nhan.length !== dung.length || !timingSafeEqual(nhan, dung)) {
    return loi(401, "khong_hop_le", "Thiếu hoặc sai token.");
  }
  return null;
}

export function supa(): SupabaseClient | Response {
  if ((process.env.DATA_SOURCE ?? "local") !== "supabase") {
    return loi(503, "khong_co_csdl", "Web đang chạy DATA_SOURCE=local.");
  }
  try {
    return createServiceClient();
  } catch (e) {
    return loi(503, "khong_co_csdl", e instanceof Error ? e.message : "Supabase chưa cấu hình.");
  }
}

export async function docJson(req: Request): Promise<Record<string, unknown> | Response> {
  try {
    const v = await req.json();
    if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error();
    return v as Record<string, unknown>;
  } catch {
    return loi(400, "json_sai", "Body phải là một object JSON.");
  }
}

export const linkBai = (lang: Locale, slug: string) => `${SITE_URL}/${lang}/knowledge/${slug}`;

/** Giống revalidateNews() trong app/actions/posts.ts, thêm sitemap. */
export function lamMoiTrang() {
  revalidatePath("/admin/posts");
  for (const lang of locales) {
    revalidatePath(`/${lang}/knowledge`);
    revalidatePath(`/${lang}/knowledge/[slug]`, "page");
    revalidatePath(`/${lang}/knowledge/category/[category]`, "page");
    revalidatePath(`/${lang}/knowledge/page/[page]`, "page");
    revalidatePath(`/${lang}`);
  }
  revalidatePath("/sitemap.xml");
}

/** Trạng thái hiển thị: nhap | hen_gio | da_dang | luu_tru. */
export function trangThai(status: string, publishedAt: string | null, now = Date.now()) {
  if (status === "archived") return "luu_tru";
  if (status !== "published") return "nhap";
  return publishedAt && new Date(publishedAt).getTime() > now ? "hen_gio" : "da_dang";
}
