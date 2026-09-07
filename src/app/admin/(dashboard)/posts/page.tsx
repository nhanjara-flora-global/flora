import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  Cell,
  EmptyState,
  Notice,
  PageHeader,
  Panel,
  Row,
  SearchForm,
  Table,
} from "@/components/admin/ui";
import { isLocalMode, listPosts, listSyncedPostSlugs } from "@/lib/admin/data";
import { localeLabels, localeShort } from "@/lib/i18n/config";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Bài viết" };

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const all = listPosts();
  const synced = await listSyncedPostSlugs();
  const unsynced = isLocalMode() ? [] : all.filter((post) => !synced.has(post.slug));

  const term = (q ?? "").trim().toLowerCase();
  const rows = term
    ? all.filter(
        (post) =>
          post.title.toLowerCase().includes(term) || post.slug.toLowerCase().includes(term),
      )
    : all;

  const untranslated = all.filter((post) => post.missing.length > 0).length;

  return (
    <>
      <PageHeader
        eyebrow="Nội dung"
        title="Bài viết"
        description="Tin bài trong wp-content.json, kèm tình trạng bản dịch."
      />

      {unsynced.length > 0 && (
        <Notice tone="warn" title={`${unsynced.length} bài chưa có trên Supabase`}>
          Chạy <code>npm run posts:sync</code> để đẩy bài từ{" "}
          <code>src/lib/data/wp-content.json</code> lên bảng <code>posts</code>.
        </Notice>
      )}

      {untranslated > 0 && (
        <Notice tone="info" title={`${untranslated} bài chưa dịch đủ 6 ngôn ngữ`}>
          Bản dịch nằm trong <code>src/lib/i18n/content/news-cache.json</code> — bài mới do
          GitHub Action <code>daily-news</code> tạo sẽ được dịch tự động.
        </Notice>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="body-sm text-[var(--muted)]">{all.length} bài viết</p>
        <SearchForm action="/admin/posts" placeholder="Tiêu đề hoặc slug…" defaultValue={q} />
      </div>

      <Panel bleed>
        {rows.length === 0 ? (
          <EmptyState title="Không tìm thấy bài viết" description="Thử một từ khoá khác." />
        ) : (
          <>
            <Table head={["Tiêu đề", "Ngày đăng", "Chuyên mục", "Ngôn ngữ gốc", "Bản dịch", "Supabase", ""]}>
              {rows.map((post) => (
                <Row key={post.slug}>
                  <Cell>
                    <span className="block max-w-md truncate font-medium">{post.title}</span>
                    <span className="block max-w-md truncate text-xs text-[var(--muted)]">
                      /{post.slug}
                    </span>
                  </Cell>
                  <Cell muted>{formatDate(post.date)}</Cell>
                  <Cell muted>{post.categories.join(", ") || "—"}</Cell>
                  <Cell muted>{localeLabels[post.sourceLocale]}</Cell>
                  <Cell>
                    {post.missing.length === 0 ? (
                      <Badge label="Đủ 6 ngôn ngữ" tone="green" />
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        <Badge
                          label={`Thiếu ${post.missing.length}`}
                          tone={post.translated.length === 0 ? "red" : "amber"}
                        />
                        <span className="text-xs text-[var(--muted)]">
                          {post.missing.map((locale) => localeShort[locale]).join(" · ")}
                        </span>
                      </div>
                    )}
                  </Cell>
                  <Cell>
                    {isLocalMode() ? (
                      <span className="text-xs text-[var(--muted)]">—</span>
                    ) : (
                      <Badge
                        label={synced.has(post.slug) ? "Đã đồng bộ" : "Chưa"}
                        tone={synced.has(post.slug) ? "green" : "amber"}
                      />
                    )}
                  </Cell>
                  <Cell align="right">
                    <Link
                      href={`/vi/news/${post.slug}`}
                      target="_blank"
                      className="text-sm text-[var(--muted)] transition hover:text-[var(--brand)]"
                    >
                      Xem ↗
                    </Link>
                  </Cell>
                </Row>
              ))}
            </Table>
            <p className="border-t border-[var(--line)] px-5 py-3 text-sm text-[var(--muted)]">
              {rows.length} bài viết
            </p>
          </>
        )}
      </Panel>
    </>
  );
}
