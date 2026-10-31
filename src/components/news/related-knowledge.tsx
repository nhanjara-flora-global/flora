import { withLocale, type Locale } from "@/lib/i18n/config";
import { getLocalizedPosts } from "@/lib/i18n/localized-content";
import type { SERVICE_ORDER } from "@/lib/legacy";
import { coverFor } from "@/lib/media";
import { categoryName, getNewsCategories } from "@/lib/news-categories";
import { formatNewsDate } from "@/lib/news-format";
import { getSolutionCluster, type SolutionCluster } from "@/lib/services/service-theme";
import { MoreStories } from "./shells";

/** Chuyên mục Kiến thức gần nhất với từng cụm dịch vụ. */
const CLUSTER_CATEGORY: Record<SolutionCluster, string> = {
  "precision-farming": "canh-tac-huu-co",
  certification: "chung-nhan-tieu-chuan",
  sourcing: "xuat-khau-logistics",
  export: "xuat-khau-logistics",
  ecosystem: "goc-nhin-flora",
};

export function categoryForService(slug: string): string {
  return CLUSTER_CATEGORY[getSolutionCluster(slug as (typeof SERVICE_ORDER)[number])] ?? "goc-nhin-flora";
}

/**
 * 3 bài Kiến thức mới nhất cùng chuyên mục, đặt dưới trang dịch vụ / sản phẩm /
 * giới thiệu để các trang "bài viết" đều kết thúc giống nhau. Chuyên mục đã bị
 * xoá ở admin thì dùng chuyên mục đầu tiên còn lại.
 */
export async function RelatedKnowledge({
  lang,
  category,
  count = 3,
}: {
  lang: Locale;
  category: string;
  count?: number;
}) {
  const [posts, categories] = await Promise.all([getLocalizedPosts(lang), getNewsCategories()]);
  const cat = categories.find((c) => c.slug === category) ?? categories[0];
  const inCategory = posts.filter((p) => p.categories?.includes(cat.slug));
  const picked = [...inCategory, ...posts.filter((p) => !inCategory.includes(p))].slice(0, count);

  return (
    <MoreStories
      id="related-knowledge"
      title={categoryName(cat, lang)}
      href={withLocale(lang, `/knowledge/category/${cat.slug}`)}
      items={picked.map((p) => ({
        href: withLocale(lang, `/knowledge/${p.slug}`),
        title: p.title,
        excerpt: p.excerpt,
        image: coverFor({ cover: p.cover, categories: p.categories }),
        date: formatNewsDate(p.date, lang),
      }))}
    />
  );
}
