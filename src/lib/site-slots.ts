import { cache } from "react";
import { AD_CREATIVES, type AdKey } from "@/lib/ads";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";

/**
 * Banner + ô quảng cáo sửa được trong /admin. Mỗi ô có nội dung mặc định trong
 * code (từ điển + ảnh trong /public); bảng `site_slots` chỉ giữ phần admin đổi,
 * ô nào để trống thì vẫn dùng mặc định. Chưa chạy migration 0004 hoặc đọc lỗi
 * → web hiện đúng như mặc định, không sập trang.
 */

export type SlotField = "eyebrow" | "title" | "body" | "cta";
export type SlotCopy = Record<SlotField, string>;
export type SlotKind = "banner" | "ad";

export type AdSize = "billboard" | "leaderboard" | "mpu" | "halfpage";
export type AdTone = "dark" | "light" | "cream" | "primary" | "image";

/** Một chỗ ô quảng cáo xuất hiện — để admin biết sửa một ô thì đổi ở đâu + xem trước đúng cỡ. */
export type AdPlacement = { page: string; size: AdSize; tone: AdTone; reverse?: boolean };

export type SlotDef = {
  key: string;
  kind: SlotKind;
  label: string;
  /** Vị trí trên web, đọc cho người không rành code. */
  where: string;
  fields: Partial<Record<SlotField, string>>;
  /** Cỡ ảnh nên tải; null = ô chỉ có chữ. */
  imageHint: string | null;
  placements?: AdPlacement[];
  defaults: (dict: Dictionary, lang: Locale) => { href: string; image: string | null; copy: SlotCopy };
};

const AD_FIELDS = { eyebrow: "Nhãn nhỏ", title: "Tiêu đề", body: "Mô tả ngắn", cta: "Chữ trên nút" };

const PILLAR_HREFS = [
  "/solutions/premium-agricultural-inputs-the-japanese-foundation",
  "/solutions/the-export-logistic-chain-precision-velocity-thermal-integrity",
] as const;
const HONEY_HREF = "/solutions/farming-precision-cultivation-the-honey-no-9-legacy";

/** Tiêu đề trụ cột trong từ điển viết HOA toàn bộ — đổi về kiểu câu cho tiêu đề báo. */
function sentenceCase(text: string, locale: Locale): string {
  if (text !== text.toLocaleUpperCase(locale)) return text;
  const lower = text.toLocaleLowerCase(locale);
  return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
}

const copy = (c: Partial<SlotCopy>): SlotCopy => ({ eyebrow: "", title: "", body: "", cta: "", ...c });

const BANNERS: SlotDef[] = [
  {
    key: "home-strip",
    kind: "banner",
    label: "Dải chữ đầu trang chủ",
    where: "Trang chủ — dải xanh ngay dưới menu",
    fields: { eyebrow: "Chữ đậm bên trái", body: "Dòng chữ giữa", cta: "Chữ trên nút" },
    imageHint: null,
    defaults: (d) => ({
      href: "/ecosystem",
      image: null,
      copy: copy({ eyebrow: d.home.heroEyebrow, body: d.news.ecosystemStrip, cta: d.news.explore }),
    }),
  },
  {
    key: "home-lead",
    kind: "banner",
    label: "Ảnh lớn đầu trang chủ",
    where: "Trang chủ — tin chính giữa khối đầu trang (ảnh lớn nhất trang, cũng là ảnh khi chia sẻ trang chủ)",
    fields: { title: "Tiêu đề", body: "Mô tả", eyebrow: "Nhãn dưới bài" },
    imageHint: "1600×900 (16:9)",
    defaults: (d) => ({
      href: "/ecosystem",
      image: "/images/home/hero-greenhouse.jpg",
      copy: copy({ title: d.home.heroTitle, body: d.home.heroSubtitle, eyebrow: d.nav.ecosystem }),
    }),
  },
  {
    key: "home-side-1",
    kind: "banner",
    label: "Ảnh bên trái trang chủ (trên)",
    where: "Trang chủ — cột trái khối đầu trang, thẻ trên",
    fields: { title: "Tiêu đề", body: "Mô tả", eyebrow: "Nhãn dưới bài" },
    imageHint: "1200×675 (16:9)",
    defaults: (d, lang) => ({
      href: PILLAR_HREFS[0],
      image: "/images/wp/2026_03_ELITE.jpg",
      copy: copy({
        title: sentenceCase(d.home.pillars[0].title, lang),
        body: d.home.pillars[0].body,
        eyebrow: d.nav.services,
      }),
    }),
  },
  {
    key: "home-side-2",
    kind: "banner",
    label: "Ảnh bên trái trang chủ (dưới)",
    where: "Trang chủ — cột trái khối đầu trang, thẻ dưới",
    fields: { title: "Tiêu đề", body: "Mô tả", eyebrow: "Nhãn dưới bài" },
    imageHint: "1200×675 (16:9)",
    defaults: (d, lang) => ({
      href: PILLAR_HREFS[1],
      image: "/images/wp/2025_09_quanlyduan.jpg",
      copy: copy({
        title: sentenceCase(d.home.pillars[3].title, lang),
        body: d.home.pillars[3].body,
        eyebrow: d.nav.export,
      }),
    }),
  },
  {
    key: "field-story",
    kind: "banner",
    label: "Khối câu chuyện đồng ruộng",
    where: "Trang chủ — khối nền tối giữa trang · Trang Video — khối ảnh lớn nền đen cuối trang",
    fields: { title: "Tiêu đề", body: "Mô tả", cta: "Chữ trên nút" },
    imageHint: "1600×900 (16:9)",
    defaults: (d) => ({
      href: HONEY_HREF,
      image: "/images/wp/2026_03_PRECISION-GROWING.jpg",
      copy: copy({ title: d.news.honeyTitle, body: d.home.pillars[1].body, cta: d.news.readMore }),
    }),
  },
];

const AD_PLACEMENTS: Record<AdKey, AdPlacement[]> = {
  chickenManure: [
    { page: "Trang chủ — trên cùng, phía trên menu", size: "billboard", tone: "dark" },
    { page: "Trang bài viết — giữa nội dung", size: "mpu", tone: "primary" },
    { page: "Trang Kiến thức / chuyên mục — cột phải", size: "mpu", tone: "cream" },
  ],
  certification: [
    { page: "Trang chủ — dưới khối đầu trang", size: "leaderboard", tone: "cream" },
    { page: "Trang Sản phẩm, Giải pháp — đầu danh sách", size: "leaderboard", tone: "cream" },
    { page: "Trang chi tiết sản phẩm — cột phải", size: "mpu", tone: "cream" },
    { page: "Trang bài viết — trên tiêu đề", size: "billboard", tone: "dark" },
  ],
  sourcing: [
    { page: "Trang chủ — cặp ô giữa trang (trái)", size: "mpu", tone: "image" },
    { page: "Trang bài viết — cột phải (ô cao)", size: "halfpage", tone: "dark" },
  ],
  lotus: [
    { page: "Trang chủ — cặp ô giữa trang (phải)", size: "mpu", tone: "primary" },
    { page: "Trang bài viết — cột phải", size: "mpu", tone: "cream" },
  ],
  partnerFarm: [
    { page: "Trang chủ — gần cuối trang", size: "billboard", tone: "light", reverse: true },
    { page: "Trang Hệ sinh thái — đầu danh sách", size: "leaderboard", tone: "light" },
    { page: "Trang Giới thiệu — cột phải", size: "mpu", tone: "image" },
    { page: "Trang Video — giữa trang", size: "billboard", tone: "cream", reverse: true },
  ],
  ashFertilizer: [{ page: "Trang Kiến thức / chuyên mục — đầu danh sách", size: "leaderboard", tone: "dark" }],
  voacInputs: [{ page: "Trang Kiến thức / chuyên mục — giữa danh sách", size: "leaderboard", tone: "light" }],
};

const AD_LABELS: Record<AdKey, string> = {
  chickenManure: "Phân gà hữu cơ Nhật Bản",
  certification: "Dịch vụ chứng nhận hữu cơ",
  sourcing: "Thu mua chiến lược",
  lotus: "Bột hạt sen",
  partnerFarm: "Đối tác nông trại VOAC",
  ashFertilizer: "Tro phân gà nung",
  voacInputs: "Nguyên liệu VOAC",
};

/** Cỡ ảnh theo ô lớn nhất có hiện ảnh. */
function adImageHint(placements: AdPlacement[]): string | null {
  if (placements.some((p) => p.size === "billboard")) return "840×500 (ô ngang lớn), ảnh cắt theo khung";
  if (placements.some((p) => p.size === "halfpage" || (p.size === "mpu" && p.tone === "image")))
    return "600×500, ảnh cắt theo khung";
  return null;
}

const ADS: SlotDef[] = (Object.keys(AD_CREATIVES) as AdKey[]).map((ad) => ({
  key: `ad.${ad}`,
  kind: "ad",
  label: AD_LABELS[ad],
  where: AD_PLACEMENTS[ad].map((p) => p.page).join(" · "),
  fields: AD_FIELDS,
  imageHint: adImageHint(AD_PLACEMENTS[ad]) ?? "Các vị trí hiện tại của ô này không dùng ảnh",
  placements: AD_PLACEMENTS[ad],
  defaults: (d) => ({
    href: AD_CREATIVES[ad].href,
    image: AD_CREATIVES[ad].image ?? null,
    copy: copy(d.news.ads[ad]),
  }),
}));

export const SLOTS: SlotDef[] = [...BANNERS, ...ADS];
const BY_KEY = new Map(SLOTS.map((s) => [s.key, s]));

export function slotDef(key: string): SlotDef | undefined {
  return BY_KEY.get(key);
}

export const adSlotKey = (ad: AdKey) => `ad.${ad}`;

/* ── Dữ liệu đã sửa ───────────────────────────────────────────────── */

export type SlotRow = {
  key: string;
  active: boolean;
  href: string | null;
  image_url: string | null;
  content: Partial<Record<Locale, Partial<SlotCopy>>>;
  starts_at: string | null;
  ends_at: string | null;
  updated_at: string;
};

/** Bảng nhỏ (≤ 12 dòng): đọc một lần mỗi lượt render, dùng chung cho mọi ô trên trang. */
export const loadSlotRows = cache(async (): Promise<Map<string, SlotRow>> => {
  if ((process.env.DATA_SOURCE ?? "local") !== "supabase") return new Map();
  try {
    const { createPublicClient } = await import("@/lib/supabase/public");
    const { data, error } = await createPublicClient().from("site_slots").select("*");
    if (error || !data) return new Map();
    return new Map((data as SlotRow[]).map((r) => [r.key, r]));
  } catch {
    return new Map();
  }
});

/**
 * default: chưa sửa · live: nội dung đã sửa đang hiện · off: admin tắt
 * · pending / expired: ngoài khoảng ngày hiện (dùng lại mặc định).
 */
export type SlotState = "default" | "live" | "off" | "pending" | "expired";

export function slotState(row: SlotRow | undefined, now = Date.now()): SlotState {
  if (!row) return "default";
  if (!row.active) return "off";
  if (row.starts_at && new Date(row.starts_at).getTime() > now) return "pending";
  if (row.ends_at && new Date(row.ends_at).getTime() <= now) return "expired";
  return "live";
}

export type ResolvedSlot = {
  /** false = ô quảng cáo bị tắt, không vẽ gì. Banner luôn hiện. */
  visible: boolean;
  href: string;
  image: string | null;
  copy: SlotCopy;
};

/** Gộp phần đã sửa lên mặc định: ô nào trống thì giữ mặc định của đúng ngôn ngữ đó. */
export function mergeSlot(def: SlotDef, lang: Locale, row: SlotRow | undefined, now = Date.now()): ResolvedSlot {
  const base = def.defaults(getDictionary(lang), lang);
  const state = slotState(row, now);
  if (state !== "live" || !row) {
    return { visible: !(def.kind === "ad" && state === "off"), ...base };
  }
  const own = row.content?.[lang] ?? {};
  const pick = (f: SlotField) => own[f]?.trim() || base.copy[f];
  return {
    visible: true,
    href: row.href?.trim() || base.href,
    image: row.image_url?.trim() || base.image,
    copy: { eyebrow: pick("eyebrow"), title: pick("title"), body: pick("body"), cta: pick("cta") },
  };
}

export async function getSlot(key: string, lang: Locale): Promise<ResolvedSlot> {
  const def = BY_KEY.get(key);
  if (!def) throw new Error(`Unknown site slot: ${key}`);
  return mergeSlot(def, lang, (await loadSlotRows()).get(key));
}

export async function getAd(ad: AdKey, lang: Locale): Promise<ResolvedSlot> {
  return getSlot(adSlotKey(ad), lang);
}
