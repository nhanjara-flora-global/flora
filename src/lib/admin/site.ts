import { locales } from "@/lib/i18n/config";
import type { SlotState } from "@/lib/site-slots";

/** Hàm thuần cho /admin/banners, /admin/ads, /admin/seo — dùng được cả ở server lẫn trình duyệt. */

/** Admin viết tiếng Việt trước: tab / cột ngôn ngữ luôn để vi đầu tiên. */
export const ADMIN_LOCALES = [...locales].sort((a, b) => (a === "vi" ? -1 : b === "vi" ? 1 : 0));

const LOCALE_PREFIX = new RegExp(`^/(${locales.join("|")})(?=/|$)`);
const OWN_HOST = /^https?:\/\/(www\.)?flora-global\.vn(?=\/|$)/i;

/**
 * Link của banner / quảng cáo: đường dẫn trong web lưu KHÔNG kèm ngôn ngữ
 * (web tự gắn /vi, /en theo trang đang xem). Dán link đầy đủ của chính web
 * hay "/vi/…" đều được đổi về "/…". null = link không hợp lệ.
 */
export function normalizeSlotLink(raw: string): string | null {
  let h = raw.trim();
  if (OWN_HOST.test(h)) h = h.replace(OWN_HOST, "") || "/";
  if (h.startsWith("/")) {
    h = h.replace(LOCALE_PREFIX, "") || "/";
    return /^\/[^\s<>"]*$/.test(h) ? h : null;
  }
  if (/^https?:\/\/[^\s<>"]+$/i.test(h)) return h;
  if (/^tel:[+\d.\s()-]+$/i.test(h)) return h.replace(/\s+/g, "");
  if (/^mailto:[^\s<>"]+$/i.test(h)) return h;
  return null;
}

/** Đường dẫn trang để đặt SEO: có ngôn ngữ, không tham số, không dấu cách. */
export const SEO_PATH_RE = new RegExp(`^/(${locales.join("|")})(/[a-z0-9._~%/-]*)?$`, "i");

export const isHomePath = (path: string) => /^\/[a-z]{2}\/?$/i.test(path);

/** "/vi/knowledge/abc" → "/knowledge/abc". */
export function stripLocale(path: string): string {
  return path.replace(LOCALE_PREFIX, "") || "/";
}

export function pageKind(path: string): string {
  const p = stripLocale(path);
  if (p === "/") return "Trang chủ";
  if (p.startsWith("/knowledge/category/")) return "Chuyên mục";
  if (p.startsWith("/knowledge/")) return "Bài viết";
  if (p === "/knowledge") return "Kiến thức";
  if (p.startsWith("/products/")) return "Sản phẩm";
  if (p.startsWith("/solutions/")) return "Giải pháp";
  if (p.startsWith("/ecosystem/")) return "Hệ sinh thái";
  if (p.startsWith("/video/")) return "Video";
  return "Trang chung";
}

export const SLOT_STATE_LABEL = (kind: "banner" | "ad", state: SlotState): string =>
  ({
    default: "Mặc định",
    live: "Đã sửa · đang hiện",
    off: kind === "ad" ? "Đang tắt" : "Tạm dùng mặc định",
    pending: "Chờ tới ngày hiện",
    expired: "Hết hạn · dùng mặc định",
  })[state];

export const SLOT_STATE_TONE: Record<SlotState, "neutral" | "green" | "red" | "blue" | "amber"> = {
  default: "neutral",
  live: "green",
  off: "red",
  pending: "blue",
  expired: "amber",
};

/** Google thường hiện ~60 ký tự tiêu đề, ~160 ký tự mô tả. */
export const SEO_TITLE_MAX = 60;
export const SEO_DESC_MIN = 50;
export const SEO_DESC_MAX = 160;

export const viDateTime = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";
