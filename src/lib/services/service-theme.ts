import { SERVICE_ORDER, VOAC_SERVICE_SLUGS } from "@/lib/legacy";

/**
 * Per-service visual identity. The detail template is shared; every service
 * gets its own hero treatment, icon and (curated) headline metrics. Accents all
 * use one leaf green beside the maroon brand — 14 different hues made the
 * site look disjointed.
 */

const ACCENT = "#2f6b45";

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
    accent: ACCENT,
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
    accent: ACCENT,
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
    accent: ACCENT,
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
    accent: ACCENT,
    icon: "leaf",
    hero: "editorial",
    metrics: [
      { value: "17–19%", label: "Brix profile" },
      { value: "25 ha", label: "Across 4 agro-climatic zones" },
      { value: "18-month", label: "Scientific growing cycle" },
    ],
  },
  "organic-certification-global-compliance-solutions": {
    group: "flora",
    accent: ACCENT,
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
    accent: ACCENT,
    icon: "layers",
    hero: "editorial",
    metrics: [
      { value: "8", label: "Dịch vụ cốt lõi" },
      { value: "Hạt giống → thị trường", label: "Bao phủ toàn hành trình" },
    ],
  },
  "voac-dich-vu-ho-tro-cua-voac": {
    group: "voac",
    accent: ACCENT,
    icon: "briefcase",
    hero: "editorial",
    metrics: [{ value: "4", label: "Nhóm dịch vụ hỗ trợ" }],
  },
  "voac-dich-vu-chung-nhan-huu-co": {
    group: "voac",
    accent: ACCENT,
    icon: "shield",
    hero: "editorial",
    metrics: [{ value: "USDA · EU · JAS", label: "Tiêu chuẩn quốc tế" }],
  },
  "voac-dich-vu-tim-nguon-san-pham": {
    group: "voac",
    accent: ACCENT,
    icon: "search",
    hero: "editorial",
    metrics: [{ value: "4", label: "Nhóm dịch vụ trọn gói" }],
  },
  "voac-chung-nhan-huu-co-voac": {
    group: "voac-portfolio",
    accent: ACCENT,
    icon: "seal",
    hero: "editorial",
  },
  "voac-chung-nhan-voac-khong-hoa-chat-chem-free": {
    group: "voac-portfolio",
    accent: ACCENT,
    icon: "droplet",
    hero: "editorial",
  },
  "voac-mo-hinh-nong-trai-khong-hoa-chat-voac": {
    group: "voac-portfolio",
    accent: ACCENT,
    icon: "pin",
    hero: "editorial",
    metrics: [
      { value: "5", label: "Loại cây trồng" },
      { value: "5 tỉnh", label: "Bảo Lộc · Bình Thuận · Long An · Đồng Nai · Bình Phước" },
    ],
  },
  "voac-doi-tac-nong-trai-huu-co-voac": {
    group: "voac-portfolio",
    accent: ACCENT,
    icon: "handshake",
    hero: "editorial",
  },
  "voac-nguyen-lieu-nong-nghiep-huu-co-voac": {
    group: "voac-portfolio",
    accent: ACCENT,
    icon: "flask",
    hero: "editorial",
  },
};

const FALLBACK: ServiceTheme = {
  group: "flora",
  accent: ACCENT,
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

/**
 * Business-capability grouping for navigation — replaces the old "Flora vs
 * VOAC" nav split, which organised by internal brand rather than by the
 * problem a visitor is trying to solve. See document/REEDIT.txt for the
 * underlying IA rationale (Solutions: Precision Farming / Certification /
 * Sourcing / Export, plus a VOAC Ecosystem cluster for consortium-operations
 * pages that don't yet have a dedicated Ecosystem section of their own).
 */
export type SolutionCluster =
  | "precision-farming"
  | "certification"
  | "sourcing"
  | "export"
  | "ecosystem";

export const SOLUTION_CLUSTER_ORDER: SolutionCluster[] = [
  "precision-farming",
  "certification",
  "sourcing",
  "export",
  "ecosystem",
];

type ServiceSlug = (typeof SERVICE_ORDER)[number];

const NAV_CLUSTER: Record<ServiceSlug, SolutionCluster> = {
  "premium-agricultural-inputs-the-japanese-foundation": "precision-farming",
  "farming-precision-cultivation-the-honey-no-9-legacy": "precision-farming",
  "voac-nguyen-lieu-nong-nghiep-huu-co-voac": "precision-farming",

  "organic-certification-global-compliance-solutions": "certification",
  "voac-dich-vu-chung-nhan-huu-co": "certification",
  "voac-chung-nhan-huu-co-voac": "certification",
  "voac-chung-nhan-voac-khong-hoa-chat-chem-free": "certification",

  "strategic-sourcing-procurement-your-bridge-to-vietnam": "sourcing",
  "voac-dich-vu-tim-nguon-san-pham": "sourcing",

  "the-export-logistic-chain-precision-velocity-thermal-integrity": "export",

  "voac-dich-vu-cot-loi-cua-voac": "ecosystem",
  "voac-dich-vu-ho-tro-cua-voac": "ecosystem",
  "voac-mo-hinh-nong-trai-khong-hoa-chat-voac": "ecosystem",
  "voac-doi-tac-nong-trai-huu-co-voac": "ecosystem",
};

export function getSolutionCluster(slug: ServiceSlug): SolutionCluster {
  return NAV_CLUSTER[slug];
}

/** All 14 service slugs, bucketed into the 5 nav clusters, in catalogue order. */
export function servicesByCluster(): Record<SolutionCluster, ServiceSlug[]> {
  const map: Record<SolutionCluster, ServiceSlug[]> = {
    "precision-farming": [],
    certification: [],
    sourcing: [],
    export: [],
    ecosystem: [],
  };
  for (const slug of SERVICE_ORDER) {
    map[getSolutionCluster(slug)].push(slug);
  }
  return map;
}
