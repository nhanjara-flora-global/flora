/**
 * Bài viết trong admin: trạng thái hiển thị + "Kiểm tra trước khi đăng".
 * Dùng chung cho trình soạn (client) và server action — server kiểm lại y hệt.
 */

export type PostStatus = "draft" | "published" | "archived";
/** `scheduled` = đã bấm đăng nhưng ngày đăng ở tương lai: chưa hiện trên web. */
export type PostState = PostStatus | "scheduled";

export const INTENTS = ["save", "publish", "unpublish"] as const;
export type Intent = (typeof INTENTS)[number];

export const STATE_LABELS: Record<PostState, string> = {
  draft: "Nháp",
  scheduled: "Lên lịch",
  published: "Đã đăng",
  archived: "Lưu trữ",
};

export function postState(
  p: { status: string; publishedAt: string | null },
  now = Date.now(),
): PostState {
  if (p.status === "archived") return "archived";
  if (p.status !== "published") return "draft";
  return p.publishedAt && new Date(p.publishedAt).getTime() > now
    ? "scheduled"
    : "published";
}

export const TITLE_MIN = 10;
export const TITLE_MAX = 150;
export const SEO_MIN = 50;
export const SEO_MAX = 160;
/** Đoạn dẫn vừa để Google / máy AI trích làm câu trả lời nhanh. */
export const LEAD_WORDS_MIN = 25;
export const LEAD_WORDS_MAX = 70;

/** HTML → chữ trơn (đếm độ dài, kiểm nội dung rỗng). */
export function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&[a-z0-9#]+;/gi, "x")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tiêu đề mục dạng câu hỏi — kiểu người dùng hỏi Google / máy AI. */
const isQuestionHeading = (s: string) =>
  /\?\s*$/.test(s.trim()) ||
  /(là gì|thế nào|ra sao|bao lâu|bao nhiêu|khi nào|vì sao|tại sao|có nên|cách )/i.test(s);

/** Ô đường dẫn: bỏ dấu, chỉ giữ a-z 0-9 và gạch nối (vẫn cho gõ gạch ở cuối). */
export function slugInput(s: string): string {
  return s
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-/, "")
    .slice(0, 90);
}

export type Check = { ok: boolean; label: string; required?: boolean };

export type PostDraft = {
  title: string;
  excerpt: string;
  content: string;
  coverUrl: string | null;
  seoDescription: string;
};

export function postChecks(p: PostDraft): Check[] {
  const len = p.title.trim().length;
  const text = plainText(p.content);
  const leadWords = p.excerpt.trim().split(/\s+/).filter(Boolean).length;
  const seo = (p.seoDescription.trim() || p.excerpt.trim()).length;
  const h2 = [...p.content.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => plainText(m[1]));

  const out: Check[] = [
    len < TITLE_MIN || len > TITLE_MAX
      ? { ok: false, required: true, label: `Tiêu đề ${len} ký tự (cần ${TITLE_MIN}–${TITLE_MAX})` }
      : len <= 70
        ? { ok: true, label: `Tiêu đề ${len} ký tự (tốt cho SEO)` }
        : { ok: false, label: `Tiêu đề ${len} ký tự — Google chỉ hiện ~70 ký tự đầu` },
    text
      ? { ok: true, required: true, label: "Có nội dung bài" }
      : { ok: false, required: true, label: "Chưa có nội dung bài" },
    !leadWords
      ? { ok: false, required: true, label: "Chưa có đoạn dẫn (hiện dưới tiêu đề và trên thẻ bài)" }
      : leadWords >= LEAD_WORDS_MIN && leadWords <= LEAD_WORDS_MAX
        ? { ok: true, label: `Đoạn dẫn ${leadWords} từ (vừa để Google / AI trích làm câu trả lời)` }
        : { ok: false, label: `Đoạn dẫn ${leadWords} từ — nên ${LEAD_WORDS_MIN}–${LEAD_WORDS_MAX} từ, trả lời thẳng câu hỏi chính của bài` },
    p.coverUrl
      ? { ok: true, label: "Có ảnh bìa" }
      : { ok: false, label: "Chưa có ảnh bìa (trang hiện ảnh minh họa theo chuyên mục)" },
  ];
  if (h2.length) {
    const asks = h2.some(isQuestionHeading);
    out.push({
      ok: asks,
      label: asks
        ? "Có tiêu đề mục dạng câu hỏi"
        : 'Nên có ít nhất một tiêu đề mục (H2) dạng câu hỏi: "… là gì?", "Cách … như thế nào?"',
    });
  } else if (text.length > 1500) {
    out.push({ ok: false, label: "Bài dài nhưng chưa có tiêu đề mục (H2) nào" });
  }
  out.push(
    seo >= SEO_MIN && seo <= SEO_MAX
      ? { ok: true, label: "Có mô tả SEO" }
      : { ok: false, label: seo ? `Mô tả SEO ${seo} ký tự (nên ${SEO_MIN}–${SEO_MAX})` : "Chưa có mô tả SEO" },
  );
  return out;
}

export const blockingChecks = (checks: Check[]) => checks.filter((c) => c.required && !c.ok);
