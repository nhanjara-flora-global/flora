import Link from "next/link";
import { PostForm } from "../post-form";

export default function NewPostPage() {
  return (
    <>
      <header className="mb-6">
        <Link href="/admin/posts" className="text-sm text-[var(--muted)] hover:text-[var(--brand)]">
          ← Bài viết
        </Link>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">
          Viết bài mới
        </h1>
      </header>
      <PostForm />
    </>
  );
}
