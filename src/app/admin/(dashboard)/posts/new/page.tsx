import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { NEWS_CATEGORIES } from "@/lib/legacy";
import { SITE_URL } from "@/lib/seo";
import { PostEditor } from "../post-editor";

export const metadata: Metadata = { title: "Viết bài mới" };

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const names = getDictionary("vi").newsCategories as Record<string, string>;
  const categories = NEWS_CATEGORIES.map((c) => ({ slug: c.slug, label: names[c.slug] ?? c.label }));

  return (
    <PostEditor
      categories={categories}
      siteUrl={SITE_URL}
      initial={{
        slug: "",
        status: "draft",
        publishedAt: null,
        updatedAt: null,
        title: "",
        category: categories.some((c) => c.slug === category) ? category! : categories[0].slug,
        excerpt: "",
        content: "",
        coverUrl: null,
        seoTitle: "",
        seoDescription: "",
        translated: [],
      }}
    />
  );
}
