import type { Metadata } from "next";
import { categoryName, getNewsCategories } from "@/lib/news-categories";
import { SITE_URL } from "@/lib/seo";
import { PostEditor } from "../post-editor";

export const metadata: Metadata = { title: "Viết bài mới" };

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const categories = (await getNewsCategories()).map((c) => ({ slug: c.slug, label: categoryName(c, "vi") }));

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
