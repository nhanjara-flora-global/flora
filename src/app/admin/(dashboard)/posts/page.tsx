import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  Cell,
  EmptyState,
  FilterTabs,
  Notice,
  PageHeader,
  Panel,
  POST_STATE_TONE,
  Row,
  Table,
} from "@/components/admin/ui";
import { getServiceClientResult } from "@/lib/admin/data";
import { postState, STATE_LABELS, type PostState } from "@/lib/admin/posts";
import { formatDate } from "@/lib/legacy";
import { categoryName, getNewsCategories } from "@/lib/news-categories";
import { PostActions } from "./post-actions";

export const metadata: Metadata = { title: "Bài viết" };

const STATES: PostState[] = ["published", "scheduled", "draft", "archived"];

type PostRow = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: string;
  published_at: string | null;
  updated_at: string | null;
  cover_url: string | null;
  translations: Record<string, unknown> | null;
};

/** null = chưa bật Supabase. Lỗi truy vấn trả về kèm message để hiện ra, chứ
 *  không lặng lẽ thành danh sách rỗng — dễ tưởng nhầm là "chưa có bài nào". */
async function listPosts(): Promise<{ rows: PostRow[]; error: string | null } | null> {
  const service = await getServiceClientResult();
  if (service.reason === "local") return null;
  if (service.reason === "config") return { rows: [], error: service.message };
  const { data, error } = await service.client
    .from("posts")
    .select("id, title, slug, category, status, published_at, updated_at, cover_url, translations")
    .order("updated_at", { ascending: false });
  if (error) console.error("[admin] listPosts:", error);
  return { rows: (data ?? []) as PostRow[], error: error?.message ?? null };
}

function Thumb({ src, title }: { src: string | null; title: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="h-11 w-16 shrink-0 rounded-md object-cover" />
  ) : (
    <span className="flex h-11 w-16 shrink-0 items-center justify-center rounded-md bg-[var(--bg-soft)] text-sm font-semibold text-[var(--brand)]">
      {title.slice(0, 1).toUpperCase()}
    </span>
  );
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; cat?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const status = STATES.find((s) => s === sp.status);
  const categories = await getNewsCategories();
  const categoryLabel = new Map(categories.map((c) => [c.slug, categoryName(c, "vi")]));
  const cat = categories.find((c) => c.slug === sp.cat)?.slug;
  const q = sp.q?.trim().slice(0, 60) ?? "";
  const result = await listPosts();

  const header = (
    <PageHeader
      eyebrow="Nội dung"
      title="Bài viết"
      description="Bài đăng ở mục Kiến thức. Viết tiếng Việt, hệ thống tự dịch khi đăng."
      action={
        <div className="flex flex-wrap gap-2">
          <Link
            href="/vi/knowledge"
            target="_blank"
            className="rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            Xem trên web ↗
          </Link>
          <Link
            href="/admin/post-categories"
            className="rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            Chuyên mục
          </Link>
          <Link
            href="/admin/posts/new"
            className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-2)]"
          >
            + Viết bài
          </Link>
        </div>
      }
    />
  );

  if (result === null) {
    return (
      <>
        {header}
        <Notice tone="warn" title="Chưa bật Supabase.">
          Chức năng đăng bài cần <code>DATA_SOURCE=supabase</code> và chạy{" "}
          <code>supabase/schema.sql</code> + <code>supabase/migrations/0001_news_posts.sql</code>.
          30 bài mẫu vẫn hiển thị từ file JSON.
        </Notice>
      </>
    );
  }
  if (result.error) {
    return (
      <>
        {header}
        <Notice tone="warn" title="Không đọc được bảng posts.">
          <p>{result.error}</p>
          <p className="mt-1">
            {result.error.includes("column") ? (
              <>
                Thiếu cột <code>category</code>/<code>translations</code> — chạy{" "}
                <code>supabase/migrations/0001_news_posts.sql</code> trong Supabase SQL Editor
                của đúng project mà site đang trỏ tới.
              </>
            ) : (
              <>
                Kiểm tra biến môi trường <code>NEXT_PUBLIC_SUPABASE_URL</code> và{" "}
                <code>SUPABASE_SERVICE_ROLE_KEY</code> trên Vercel, rồi redeploy.
              </>
            )}
          </p>
        </Notice>
      </>
    );
  }

  const term = q.toLowerCase();
  const all = result.rows.map((r) => ({ ...r, state: postState({ status: r.status, publishedAt: r.published_at }) }));
  const scoped = all.filter(
    (r) =>
      (!cat || r.category === cat) &&
      (!term || r.title.toLowerCase().includes(term) || r.slug.includes(term)),
  );
  const rows = scoped.filter((r) => !status || r.state === status);
  const count = (s?: PostState) => scoped.filter((r) => !s || r.state === s).length;

  return (
    <>
      {header}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          basePath="/admin/posts"
          active={status}
          params={{ q: q || undefined, cat }}
          options={[
            { label: "Tất cả", count: count() },
            ...STATES.filter((s) => s !== "archived" || count(s) > 0).map((s) => ({
              value: s,
              label: STATE_LABELS[s],
              count: count(s),
            })),
          ]}
        />
        <form action="/admin/posts" className="flex w-full max-w-md gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Tiêu đề hoặc đường dẫn…"
            aria-label="Tìm bài"
            className="min-w-0 flex-1 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
          />
          <select
            name="cat"
            defaultValue={cat ?? ""}
            aria-label="Chuyên mục"
            className="rounded-md border border-[var(--line)] bg-white px-2 py-2 text-sm outline-none focus:border-[var(--brand)]"
          >
            <option value="">Mọi chuyên mục</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {categoryLabel.get(c.slug)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            Lọc
          </button>
        </form>
      </div>

      <Panel bleed>
        {rows.length === 0 ? (
          all.length ? (
            <EmptyState title="Không có bài nào khớp bộ lọc" description="Thử đổi từ khoá, chuyên mục hoặc tab trạng thái." />
          ) : (
            <EmptyState title="Chưa có bài nào" description="Bấm “+ Viết bài” để bắt đầu." />
          )
        ) : (
          <>
            <Table head={["Bài", "Chuyên mục", "Trạng thái", "Dịch", "Ngày đăng", ""]}>
              {rows.map((r) => (
                <Row key={r.id}>
                  <Cell>
                    <Link href={`/admin/posts/${r.id}`} className="group flex items-center gap-3">
                      <Thumb src={r.cover_url} title={r.title} />
                      <span className="min-w-0">
                        <span className="line-clamp-2 font-medium group-hover:text-[var(--brand)]">{r.title}</span>
                        <span className="block truncate text-xs text-[var(--muted)]">/knowledge/{r.slug}</span>
                      </span>
                    </Link>
                  </Cell>
                  <Cell muted>{r.category ? (categoryLabel.get(r.category) ?? r.category) : "—"}</Cell>
                  <Cell>
                    <Badge label={STATE_LABELS[r.state]} tone={POST_STATE_TONE[r.state]} />
                  </Cell>
                  <Cell muted>
                    {r.translations && Object.keys(r.translations).length > 0
                      ? `${Object.keys(r.translations).length} ngôn ngữ`
                      : "chưa"}
                  </Cell>
                  <Cell muted>
                    {r.published_at ? formatDate(r.published_at) : "—"}
                    {r.updated_at && <span className="block text-xs">Sửa {formatDate(r.updated_at)}</span>}
                  </Cell>
                  <Cell align="right">
                    <PostActions id={r.id} status={r.status} />
                  </Cell>
                </Row>
              ))}
            </Table>
            <p className="border-t border-[var(--line)] px-5 py-3 text-sm text-[var(--muted)]">
              {rows.length} bài · Lên lịch = đã bấm đăng, tự hiện khi tới ngày đăng
            </p>
          </>
        )}
      </Panel>
    </>
  );
}
