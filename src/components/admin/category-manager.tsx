"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCategory, moveCategory, saveCategory } from "@/app/actions/post-categories";
import { Cell, Row, Table } from "@/components/admin/ui";
import {
  CATEGORY_DESC_MAX,
  CATEGORY_NAME_MAX,
  CATEGORY_SLUG_MAX,
} from "@/lib/admin/post-categories";
import type { CategoryAdmin } from "@/lib/admin/post-categories-data";
import { slugInput } from "@/lib/admin/posts";
import { ADMIN_LOCALES } from "@/lib/admin/site";
import { localeLabels, type Locale } from "@/lib/i18n/config";

const field =
  "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)] disabled:bg-[var(--bg-soft)]";
const labelCls = "mb-1 block text-sm font-medium";
const hint = "mt-1 block text-xs text-[var(--muted)]";
const btn =
  "rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-60";
const btnSm =
  "rounded-md border border-[var(--line)] bg-white px-2.5 py-1 text-xs font-medium hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-40";
const btnPrimary =
  "rounded-md bg-[var(--brand)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--brand-2)] disabled:opacity-60";
const btnDanger =
  "rounded-md bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800 disabled:opacity-60";

type Draft = {
  /** null = thêm mới. */
  original: string | null;
  slug: string;
  /** Người dùng đã tự sửa ô đường dẫn → thôi tự điền theo tên. */
  slugTouched: boolean;
  names: Partial<Record<Locale, string>>;
  descriptions: Partial<Record<Locale, string>>;
  relatedProduct: string;
};

const emptyDraft = (): Draft => ({
  original: null,
  slug: "",
  slugTouched: false,
  names: {},
  descriptions: {},
  relatedProduct: "",
});

const fromCategory = (c: CategoryAdmin): Draft => ({
  original: c.slug,
  slug: c.slug,
  slugTouched: true,
  names: { ...c.names },
  descriptions: { ...c.descriptions },
  relatedProduct: c.relatedProduct ?? "",
});

const autoSlug = (name: string) => slugInput(name).slice(0, CATEGORY_SLUG_MAX).replace(/-+$/, "");

export function CategoryManager({
  categories,
  products,
  canSave,
}: {
  categories: CategoryAdmin[];
  products: { slug: string; name: string }[];
  /** false khi chưa bật Supabase / chưa chạy migration. */
  canSave: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [moveTo, setMoveTo] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const productName = new Map(products.map((p) => [p.slug, p.name]));
  const viName = (c: CategoryAdmin) => c.names.vi || c.slug;

  function run(action: () => Promise<{ ok: true; note?: string } | { ok: false; error: string }>, done: string) {
    setError("");
    setNotice("");
    startTransition(async () => {
      const res = await action();
      if (!res.ok) return setError(res.error);
      setNotice(res.note ? `${done} ${res.note}` : done);
      setDraft(null);
      setDeleting(null);
      router.refresh();
    });
  }

  function save() {
    if (!draft) return;
    const isNew = draft.original === null;
    run(
      () =>
        saveCategory({
          original: draft.original,
          slug: draft.slug,
          names: draft.names,
          descriptions: draft.descriptions,
          relatedProduct: draft.relatedProduct,
        }),
      isNew ? "Đã thêm chuyên mục." : "Đã lưu chuyên mục.",
    );
  }

  function startDelete(c: CategoryAdmin) {
    setDraft(null);
    setError("");
    setNotice("");
    setDeleting(c.slug);
    setMoveTo(categories.find((x) => x.slug !== c.slug)?.slug ?? "");
  }

  const setName = (l: Locale, v: string) =>
    setDraft((d) => {
      if (!d) return d;
      const next = { ...d, names: { ...d.names, [l]: v } };
      if (l === "vi" && d.original === null && !d.slugTouched) next.slug = autoSlug(v);
      return next;
    });
  const setDesc = (l: Locale, v: string) =>
    setDraft((d) => (d ? { ...d, descriptions: { ...d.descriptions, [l]: v } } : d));

  return (
    <div className="space-y-6">
      {(error || notice) && (
        <p
          role={error ? "alert" : "status"}
          className={`rounded-md border px-4 py-3 text-sm ${
            error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error || notice}
        </p>
      )}

      {draft ? (
        <section className="rounded-md border border-[var(--line)] bg-white p-5" aria-label="Sửa chuyên mục">
          <h2 className="display-sm mb-4 text-[var(--ink)]">
            {draft.original === null ? "Thêm chuyên mục" : `Sửa “${draft.names.vi || draft.original}”`}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {ADMIN_LOCALES.map((l) => (
              <label key={l} className="block">
                <span className={labelCls}>
                  Tên ({localeLabels[l]}){l === "vi" && " *"}
                </span>
                <input
                  className={field}
                  value={draft.names[l] ?? ""}
                  maxLength={CATEGORY_NAME_MAX}
                  onChange={(e) => setName(l, e.target.value)}
                  placeholder={l === "vi" ? "VD: Phân bón hữu cơ" : "Để trống = tự dịch khi lưu"}
                  autoFocus={l === "vi"}
                />
              </label>
            ))}

            <label className="block md:col-span-2">
              <span className={labelCls}>Đường dẫn</span>
              {draft.original === null ? (
                <input
                  className={field}
                  value={draft.slug}
                  maxLength={CATEGORY_SLUG_MAX}
                  onChange={(e) => setDraft({ ...draft, slug: slugInput(e.target.value), slugTouched: true })}
                  placeholder="tự tạo theo tên tiếng Việt"
                />
              ) : (
                <input className={field} value={draft.slug} disabled />
              )}
              <span className={hint}>
                /vi/knowledge/category/{draft.slug || "…"}
                {draft.original !== null && " · đường dẫn giữ nguyên sau khi tạo để link cũ không bị hỏng"}
              </span>
            </label>

            {ADMIN_LOCALES.map((l) => (
              <label key={l} className="block">
                <span className={labelCls}>Giới thiệu ({localeLabels[l]})</span>
                <textarea
                  className={`${field} min-h-24`}
                  value={draft.descriptions[l] ?? ""}
                  maxLength={CATEGORY_DESC_MAX}
                  onChange={(e) => setDesc(l, e.target.value)}
                  placeholder={l === "vi" ? "1–2 câu nói chuyên mục viết về gì" : "Để trống = tự dịch khi lưu"}
                />
                <span className={hint}>
                  {(draft.descriptions[l] ?? "").length}/{CATEGORY_DESC_MAX} · hiện dưới tiêu đề trang chuyên mục và
                  làm mô tả trên Google (nên 50–160 ký tự)
                </span>
              </label>
            ))}

            <label className="block md:col-span-2">
              <span className={labelCls}>Sản phẩm liên quan</span>
              <select
                className={field}
                value={draft.relatedProduct}
                onChange={(e) => setDraft({ ...draft, relatedProduct: e.target.value })}
              >
                <option value="">— Không hiện hộp sản phẩm —</option>
                {products.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
                {draft.relatedProduct && !productName.has(draft.relatedProduct) && (
                  <option value={draft.relatedProduct}>{draft.relatedProduct} (không còn bán)</option>
                )}
              </select>
              <span className={hint}>Hộp “Sản phẩm liên quan” ở cột phải của mọi bài thuộc chuyên mục này.</span>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className={btnPrimary} onClick={save} disabled={pending || !canSave}>
              {pending ? "Đang lưu…" : draft.original === null ? "Thêm chuyên mục" : "Lưu"}
            </button>
            <button type="button" className={btn} onClick={() => setDraft(null)} disabled={pending}>
              Huỷ
            </button>
          </div>
        </section>
      ) : (
        <div>
          <button
            type="button"
            className={btnPrimary}
            onClick={() => {
              setDeleting(null);
              setError("");
              setNotice("");
              setDraft(emptyDraft());
            }}
            disabled={!canSave}
          >
            + Thêm chuyên mục
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-md border border-[var(--line)] bg-white">
        <Table head={["Thứ tự", "Chuyên mục", "Giới thiệu", "Sản phẩm liên quan", "Bài", ""]}>
          {categories.map((c, i) => {
            const posts = c.dbPosts + c.seedOnlyPosts;
            return (
              <Row key={c.slug}>
                <Cell>
                  <span className="flex gap-1">
                    <button
                      type="button"
                      className={btnSm}
                      aria-label={`Đưa “${viName(c)}” lên`}
                      disabled={!canSave || pending || i === 0}
                      onClick={() => run(() => moveCategory(c.slug, "up"), "Đã đổi thứ tự.")}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={btnSm}
                      aria-label={`Đưa “${viName(c)}” xuống`}
                      disabled={!canSave || pending || i === categories.length - 1}
                      onClick={() => run(() => moveCategory(c.slug, "down"), "Đã đổi thứ tự.")}
                    >
                      ↓
                    </button>
                  </span>
                </Cell>
                <Cell>
                  <span className="block font-medium">{viName(c)}</span>
                  <span className="block text-xs text-[var(--muted)]">
                    {c.names.en || <span className="text-amber-700">chưa có tên tiếng Anh</span>}
                  </span>
                  <a
                    href={`/vi/knowledge/category/${c.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-[var(--muted)] hover:text-[var(--brand)]"
                  >
                    /knowledge/category/{c.slug} ↗
                  </a>
                </Cell>
                <Cell muted>
                  <span className="line-clamp-2 max-w-64 text-xs">{c.descriptions.vi || "—"}</span>
                </Cell>
                <Cell muted>
                  {c.relatedProduct ? (productName.get(c.relatedProduct) ?? `${c.relatedProduct} (không còn bán)`) : "—"}
                </Cell>
                <Cell>
                  <Link href={`/admin/posts?cat=${c.slug}`} className="hover:text-[var(--brand)]">
                    {posts}
                  </Link>
                </Cell>
                <Cell align="right">
                  <span className="inline-flex gap-1">
                    <button
                      type="button"
                      className={btnSm}
                      disabled={!canSave || pending}
                      onClick={() => {
                        setDeleting(null);
                        setError("");
                        setNotice("");
                        setDraft(fromCategory(c));
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className={btnSm}
                      disabled={!canSave || pending || categories.length <= 1}
                      onClick={() => startDelete(c)}
                    >
                      Xoá
                    </button>
                  </span>
                </Cell>
              </Row>
            );
          })}
        </Table>
      </section>

      {deleting &&
        (() => {
          const c = categories.find((x) => x.slug === deleting);
          if (!c) return null;
          const others = categories.filter((x) => x.slug !== c.slug);
          return (
            <section
              className="rounded-md border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900"
              aria-label="Xoá chuyên mục"
            >
              <p className="font-semibold">Xoá chuyên mục “{viName(c)}”?</p>
              <p className="mt-1">
                Trang /knowledge/category/{c.slug} sẽ không còn và mục này biến mất khỏi menu.
              </p>
              {c.seedOnlyPosts > 0 ? (
                <p className="mt-3">
                  Còn {c.seedOnlyPosts} bài mẫu trong file chưa có trong database nên không chuyển được. Chạy{" "}
                  <code>npm run posts:sync</code> trước rồi xoá lại.
                </p>
              ) : (
                c.dbPosts > 0 && (
                  <label className="mt-3 block max-w-sm">
                    <span className={labelCls}>Chuyển {c.dbPosts} bài sang</span>
                    <select className={field} value={moveTo} onChange={(e) => setMoveTo(e.target.value)}>
                      {others.map((x) => (
                        <option key={x.slug} value={x.slug}>
                          {viName(x)}
                        </option>
                      ))}
                    </select>
                  </label>
                )
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={btnDanger}
                  disabled={pending || c.seedOnlyPosts > 0}
                  onClick={() =>
                    run(() => deleteCategory(c.slug, c.dbPosts > 0 ? moveTo : null), "Đã xoá chuyên mục.")
                  }
                >
                  {pending ? "Đang xoá…" : c.dbPosts > 0 ? "Chuyển bài và xoá" : "Xoá chuyên mục"}
                </button>
                <button type="button" className={btn} onClick={() => setDeleting(null)} disabled={pending}>
                  Huỷ
                </button>
              </div>
            </section>
          );
        })()}

      <p className="text-xs text-[var(--muted)]">
        Thứ tự ở đây là thứ tự trên menu Kiến thức và các cột chuyên mục ở trang chủ. Đổi tên không đổi đường dẫn.
        Web cập nhật ngay sau khi lưu.
      </p>
    </div>
  );
}
