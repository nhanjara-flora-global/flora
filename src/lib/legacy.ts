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

export const SERVICE_ORDER = [
  "premium-agricultural-inputs-the-japanese-foundation",
  "strategic-sourcing-procurement-your-bridge-to-vietnam",
  "the-export-logistic-chain-precision-velocity-thermal-integrity",
  "farming-precision-cultivation-the-honey-no-9-legacy",
  "organic-certification-global-compliance-solutions",
] as const;

/** Short labels used by the primary navigation, matching the legacy menu. */
export const SERVICE_NAV_LABEL: Record<string, string> = {
  "premium-agricultural-inputs-the-japanese-foundation": "Agriculture Inputs",
  "strategic-sourcing-procurement-your-bridge-to-vietnam": "Product Sourcing",
  "the-export-logistic-chain-precision-velocity-thermal-integrity": "Export",
  "farming-precision-cultivation-the-honey-no-9-legacy": "Precision Farming",
  "organic-certification-global-compliance-solutions": "Certification",
};

export const NEWS_CATEGORIES = [
  { slug: "news", label: "News" },
  { slug: "press", label: "Press" },
  { slug: "market-information", label: "Market information" },
] as const;

export function getServices(): LegacyArticle[] {
  return SERVICE_ORDER.map((slug) => {
    const article = withSlug(slug, data.services[slug]);
    return { ...article, cover: article.cover ?? SERVICE_FALLBACK_COVER[slug] ?? null };
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
