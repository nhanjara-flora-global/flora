import Link from "next/link";
import { notFound } from "next/navigation";
import { PostForm } from "../post-form";
import { RetranslateButton } from "./retranslate-button";
import { getServiceClient } from "@/lib/admin/data";

type Props = { params: Promise<{ id: string }> };

async function getPost(id: string) {
  const supabase = await getServiceClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, content, cover_url, category, status, published_at, translations",
    )
    .eq("id", id)
    .maybeSingle();
  return data;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  const translated =
    post.translations && Object.keys(post.translations).length > 0;

  return (
    <>
      <header className="mb-6">
        <Link
          href="/admin/posts"
          className="text-sm text-[var(--muted)] hover:text-[var(--brand)]"
        >
          ← Bài viết
        </Link>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            Sửa bài
          </h1>
          <div className="flex items-center gap-3 text-sm">
            <a
              href={`/vi/news/${post.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--muted)] hover:text-[var(--brand)]"
            >
              Xem trên web ↗
            </a>
            <RetranslateButton id={post.id} hasTranslations={!!translated} />
          </div>
        </div>
      </header>

      <PostForm
        initial={{
          id: post.id,
          title: post.title,
          category: post.category ?? undefined,
          excerpt: post.excerpt ?? "",
          content: post.content ?? "",
          coverUrl: post.cover_url ?? "",
          date: post.published_at
            ? new Date(post.published_at).toISOString().slice(0, 10)
            : undefined,
        }}
      />
    </>
  );
}
