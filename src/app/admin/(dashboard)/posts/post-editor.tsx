"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import {
  deletePost,
  retranslatePost,
  savePost,
  type PostInput,
  type SavedPost,
} from "@/app/actions/posts";
import { uploadPostImage } from "@/app/actions/upload";
import { RichEditor } from "@/components/admin/rich-editor";
import { Badge, POST_STATE_TONE } from "@/components/admin/ui";
import {
  blockingChecks,
  postChecks,
  postState,
  SEO_MAX,
  slugInput,
  STATE_LABELS,
  type Intent,
  type PostStatus,
} from "@/lib/admin/posts";
import { compressImage } from "@/lib/compress-image";
import { localeLabels, locales } from "@/lib/i18n/config";
import { slugify } from "@/lib/slug.mjs";

export type EditorPost = {
  id?: string;
  slug: string;
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string | null;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  coverUrl: string | null;
  seoTitle: string;
  seoDescription: string;
  translated: string[];
};

const TARGET_LOCALES = locales.filter((l) => l !== "vi");
const IMG_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

const field =
  "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]";
const label = "mb-1 block text-sm font-medium";
const hint = "mt-1 block text-xs text-[var(--muted)]";
const btn =
  "rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-60";
const btnSm =
  "rounded-md border border-[var(--line)] bg-white px-2.5 py-1 text-xs font-medium hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-60";
const btnPrimary =
  "rounded-md bg-[var(--brand)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--brand-2)] disabled:opacity-60";

const pad = (n: number) => String(n).padStart(2, "0");
/** ISO → giá trị ô datetime-local theo giờ máy (người dùng ở VN). */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const fmt = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

/** Ô nhập nhiều dòng tự cao theo nội dung. */
function AutoText({
  value,
  onValue,
  className,
  ...rest
}: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value"> & {
  value: string;
  onValue: (v: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onValue(e.target.value)}
      className={`block w-full resize-none border-0 bg-transparent p-0 outline-none placeholder:text-[var(--muted)]/60 ${className ?? ""}`}
      {...rest}
    />
  );
}

function Card({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-white">
      <header className="flex items-center justify-between gap-2 border-b border-[var(--line)] px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {right}
      </header>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

export function PostEditor({
  initial,
  categories,
  siteUrl,
}: {
  initial: EditorPost;
  categories: { slug: string; label: string }[];
  siteUrl: string;
}) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [publishAt, setPublishAt] = useState(toLocalInput(initial.publishedAt));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const coverInput = useRef<HTMLInputElement>(null);
  // Đồng hồ cho "Lên lịch" ↔ "Đã đăng": cập nhật mỗi 30 giây.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const state = postState(v, now);
  const published = v.status === "published";
  const checks = postChecks(v);
  const blocking = blockingChecks(checks);
  const scheduled = !!publishAt && new Date(publishAt).getTime() > now;
  const path = `/knowledge/${v.slug || slugify(v.title) || "…"}`;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const touch = () => {
    setDirty(true);
    setMsg("");
  };
  const set = <K extends keyof EditorPost>(k: K, val: EditorPost[K]) => {
    setV((x) => ({ ...x, [k]: val }));
    touch();
  };

  const payload = (): PostInput => ({
    id: v.id,
    title: v.title,
    category: v.category,
    excerpt: v.excerpt,
    content: v.content,
    coverUrl: v.coverUrl,
    slug: !published && v.slug ? v.slug : undefined,
    seoTitle: v.seoTitle,
    seoDescription: v.seoDescription,
    publishAt: publishAt ? new Date(publishAt).toISOString() : null,
  });

  /** Lưu; bài mới lưu lần đầu thì đổi địa chỉ trang thành /admin/posts/<id> (không tải lại trang). */
  async function save(intent: Intent): Promise<SavedPost | null> {
    const r = await savePost(payload(), intent).catch(() => ({
      ok: false as const,
      error: "Mất kết nối, vui lòng thử lại.",
    }));
    if (!r.ok) {
      setError(r.error);
      return null;
    }
    setV((x) => ({ ...x, ...r.post, updatedAt: new Date().toISOString() }));
    setPublishAt(toLocalInput(r.post.publishedAt));
    if (!v.id) window.history.replaceState(null, "", `/admin/posts/${r.post.id}`);
    return r.post;
  }

  async function run(intent: Intent) {
    setError("");
    if (intent === "publish" && blocking.length) {
      setError(`Chưa đăng được: ${blocking.map((c) => c.label.toLowerCase()).join("; ")}`);
      return;
    }
    if (
      intent === "unpublish" &&
      state === "published" &&
      !confirm("Gỡ bài khỏi website? Bài trở về nháp, khách không xem được nữa.")
    ) {
      return;
    }
    const translating = TARGET_LOCALES.length > 0 && (intent === "publish" || (intent === "save" && published));
    setBusy(translating ? "Đang lưu và dịch bài…" : "Đang lưu…");
    const r = await save(intent);
    setBusy("");
    if (!r) return;
    setDirty(false);
    const st = postState(r);
    setMsg(
      st === "scheduled"
        ? `Đã lên lịch, bài tự hiện lúc ${fmt(r.publishedAt)}`
        : st === "published"
          ? intent === "publish"
            ? "Đã đăng lên website"
            : "Đã cập nhật"
          : intent === "unpublish"
            ? "Đã gỡ bài về nháp"
            : "Đã lưu nháp",
    );
  }

  async function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setBusy("Đang tải ảnh bìa…");
    try {
      const fd = new FormData();
      fd.append("file", await compressImage(file));
      const res = await uploadPostImage(fd);
      if (!res.ok) setError(res.error);
      else set("coverUrl", res.url);
    } catch {
      setError("Không đọc được ảnh này, vui lòng chọn ảnh khác (JPG, PNG, WebP).");
    } finally {
      setBusy("");
    }
  }

  function pasteCoverLink() {
    const url = prompt("Dán link ảnh trực tiếp (https://…) hoặc đường dẫn trong web (/images/…)");
    if (url === null || !url.trim()) return;
    if (!/^(https:\/\/|\/)\S+$/.test(url.trim())) {
      setError("Link ảnh phải bắt đầu bằng https:// hoặc / và không có dấu cách.");
      return;
    }
    setError("");
    set("coverUrl", url.trim());
  }

  async function retranslate() {
    if (!v.id) return;
    setError("");
    setBusy("Đang dịch lại…");
    const r = await retranslatePost(v.id).catch(() => ({
      ok: false as const,
      error: "Mất kết nối, vui lòng thử lại.",
    }));
    setBusy("");
    if (!r.ok) setError(r.error);
    else {
      setV((x) => ({ ...x, translated: r.translated }));
      setMsg("Đã dịch lại");
    }
  }

  async function remove() {
    if (!v.id) return;
    if (!confirm(`Xoá hẳn “${v.title}”? Không khôi phục được.\nMuốn tạm ẩn thì bấm Gỡ bài.`)) return;
    setBusy("Đang xoá…");
    const r = await deletePost(v.id).catch(() => ({ ok: false, error: "Mất kết nối." }));
    if (!r.ok) {
      setBusy("");
      setError(r.error ?? "Không xoá được, vui lòng thử lại.");
      return;
    }
    setDirty(false);
    router.push("/admin/posts");
    router.refresh();
  }

  const heading = v.id ? "Sửa bài viết" : "Viết bài mới";

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-[var(--muted)]">
            <Link href="/admin/posts" className="hover:text-[var(--brand)]">
              Bài viết
            </Link>
            {" / "}
            <span className="text-[var(--ink)]">{v.title || "Mới"}</span>
          </p>
          <h1 className="display-lg mt-1 text-[var(--ink)]">{heading}</h1>
        </div>
        {v.id && (
          <a
            href={state === "published" ? `/vi${path}` : `/admin/preview?id=${v.id}`}
            target="_blank"
            rel="noreferrer"
            className={btn}
            title={dirty ? "Xem bản đã lưu — lưu trước để thấy thay đổi mới nhất" : undefined}
          >
            {state === "published" ? "Xem trên web ↗" : "Xem trước ↗"}
          </a>
        )}
      </header>

      <input ref={coverInput} type="file" accept={IMG_ACCEPT} hidden onChange={onPickCover} />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="min-w-0 space-y-4 rounded-md border border-[var(--line)] bg-white p-5 md:p-8">
          <AutoText
            value={v.title}
            onValue={(x) => set("title", x.replace(/\n/g, " "))}
            maxLength={150}
            placeholder="Tiêu đề bài viết"
            aria-label="Tiêu đề"
            className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight"
          />
          <AutoText
            value={v.excerpt}
            onValue={(x) => set("excerpt", x)}
            maxLength={400}
            placeholder="Đoạn dẫn: 1–2 câu tóm tắt, trả lời thẳng câu hỏi chính của bài. Hiện dưới tiêu đề và trên thẻ bài."
            aria-label="Đoạn dẫn"
            className="text-lg text-[var(--muted)]"
          />
          <RichEditor value={v.content} onChange={(html) => set("content", html)} />
          <span className={hint}>
            Dán thẳng từ Word / Google Docs — đậm, nghiêng, tiêu đề, danh sách, bảng được giữ
            nguyên. Chèn ảnh bằng nút 🖼 (tải lên hoặc dán URL). Dùng H2 cho tiêu đề mục.
          </span>
        </section>

        <div className="space-y-4">
          <Card title="Xuất bản" right={<Badge label={STATE_LABELS[state]} tone={POST_STATE_TONE[state]} />}>
            {v.id && (
              <p className="text-xs text-[var(--muted)]">
                {state === "published" && v.publishedAt && <>Đăng lúc {fmt(v.publishedAt)}. </>}
                {state === "scheduled" && <>Tự hiện lúc {fmt(v.publishedAt)}. </>}
                {v.updatedAt && <>Sửa lần cuối {fmt(v.updatedAt)}.</>}
              </p>
            )}
            <label className="block">
              <span className={label}>Chuyên mục</span>
              <select value={v.category} onChange={(e) => set("category", e.target.value)} className={field}>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={label}>Lịch đăng</span>
              <input
                type="datetime-local"
                value={publishAt}
                onChange={(e) => {
                  setPublishAt(e.target.value);
                  touch();
                }}
                className={field}
              />
              <span className={hint}>
                {publishAt
                  ? scheduled
                    ? "Giờ ở tương lai: bài tự hiện đúng giờ này (trễ tối đa ~5 phút)."
                    : "Ngày đăng hiện trên bài."
                  : "Để trống: đăng ngay khi bấm Đăng bài."}
              </span>
            </label>
          </Card>

          <Card title="Ảnh bìa">
            {v.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={v.coverUrl}
                alt="Ảnh bìa"
                className="aspect-video w-full rounded-md border border-[var(--line)] object-cover"
              />
            ) : (
              <p className="text-xs text-[var(--muted)]">
                Ảnh ngang 16:9, hiện đầu bài và trên thẻ bài. Chưa có thì hiện ảnh minh họa theo
                chuyên mục.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" className={btnSm} disabled={!!busy} onClick={() => coverInput.current?.click()}>
                {v.coverUrl ? "Đổi ảnh" : "Tải ảnh bìa"}
              </button>
              <button type="button" className={btnSm} disabled={!!busy} onClick={pasteCoverLink}>
                Dán link ảnh
              </button>
              {v.coverUrl && (
                <button type="button" className={btnSm} disabled={!!busy} onClick={() => set("coverUrl", null)}>
                  Bỏ ảnh bìa
                </button>
              )}
            </div>
          </Card>

          {TARGET_LOCALES.length > 0 && (
            <Card title="Bản dịch">
              <ul className="space-y-1 text-sm">
                {TARGET_LOCALES.map((l) => {
                  const ok = v.translated.includes(l);
                  return (
                    <li key={l} className="flex items-center justify-between">
                      <span>{localeLabels[l]}</span>
                      <span className={ok ? "text-emerald-700" : "text-[var(--muted)]"}>
                        {ok ? "✓ Đã dịch" : "Chưa dịch"}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-[var(--muted)]">
                Viết tiếng Việt; khi bấm Đăng bài / Cập nhật hệ thống tự dịch máy (mất vài giây).
              </p>
              {v.id && (
                <button
                  type="button"
                  className={btnSm}
                  disabled={!!busy || dirty}
                  onClick={retranslate}
                  title={dirty ? "Lưu bài trước — Dịch lại dùng bản đã lưu" : undefined}
                >
                  Dịch lại
                </button>
              )}
            </Card>
          )}

          <Card title="SEO & đường dẫn">
            {published ? (
              <div>
                <span className={label}>Đường dẫn</span>
                <p className="break-all text-sm">{path}</p>
                <span className={hint}>
                  Bài đã đăng giữ nguyên đường dẫn để không hỏng link đã chia sẻ. Cần đổi thì Gỡ
                  bài về nháp trước.
                </span>
              </div>
            ) : (
              <label className="block">
                <span className={label}>Đường dẫn</span>
                <input
                  value={v.slug}
                  maxLength={90}
                  placeholder={slugify(v.title) || "tu-tao-theo-tieu-de"}
                  onChange={(e) => set("slug", slugInput(e.target.value))}
                  className={field}
                />
                <span className={`${hint} break-all`}>{path} · Để trống thì tự tạo theo tiêu đề.</span>
              </label>
            )}
            <label className="block">
              <span className={label}>Tiêu đề SEO</span>
              <input
                value={v.seoTitle}
                maxLength={150}
                placeholder={v.title || "Để trống = tiêu đề bài"}
                onChange={(e) => set("seoTitle", e.target.value)}
                className={field}
              />
              <span className={hint}>{(v.seoTitle || v.title).length}/70 ký tự Google hiện được</span>
            </label>
            <label className="block">
              <span className={label}>Mô tả SEO</span>
              <textarea
                rows={3}
                value={v.seoDescription}
                maxLength={300}
                placeholder="1–2 câu hiện dưới tiêu đề trên Google. Để trống thì dùng đoạn dẫn."
                onChange={(e) => set("seoDescription", e.target.value)}
                className={field}
              />
              <span className={hint}>
                {v.seoDescription.length}/{SEO_MAX} ký tự
              </span>
            </label>
            <div className="rounded-md bg-[var(--bg-soft)] p-3" aria-label="Xem trước trên Google">
              <small className="block truncate text-xs text-[var(--muted)]">
                {siteUrl.replace(/^https?:\/\//, "")}/vi{path}
              </small>
              <b className="block text-base font-medium leading-snug text-[#1a0dab]">
                {(v.seoTitle || v.title || "Tiêu đề bài viết").slice(0, 70)}
              </b>
              <span className="block text-sm leading-snug text-[var(--muted)]">
                {(v.seoDescription || v.excerpt || "Mô tả bài viết…").slice(0, SEO_MAX)}
              </span>
            </div>
          </Card>

          <Card title="Kiểm tra trước khi đăng">
            <ul className="space-y-1.5 text-sm">
              {checks.map((c) => (
                <li key={c.label} className={`flex gap-2 ${c.ok ? "text-emerald-800" : "text-amber-800"}`}>
                  <span aria-hidden className="shrink-0">
                    {c.ok ? "✓" : "!"}
                  </span>
                  <span>
                    {c.label}
                    {!c.ok && c.required && <b> · bắt buộc</b>}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 -mx-5 -mb-5 mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[var(--line)] bg-white/95 px-5 py-3 backdrop-blur md:-mx-8 md:-mb-8 md:px-8">
        <span className="mr-auto text-sm" role={error ? "alert" : "status"}>
          {error ? (
            <span className="text-red-700">{error}</span>
          ) : (
            <span className="text-[var(--muted)]">
              {busy || msg || (dirty ? "Có thay đổi chưa lưu" : v.id ? "Đã lưu" : "Bài mới chưa lưu")}
            </span>
          )}
        </span>
        {v.id && (
          <button
            type="button"
            disabled={!!busy}
            onClick={remove}
            className="rounded-md px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Xoá
          </button>
        )}
        {published ? (
          <>
            <button type="button" className={btn} disabled={!!busy} onClick={() => run("unpublish")}>
              Gỡ bài
            </button>
            <button type="button" className={btnPrimary} disabled={!!busy} onClick={() => run("save")}>
              Cập nhật
            </button>
          </>
        ) : (
          <>
            <button type="button" className={btn} disabled={!!busy} onClick={() => run("save")}>
              Lưu nháp
            </button>
            <button type="button" className={btnPrimary} disabled={!!busy} onClick={() => run("publish")}>
              {scheduled ? "Lên lịch đăng" : "Đăng bài"}
            </button>
          </>
        )}
      </div>
    </>
  );
}
