import { SERVICE_ORDER, VOAC_SERVICE_SLUGS } from "@/lib/legacy";

/**
 * Per-service visual identity. The detail template is shared, but every service
 * gets its own accent colour, hero treatment, icon and (curated) headline
 * metrics — so each page reads as a bespoke design, not a blog post.
 */

export type ServiceGroup = "flora" | "voac" | "voac-portfolio";

export type HeroVariant =
  /** Full-bleed cover photo with a gradient scrim, title over the image. */
  | "spotlight"
  /** Accent-tinted panel, oversized serif title, decorative index number. */
  | "editorial";

export type ServiceIcon =
  | "sprout"
  | "route"
  | "truck"
  | "leaf"
  | "badge"
  | "layers"
  | "briefcase"
  | "shield"
  | "search"
  | "seal"
  | "droplet"
  | "pin"
  | "handshake"
  | "flask";

export type ServiceMetric = { value: string; label: string };

export type ServiceTheme = {
  group: ServiceGroup;
  /** Base accent — soft / line / ink variants are derived in CSS via color-mix. */
  accent: string;
  icon: ServiceIcon;
  hero: HeroVariant;
  /** Curated headline numbers shown as a stat strip. Kept manual for accuracy. */
  metrics?: ServiceMetric[];
};

const THEME: Record<string, ServiceTheme> = {
  "premium-agricultural-inputs-the-japanese-foundation": {
    group: "flora",
    accent: "#8a5a2b",
    icon: "sprout",
    hero: "editorial",
    metrics: [
      { value: "100%", label: "Pathogen-free inputs" },
      { value: "3-tier", label: "Testing protocol" },
      { value: "USDA · EU · G.A.P.", label: "Standards cleared" },
    ],
  },
  "strategic-sourcing-procurement-your-bridge-to-vietnam": {
    group: "flora",
    accent: "#2f4b7c",
    icon: "route",
    hero: "editorial",
    metrics: [
      { value: "25 ha", label: "Own farm foundation" },
      { value: "ISO · HACCP · BRC", label: "Partner factories" },
      { value: "1", label: "Point of accountability" },
    ],
  },
  "the-export-logistic-chain-precision-velocity-thermal-integrity": {
    group: "flora",
    accent: "#0f6b6b",
    icon: "truck",
    hero: "spotlight",
    metrics: [
      { value: "7-stage", label: "Export protocol" },
      { value: "17–19%", label: "Brix verified per batch" },
      { value: "48 h", label: "Express air freight" },
    ],
  },
  "farming-precision-cultivation-the-honey-no-9-legacy": {
    group: "flora",
    accent: "#b07d1a",
    icon: "leaf",
    hero: "spotlight",
    metrics: [
      { value: "17–19%", label: "Brix profile" },
      { value: "25 ha", label: "Across 4 agro-climatic zones" },
      { value: "18-month", label: "Scientific growing cycle" },
    ],
  },
  "organic-certification-global-compliance-solutions": {
    group: "flora",
    accent: "#3a6b35",
    icon: "badge",
    hero: "editorial",
    metrics: [
      { value: "4-stage", label: "Field engagement roadmap" },
      { value: "USDA · EU · JAS", label: "Global standards" },
      { value: "GlobalG.A.P.", label: "Supermarket-ready" },
    ],
  },

  "voac-dich-vu-cot-loi-cua-voac": {
    group: "voac",
    accent: "#2e6d3f",
    icon: "layers",
    hero: "editorial",
    metrics: [
      { value: "8", label: "Dịch vụ cốt lõi" },
      { value: "Hạt giống → thị trường", label: "Bao phủ toàn hành trình" },
    ],
  },
  "voac-dich-vu-ho-tro-cua-voac": {
    group: "voac",
    accent: "#5a7a3f",
    icon: "briefcase",
    hero: "editorial",
    metrics: [{ value: "4", label: "Nhóm dịch vụ hỗ trợ" }],
  },
  "voac-dich-vu-chung-nhan-huu-co": {
    group: "voac",
    accent: "#1f6f5c",
    icon: "shield",
    hero: "editorial",
    metrics: [{ value: "USDA · EU · JAS", label: "Tiêu chuẩn quốc tế" }],
  },
  "voac-dich-vu-tim-nguon-san-pham": {
    group: "voac",
    accent: "#3f5c8a",
    icon: "search",
    hero: "editorial",
    metrics: [{ value: "4", label: "Nhóm dịch vụ trọn gói" }],
  },
  "voac-chung-nhan-huu-co-voac": {
    group: "voac-portfolio",
    accent: "#256b4a",
    icon: "seal",
    hero: "editorial",
  },
  "voac-chung-nhan-voac-khong-hoa-chat-chem-free": {
    group: "voac-portfolio",
    accent: "#5b8c2a",
    icon: "droplet",
    hero: "editorial",
  },
  "voac-mo-hinh-nong-trai-khong-hoa-chat-voac": {
    group: "voac-portfolio",
    accent: "#a2542f",
    icon: "pin",
    hero: "editorial",
    metrics: [
      { value: "5", label: "Loại cây trồng" },
      { value: "5 tỉnh", label: "Bảo Lộc · Bình Thuận · Long An · Đồng Nai · Bình Phước" },
    ],
  },
  "voac-doi-tac-nong-trai-huu-co-voac": {
    group: "voac-portfolio",
    accent: "#4a7c59",
    icon: "handshake",
    hero: "editorial",
  },
  "voac-nguyen-lieu-nong-nghiep-huu-co-voac": {
    group: "voac-portfolio",
    accent: "#6b4f2a",
    icon: "flask",
    hero: "editorial",
  },
};

const FALLBACK: ServiceTheme = {
  group: "flora",
  accent: "#7c1226",
  icon: "leaf",
  hero: "editorial",
};

export function getServiceTheme(slug: string): ServiceTheme {
  return THEME[slug] ?? FALLBACK;
}

export const FLORA_SERVICE_SLUGS = SERVICE_ORDER.filter(
  (slug) => !VOAC_SERVICE_SLUGS.includes(slug as (typeof VOAC_SERVICE_SLUGS)[number]),
);

/** Dịch vụ VOAC bán cho khách — menu "Dịch vụ" trên voac.vn. */
export const VOAC_CORE_SERVICE_SLUGS = SERVICE_ORDER.filter(
  (slug) => getServiceTheme(slug).group === "voac",
);

/** Chương trình & bộ chuẩn của chính VOAC — menu "Danh mục đầu tư VOAC". */
export const VOAC_PORTFOLIO_SLUGS = SERVICE_ORDER.filter(
  (slug) => getServiceTheme(slug).group === "voac-portfolio",
);

/** 1-based position of a service within the full catalogue, for display. */
export function serviceIndex(slug: string): number {
  return Math.max(0, SERVICE_ORDER.indexOf(slug as (typeof SERVICE_ORDER)[number])) + 1;
}
