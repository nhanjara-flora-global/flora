import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/admin/data";
import { categoryName, getNewsCategories } from "@/lib/news-categories";
import { SITE_URL } from "@/lib/seo";
import { PostEditor } from "../post-editor";

export const metadata: Metadata = { title: "Sửa bài viết" };

type Props = { params: Promise<{ id: string }> };

async function getPost(id: string) {
  const supabase = await getServiceClient();
  if (!supabase || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, content, cover_url, category, status, published_at, updated_at, seo_title, seo_description, translations",
    )
    .eq("id", id)
    .maybeSingle();
  return data;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  const categories = (await getNewsCategories()).map((c) => ({ slug: c.slug, label: categoryName(c, "vi") }));

  return (
    <PostEditor
      categories={categories}
      siteUrl={SITE_URL}
      initial={{
        id: post.id,
        slug: post.slug,
        status: post.status,
        publishedAt: post.published_at,
        updatedAt: post.updated_at,
        title: post.title,
        // Chuyên mục cũ đã bị xoá → chọn sẵn chuyên mục đầu, lưu lại là xong.
        category: categories.some((c) => c.slug === post.category) ? post.category : categories[0].slug,
        excerpt: post.excerpt ?? "",
        content: post.content ?? "",
        coverUrl: post.cover_url,
        seoTitle: post.seo_title ?? "",
        seoDescription: post.seo_description ?? "",
        translated: Object.keys(post.translations ?? {}),
      }}
    />
  );
}
