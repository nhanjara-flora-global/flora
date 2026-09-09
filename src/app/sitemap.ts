import type { MetadataRoute } from "next";
import { locales, withLocale } from "@/lib/i18n/config";
import { abs, languageAlternates } from "@/lib/seo";
import { getProducts } from "@/lib/catalog";
import { getServices, NEWS_CATEGORIES } from "@/lib/legacy";
import { allArticles } from "@/lib/news";

// Rebuild hourly so freshly published posts/products enter the sitemap without a deploy.
export const revalidate = 3600;

type ChangeFreq = MetadataRoute.Sitemap[number]["changeFrequency"];

type Entry = {
  path: string;
  lastModified?: string | Date;
  changeFrequency?: ChangeFreq;
  priority?: number;
};

const STATIC: Entry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.7 },
  { path: "/services", changeFrequency: "monthly", priority: 0.8 },
  { path: "/products", changeFrequency: "weekly", priority: 0.8 },
  { path: "/news", changeFrequency: "daily", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, products] = await Promise.all([allArticles(), getProducts()]);

  const entries: Entry[] = [
    ...STATIC,
    ...getServices().map((s) => ({
      path: `/services/${s.slug}`,
      lastModified: s.date || undefined,
      changeFrequency: "monthly" as ChangeFreq,
      priority: 0.8,
    })),
    ...NEWS_CATEGORIES.map((c) => ({
      path: `/news/category/${c.slug}`,
      changeFrequency: "weekly" as ChangeFreq,
      priority: 0.5,
    })),
    ...articles.map((a) => ({
      path: `/news/${a.slug}`,
      lastModified: a.date || undefined,
      changeFrequency: "monthly" as ChangeFreq,
      priority: 0.6,
    })),
    ...products.map((p) => ({
      path: `/products/${p.slug}`,
      changeFrequency: "monthly" as ChangeFreq,
      priority: 0.7,
    })),
  ];

  // One <url> per locale, each carrying the full hreflang set (itself + siblings).
  return entries.flatMap((e) =>
    locales.map((l) => ({
      url: abs(withLocale(l, e.path)),
      lastModified: e.lastModified,
      changeFrequency: e.changeFrequency,
      priority: e.priority,
      alternates: { languages: languageAlternates(e.path) },
    })),
  );
}
