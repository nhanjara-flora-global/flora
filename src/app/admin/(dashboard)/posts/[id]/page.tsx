import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/admin/data";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { NEWS_CATEGORIES } from "@/lib/legacy";
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

  const names = getDictionary("vi").newsCategories as Record<string, string>;
  const categories = NEWS_CATEGORIES.map((c) => ({ slug: c.slug, label: names[c.slug] ?? c.label }));

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
        category: post.category ?? categories[0].slug,
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
