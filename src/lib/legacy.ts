import type { Locale } from "@/lib/i18n/config";
import raw from "./data/wp-content.json";

export type LegacyArticle = {
  slug: string;
  title: string;
  date: string;
  cover: string | null;
  content: string;
  excerpt: string;
};

type RawArticle = Omit<LegacyArticle, "slug">;

const data = raw as unknown as {
  home: { images: string[]; content: string };
  pages: Record<string, RawArticle>;
  services: Record<string, RawArticle>;
  posts: Record<string, RawArticle>;
  categories: Record<string, string[]>;
};

function withSlug(slug: string, article: RawArticle): LegacyArticle {
  return { slug, ...article };
}

/** Service pages built as WP pages have no featured image; reuse the homepage art. */
const SERVICE_FALLBACK_COVER: Record<string, string> = {
  "premium-agricultural-inputs-the-japanese-foundation": "/images/wp/2026_03_ELITE.jpg",
  "strategic-sourcing-procurement-your-bridge-to-vietnam": "/images/wp/2025_09_banner22.jpg",
  "the-export-logistic-chain-precision-velocity-thermal-integrity":
    "/images/wp/2025_09_quanlyduan.jpg",
};
const VOAC_SERVICE_COVER = "/images/wp/2026_03_PRECISION-GROWING.jpg";

/** Dịch vụ nhập từ voac.vn — gốc tiếng Việt, dịch máy sang các ngôn ngữ khác. */
export const VOAC_SERVICE_SLUGS = [
  "voac-dich-vu-cot-loi-cua-voac",
  "voac-dich-vu-ho-tro-cua-voac",
  "voac-dich-vu-chung-nhan-huu-co",
  "voac-dich-vu-tim-nguon-san-pham",
  "voac-chung-nhan-huu-co-voac",
  "voac-chung-nhan-voac-khong-hoa-chat-chem-free",
  "voac-mo-hinh-nong-trai-khong-hoa-chat-voac",
  "voac-doi-tac-nong-trai-huu-co-voac",
  "voac-nguyen-lieu-nong-nghiep-huu-co-voac",
] as const;

export const SERVICE_ORDER = [
  "premium-agricultural-inputs-the-japanese-foundation",
  "strategic-sourcing-procurement-your-bridge-to-vietnam",
  "the-export-logistic-chain-precision-velocity-thermal-integrity",
  "farming-precision-cultivation-the-honey-no-9-legacy",
  "organic-certification-global-compliance-solutions",
  ...VOAC_SERVICE_SLUGS,
] as const;

/** Nguồn gốc ngôn ngữ của từng dịch vụ. Mặc định "en"; dịch vụ voac gốc "vi". */
export const SERVICE_SOURCE_LOCALE: Record<string, Locale> = Object.fromEntries(
  VOAC_SERVICE_SLUGS.map((slug) => [slug, "vi" as Locale]),
);

/** Short labels used by the primary navigation, matching the legacy menu. */
export const SERVICE_NAV_LABEL: Record<string, string> = {
  "premium-agricultural-inputs-the-japanese-foundation": "Agriculture Inputs",
  "strategic-sourcing-procurement-your-bridge-to-vietnam": "Product Sourcing",
  "the-export-logistic-chain-precision-velocity-thermal-integrity": "Export",
  "farming-precision-cultivation-the-honey-no-9-legacy": "Precision Farming",
  "organic-certification-global-compliance-solutions": "Certification",
  "voac-dich-vu-cot-loi-cua-voac": "Dịch vụ cốt lõi",
  "voac-dich-vu-ho-tro-cua-voac": "Dịch vụ hỗ trợ",
  "voac-dich-vu-chung-nhan-huu-co": "Dịch vụ chứng nhận",
  "voac-dich-vu-tim-nguon-san-pham": "Tìm nguồn sản phẩm",
  "voac-chung-nhan-huu-co-voac": "Chứng nhận hữu cơ",
  "voac-chung-nhan-voac-khong-hoa-chat-chem-free": "Chứng nhận không hóa chất",
  "voac-mo-hinh-nong-trai-khong-hoa-chat-voac": "Mô hình nông trại",
  "voac-doi-tac-nong-trai-huu-co-voac": "Đối tác nông trại",
  "voac-nguyen-lieu-nong-nghiep-huu-co-voac": "Nguyên liệu nông nghiệp",
};

export const NEWS_CATEGORIES = [
  { slug: "canh-tac-huu-co", label: "Organic Farming" },
  { slug: "chung-nhan-tieu-chuan", label: "Certification & Standards" },
  { slug: "xuat-khau-logistics", label: "Export & Logistics" },
  { slug: "thi-truong-xu-huong", label: "Market & Trends" },
  { slug: "goc-nhin-flora", label: "Flora Perspective" },
] as const;

export function getServices(): LegacyArticle[] {
  return SERVICE_ORDER.filter((slug) => data.services[slug]).map((slug) => {
    const article = withSlug(slug, data.services[slug]);
    const fallback = slug.startsWith("voac-")
      ? VOAC_SERVICE_COVER
      : SERVICE_FALLBACK_COVER[slug];
    return { ...article, cover: article.cover ?? fallback ?? null };
  });
}

export function getService(slug: string): LegacyArticle | null {
  return getServices().find((s) => s.slug === slug) ?? null;
}

export function getPosts(category?: string): LegacyArticle[] {
  const slugs = category ? (data.categories[category] ?? []) : Object.keys(data.posts);
  return slugs
    .filter((slug) => data.posts[slug])
    .map((slug) => withSlug(slug, data.posts[slug]))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getPost(slug: string): LegacyArticle | null {
  return data.posts[slug] ? withSlug(slug, data.posts[slug]) : null;
}

export function getPage(slug: string): LegacyArticle | null {
  return data.pages[slug] ? withSlug(slug, data.pages[slug]) : null;
}

export function categoriesOf(slug: string): string[] {
  return Object.entries(data.categories)
    .filter(([, slugs]) => slugs.includes(slug))
    .map(([category]) => category);
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
