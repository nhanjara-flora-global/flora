import { withLocale, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { getLocalizedPosts } from "@/lib/i18n/localized-content";
import { NEWS_CATEGORIES, type SERVICE_ORDER } from "@/lib/legacy";
import { coverFor } from "@/lib/media";
import { formatNewsDate } from "@/lib/news-format";
import { getSolutionCluster, type SolutionCluster } from "@/lib/services/service-theme";
import { MoreStories } from "./shells";

type Category = (typeof NEWS_CATEGORIES)[number]["slug"];

/** Chuyên mục Kiến thức gần nhất với từng cụm dịch vụ. */
const CLUSTER_CATEGORY: Record<SolutionCluster, Category> = {
  "precision-farming": "canh-tac-huu-co",
  certification: "chung-nhan-tieu-chuan",
  sourcing: "xuat-khau-logistics",
  export: "xuat-khau-logistics",
  ecosystem: "goc-nhin-flora",
};

export function categoryForService(slug: string): Category {
  return CLUSTER_CATEGORY[getSolutionCluster(slug as (typeof SERVICE_ORDER)[number])] ?? "goc-nhin-flora";
}

/**
 * 3 bài Kiến thức mới nhất cùng chuyên mục, đặt dưới trang dịch vụ / sản phẩm /
 * giới thiệu để các trang "bài viết" đều kết thúc giống nhau.
 */
export async function RelatedKnowledge({
  lang,
  dict,
  category,
  count = 3,
}: {
  lang: Locale;
  dict: Dictionary;
  category: Category;
  count?: number;
}) {
  const posts = await getLocalizedPosts(lang);
  const inCategory = posts.filter((p) => p.categories?.includes(category));
  const picked = [...inCategory, ...posts.filter((p) => !inCategory.includes(p))].slice(0, count);

  return (
    <MoreStories
      id="related-knowledge"
      title={dict.newsCategories[category]}
      href={withLocale(lang, `/knowledge/category/${category}`)}
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
