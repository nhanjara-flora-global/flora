import type { MetadataRoute } from "next";
import { locales, withLocale } from "@/lib/i18n/config";
import { abs, languageAlternates } from "@/lib/seo";
import { loadSeoOverrides } from "@/lib/seo-overrides";
import { sitePages } from "@/lib/site-pages";

// Rebuild hourly so freshly published posts/products enter the sitemap without a deploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [entries, overrides] = await Promise.all([sitePages(), loadSeoOverrides()]);

  // One <url> per locale, each carrying the full hreflang set (itself + siblings).
  // Trang đặt "Ẩn khỏi Google" trong /admin/seo thì rời sitemap.
  return entries.flatMap((e) =>
    locales
      .filter((l) => !overrides.get(withLocale(l, e.path))?.noindex)
      .map((l) => ({
        url: abs(withLocale(l, e.path)),
        lastModified: e.lastModified,
        changeFrequency: e.changeFrequency,
        priority: e.priority,
        alternates: { languages: languageAlternates(e.path) },
      })),
  );
}
