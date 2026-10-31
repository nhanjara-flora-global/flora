import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { getServices, SERVICE_ORDER } from "@/lib/legacy";
import { allArticles } from "@/lib/news";
import { getNewsCategories } from "@/lib/news-categories";
import { getSolutionCluster } from "@/lib/services/service-theme";

/** Mọi trang công khai (đường dẫn chưa gắn ngôn ngữ) — dùng cho sitemap và danh sách trang ở /admin/seo. */

type ChangeFreq = MetadataRoute.Sitemap[number]["changeFrequency"];

export type SitePage = {
  path: string;
  lastModified?: string | Date;
  changeFrequency?: ChangeFreq;
  priority?: number;
};

const STATIC: SitePage[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.7 },
  { path: "/solutions", changeFrequency: "monthly", priority: 0.8 },
  { path: "/ecosystem", changeFrequency: "monthly", priority: 0.6 },
  { path: "/products", changeFrequency: "weekly", priority: 0.8 },
  { path: "/knowledge", changeFrequency: "daily", priority: 0.7 },
  { path: "/video", changeFrequency: "weekly", priority: 0.5 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

export async function sitePages(): Promise<SitePage[]> {
  const [articles, products, categories] = await Promise.all([allArticles(), getProducts(), getNewsCategories()]);

  return [
    ...STATIC,
    ...getServices().map((s) => ({
      path: `${getSolutionCluster(s.slug as (typeof SERVICE_ORDER)[number]) === "ecosystem" ? "/ecosystem" : "/solutions"}/${s.slug}`,
      lastModified: s.date || undefined,
      changeFrequency: "monthly" as ChangeFreq,
      priority: 0.8,
    })),
    ...categories.map((c) => ({
      path: `/knowledge/category/${c.slug}`,
      changeFrequency: "weekly" as ChangeFreq,
      priority: 0.5,
    })),
    ...articles.map((a) => ({
      path: `/knowledge/${a.slug}`,
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
}
