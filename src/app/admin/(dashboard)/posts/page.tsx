import Link from "next/link";
import { formatDate, NEWS_CATEGORIES } from "@/lib/legacy";
import { PostActions } from "./post-actions";

const CATEGORY_LABEL = Object.fromEntries(
  NEWS_CATEGORIES.map((c) => [c.slug, c.label]),
);

type Row = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: string;
  published_at: string | null;
  translations: Record<string, unknown> | null;
};

async function listPosts(): Promise<Row[] | null> {
  if ((process.env.DATA_SOURCE ?? "local") !== "supabase") return null;
  const { createServiceClient } = await import("@/lib/supabase/service");
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("posts")
    .select("id, title, slug, category, status, published_at, translations")
    .order("published_at", { ascending: false });
  return (data ?? []) as Row[];
}

export default async function AdminPostsPage() {
  const rows = await listPosts();

  return (
    <>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
            Nội dung
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">
            Bài viết
          </h1>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-2)]"
        >
          + Viết bài mới
        </Link>
      </header>

      {rows === null ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Chưa bật Supabase.</p>
          <p className="mt-1">
            Chức năng đăng bài cần <code>DATA_SOURCE=supabase</code> và chạy{" "}
            <code>supabase/schema.sql</code> + <code>supabase/migrations/0001_news_posts.sql</code>.
            30 bài mẫu vẫn hiển thị từ file JSON.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Chưa có bài nào. Bấm “Viết bài mới” để bắt đầu.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-[var(--line)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--bg-soft)]">
              <tr>
                <th className="px-3 py-2 font-semibold">Tiêu đề</th>
                <th className="px-3 py-2 font-semibold">Chuyên mục</th>
                <th className="px-3 py-2 font-semibold">Ngày</th>
                <th className="px-3 py-2 font-semibold">Dịch</th>
                <th className="px-3 py-2 font-semibold">Trạng thái</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[var(--line)] align-top">
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/posts/${r.id}`}
                      className="font-medium hover:text-[var(--brand)]"
                    >
                      {r.title}
                    </Link>
                    <div className="text-xs text-[var(--muted)]">/{r.slug}</div>
                  </td>
                  <td className="px-3 py-2 text-[var(--muted)]">
                    {r.category ? CATEGORY_LABEL[r.category] ?? r.category : "—"}
                  </td>
                  <td className="px-3 py-2 text-[var(--muted)]">
                    {r.published_at ? formatDate(r.published_at) : "—"}
                  </td>
                  <td className="px-3 py-2 text-[var(--muted)]">
                    {r.translations && Object.keys(r.translations).length > 0
                      ? `${Object.keys(r.translations).length} ngôn ngữ`
                      : "chưa"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        r.status === "published"
                          ? "rounded bg-green-100 px-2 py-0.5 text-xs text-green-800"
                          : "rounded bg-[var(--bg-soft)] px-2 py-0.5 text-xs text-[var(--muted)]"
                      }
                    >
                      {r.status === "published"
                        ? "Đã đăng"
                        : r.status === "archived"
                          ? "Lưu trữ"
                          : "Nháp"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <PostActions id={r.id} status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
