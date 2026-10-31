import { withLocale, type Locale } from "@/lib/i18n/config";
import { getSolutionCluster } from "@/lib/services/service-theme";
import type { SERVICE_ORDER } from "@/lib/legacy";

const DAY = 24 * 60 * 60 * 1000;

/**
 * Ngày đăng kiểu báo: trong vòng 24 giờ hiện "2 giờ trước", cũ hơn thì hiện
 * ngày theo locale ("12 thg 10, 2026" với tiếng Việt). Trang dùng ISR 5 phút
 * nên thời gian tương đối lệch tối đa cỡ đó.
 */
export function formatNewsDate(iso: string, locale: Locale, now = Date.now()): string {
  const d = new Date(iso);
  if (!iso || Number.isNaN(+d)) return "";
  const diff = now - +d;
  if (diff >= 0 && diff < DAY) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const minutes = Math.round(diff / 60000);
    return minutes < 60
      ? rtf.format(-Math.max(1, minutes), "minute")
      : rtf.format(-Math.round(minutes / 60), "hour");
  }
  return d.toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

/** Thay {key} trong chuỗi dịch. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
}

/** Trang dịch vụ nằm dưới /ecosystem hoặc /solutions tùy cụm. */
export function serviceHref(locale: Locale, slug: string): string {
  const cluster = getSolutionCluster(slug as (typeof SERVICE_ORDER)[number]);
  return withLocale(locale, `${cluster === "ecosystem" ? "/ecosystem" : "/solutions"}/${slug}`);
}

/** Link nội bộ (bắt đầu bằng "/") được gắn locale; tel:/https: giữ nguyên. */
export function localHref(locale: Locale, href: string): string {
  return href.startsWith("/") ? withLocale(locale, href) : href;
}

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr",
]);

/**
 * Tách HTML bài viết sau đoạn văn cấp ngoài cùng thứ `after`, để chèn quảng
 * cáo giữa bài mà không cắt ngang trích dẫn, danh sách hay bảng. Bài quá ngắn
 * (ít hơn after + 2 khối) thì không tách.
 */
export function splitAfterParagraph(html: string, after: number): [string, string] | null {
  const tag = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  let depth = 0;
  let blocks = 0;
  let cut = -1;
  for (let m = tag.exec(html); m; m = tag.exec(html)) {
    const [, closing, rawName, selfClosing] = m;
    const name = rawName.toLowerCase();
    if (VOID_TAGS.has(name) || selfClosing) continue;
    if (closing) {
      depth = Math.max(0, depth - 1);
      if (depth === 0) {
        blocks += 1;
        if (name === "p" && blocks >= after && cut < 0) cut = tag.lastIndex;
      }
    } else {
      depth += 1;
    }
  }
  if (cut < 0 || blocks < after + 2) return null;
  return [html.slice(0, cut), html.slice(cut)];
}
