"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ClipboardEvent as PasteEvent,
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
import {
  BLANK,
  BLOCK_NAMES,
  blocksToHtml,
  convertBlock,
  isImageSrc,
  isTextBlock,
  MAX_BLOCK_PRODUCTS,
  MAX_TABLE_COLS,
  MAX_TABLE_ROWS,
  NOTE_TITLE,
  parseYoutubeId,
  PRODUCTS_TITLE,
  safeHref,
  TEXT_TYPES,
  youtubeThumb,
  type BlockType,
  type PostBlock,
  type TextType,
} from "@/lib/post-blocks";
import { htmlToBlocks } from "@/lib/post-html";
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
  /** HTML đang lưu — trình soạn đọc thành khối khi mở. */
  content: string;
  coverUrl: string | null;
  seoTitle: string;
  seoDescription: string;
  translated: string[];
};

/** Sản phẩm chọn được trong khối "Sản phẩm". */
export type ProductPick = { slug: string; name: string; sku: string | null; image: string | null };

type Item = { k: number; b: PostBlock };
/** Ô chữ đang gõ — nút Đậm / Nghiêng / Link chèn ký hiệu vào đây. */
type Field = { el: HTMLTextAreaElement | HTMLInputElement; set: (v: string) => void };

const TARGET_LOCALES = locales.filter((l) => l !== "vi");
const IMG_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

let nextKey = 0;
const toItems = (blocks: PostBlock[]): Item[] => blocks.map((b) => ({ k: nextKey++, b }));

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

/** Tìm không dấu: "phan ga" khớp "Phân gà". */
const fold = (s: string) =>
  s.replace(/[đĐ]/g, "d").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Ô nhập nhiều dòng tự cao theo nội dung. */
function AutoText({
  value,
  onValue,
  remember,
  className,
  ...rest
}: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value"> & {
  value: string;
  onValue: (v: string) => void;
  remember?: (f: Field) => void;
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
      onFocus={(e) => remember?.({ el: e.currentTarget, set: onValue })}
      className={`pe-bare ${className ?? ""}`}
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

const subscribeNoop = () => () => {};

/** Đọc HTML thành khối cần DOMParser (không có khi dựng trên máy chủ) — chỉ dựng ở trình duyệt. */
export function PostEditor(props: {
  initial: EditorPost;
  categories: { slug: string; label: string }[];
  products: ProductPick[];
  siteUrl: string;
}) {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  if (!isClient) return <p className="text-sm text-[var(--muted)]">Đang tải trình soạn bài…</p>;
  return <Editor {...props} />;
}

function Editor({
  initial,
  categories,
  products,
  siteUrl,
}: {
  initial: EditorPost;
  categories: { slug: string; label: string }[];
  products: ProductPick[];
  siteUrl: string;
}) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [items, setItems] = useState<Item[]>(() => toItems(htmlToBlocks(initial.content)));
  const [active, setActive] = useState<number | null>(null);
  const [focusKey, setFocusKey] = useState<number | null>(null);
  const [publishAt, setPublishAt] = useState(toLocalInput(initial.publishedAt));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const coverInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const lastField = useRef<Field | null>(null);
  /** Khối ảnh đang bấm "Đổi ảnh" (null = chèn ảnh mới). */
  const replaceAt = useRef<number | null>(null);
  // Đồng hồ cho "Lên lịch" ↔ "Đã đăng": cập nhật mỗi 30 giây.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const blocks = items.map((x) => x.b);
  const content = blocksToHtml(blocks);
  const state = postState(v, now);
  const published = v.status === "published";
  const checks = postChecks({ ...v, content });
  const blocking = blockingChecks(checks);
  const scheduled = !!publishAt && new Date(publishAt).getTime() > now;
  const path = `/knowledge/${v.slug || slugify(v.title) || "…"}`;
  const bySlug = new Map(products.map((p) => [p.slug, p]));

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

  // ── Khối ─────────────────────────────────────────────────────────

  const setBlock = (k: number, b: PostBlock) => {
    setItems((xs) => xs.map((x) => (x.k === k ? { ...x, b } : x)));
    touch();
  };
  /** Chèn sau khối đang chọn (chưa chọn thì cuối bài). */
  const insert = (added: PostBlock[], at = active === null ? items.length : active + 1) => {
    const list = toItems(added);
    setItems((xs) => [...xs.slice(0, at), ...list, ...xs.slice(at)]);
    setActive(at + list.length - 1);
    setFocusKey(list[0]?.k ?? null);
    touch();
  };
  const move = (i: number, d: -1 | 1) => {
    setItems((xs) => {
      const a = [...xs];
      [a[i], a[i + d]] = [a[i + d], a[i]];
      return a;
    });
    setActive(i + d);
    touch();
  };
  const remove = (i: number) => {
    const b = items[i].b;
    const filled =
      b.type === "p" || b.type === "quote" || b.type === "note"
        ? b.text.trim()
        : b.type === "list"
          ? b.items.some((s) => s.trim())
          : b.type === "table"
            ? b.rows.flat().some((s) => s.trim())
            : b.type === "products"
              ? b.slugs.length
              : false;
    if (filled && !confirm(`Xoá khối "${BLOCK_NAMES[b.type]}" này?`)) return;
    setItems((xs) => xs.filter((_, j) => j !== i));
    setActive(null);
    touch();
  };
  const convert = (i: number, to: TextType) => {
    const it = items[i];
    if (!isTextBlock(it.b) || it.b.type === to) return;
    setBlock(it.k, convertBlock(it.b, to));
    setFocusKey(it.k);
  };

  /** Bôi đen chữ trong ô đang gõ rồi bọc ký hiệu (đậm, nghiêng, link). */
  const wrap = (before: string, after: string, placeholder: string) => {
    const f = lastField.current;
    if (!f || !f.el.isConnected) {
      setError("Bấm vào một đoạn văn (hoặc danh sách, ô bảng, hộp lưu ý) trước");
      return;
    }
    const { el } = f;
    const s = el.selectionStart ?? el.value.length;
    const e = el.selectionEnd ?? s;
    const sel = el.value.slice(s, e) || placeholder;
    f.set(el.value.slice(0, s) + before + sel + after + el.value.slice(e));
    setError("");
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };
  const addLink = () => {
    const url = prompt("Dán đường dẫn — trang trong web (vd /vi/products/…) hoặc link đầy đủ https://…");
    if (url === null) return;
    if (!safeHref(url)) {
      setError("Đường dẫn phải bắt đầu bằng / hoặc https://");
      return;
    }
    wrap("[", `](${url.trim()})`, "chữ bấm vào");
  };
  const remember = (f: Field) => {
    lastField.current = f;
  };

  /** Link ảnh ngoài (https://…) hoặc ảnh trong web (/images/…). */
  const askImageUrl = (): string | null => {
    const url = prompt("Dán link ảnh trực tiếp (https://…) hoặc đường dẫn ảnh trong web (/images/…)");
    if (url === null || !url.trim()) return null;
    if (!isImageSrc(url.trim())) {
      setError("Link ảnh phải bắt đầu bằng https:// hoặc / và không có dấu cách.");
      return null;
    }
    setError("");
    return url.trim();
  };

  async function uploadImages(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const list = [...files];
    const replacing = replaceAt.current;
    let at = active === null ? items.length : active + 1;
    for (const [n, f] of list.entries()) {
      setBusy(list.length > 1 ? `Đang tải ảnh ${n + 1}/${list.length}…` : "Đang tải ảnh…");
      try {
        const fd = new FormData();
        fd.append("file", await compressImage(f));
        const r = await uploadPostImage(fd);
        if (!r.ok) {
          setError(r.error);
          break;
        }
        if (replacing !== null) {
          const it = items[replacing];
          if (it?.b.type === "image") setBlock(it.k, { ...it.b, src: r.url });
          break;
        }
        insert([{ type: "image", src: r.url, caption: "" }], at++);
      } catch {
        setError("Không đọc được ảnh này, vui lòng chọn ảnh khác (JPG, PNG, WebP).");
        break;
      }
    }
    replaceAt.current = null;
    setBusy("");
  }

  /** Dán từ Word / Google Docs / web khác: giữ tiêu đề, đoạn, danh sách, bảng, ảnh, chữ đậm, link. */
  const pasteRich = (e: PasteEvent<HTMLDivElement>) => {
    const html = e.clipboardData.getData("text/html");
    const t = e.target;
    const host = t instanceof HTMLElement ? t.closest<HTMLElement>("[data-i]") : null;
    if (!html || !host || !(t instanceof HTMLTextAreaElement || t instanceof HTMLInputElement)) return;
    const pasted = htmlToBlocks(html, { headings: true });
    if (!pasted.length) return;
    const i = Number(host.dataset.i);
    const cur = items[i]?.b;
    if (!cur) return;
    const f = lastField.current;
    // Một đoạn dán vào ô đang gõ: chèn tại con trỏ (giữ đậm / nghiêng / link).
    if (pasted.length === 1 && pasted[0].type === "p" && f?.el === t) {
      e.preventDefault();
      const s = t.selectionStart ?? t.value.length;
      const end = t.selectionEnd ?? s;
      const text = pasted[0].text;
      f.set(t.value.slice(0, s) + text + t.value.slice(end));
      requestAnimationFrame(() => {
        t.focus();
        t.setSelectionRange(s + text.length, s + text.length);
      });
      return;
    }
    if (pasted.length === 1 && (pasted[0].type === "h2" || pasted[0].type === "h3")) return;
    e.preventDefault();
    const empty = (cur.type === "p" || cur.type === "h2" || cur.type === "h3") && !cur.text.trim();
    if (empty) setItems((xs) => xs.filter((_, j) => j !== i));
    insert(pasted, empty ? i : i + 1);
  };

  // ── Lưu ──────────────────────────────────────────────────────────

  const payload = (): PostInput => ({
    id: v.id,
    title: v.title,
    category: v.category,
    excerpt: v.excerpt,
    blocks,
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
    const url = askImageUrl();
    if (url) set("coverUrl", url);
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

  async function removePost() {
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

  const pickImages = () => {
    replaceAt.current = null;
    imageInput.current?.click();
  };
  const addImageLink = () => {
    const url = askImageUrl();
    if (url) insert([{ type: "image", src: url, caption: "" }]);
  };

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
      <input
        ref={imageInput}
        type="file"
        accept={IMG_ACCEPT}
        multiple
        hidden
        onChange={(e) => {
          const files = e.target.files;
          uploadImages(files).finally(() => {
            e.target.value = "";
          });
        }}
      />

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="pe-paper min-w-0 rounded-md border border-[var(--line)] bg-white">
          <div className="pe-tools" role="toolbar" aria-label="Thêm nội dung">
            <span className="pe-tg" data-g="text">
              <Tool title="Tiêu đề mục" disabled={!!busy} onClick={() => insert([BLANK.h2()])}>
                H2 Tiêu đề
              </Tool>
              <Tool title="Tiêu đề nhỏ" disabled={!!busy} onClick={() => insert([BLANK.h3()])}>
                H3 Tiêu đề nhỏ
              </Tool>
              <Tool title="Đoạn văn" disabled={!!busy} onClick={() => insert([BLANK.p()])}>
                ¶ Đoạn văn
              </Tool>
              <Tool title="Danh sách" disabled={!!busy} onClick={() => insert([BLANK.list()])}>
                • Danh sách
              </Tool>
              <Tool title="Trích dẫn" disabled={!!busy} onClick={() => insert([BLANK.quote()])}>
                ❝ Trích dẫn
              </Tool>
            </span>
            <span className="pe-tg" data-g="fmt">
              <Tool title="In đậm chữ đang chọn" disabled={!!busy} onClick={() => wrap("**", "**", "chữ đậm")}>
                <b>B</b> Đậm
              </Tool>
              <Tool title="In nghiêng chữ đang chọn" disabled={!!busy} onClick={() => wrap("*", "*", "chữ nghiêng")}>
                <i>I</i> Nghiêng
              </Tool>
              <Tool title="Chèn đường dẫn vào chữ đang chọn" disabled={!!busy} onClick={addLink}>
                🔗 Link
              </Tool>
            </span>
            <span className="pe-tg" data-g="media">
              <Tool title="Tải ảnh lên (chọn được nhiều ảnh)" disabled={!!busy} onClick={pickImages}>
                🖼 Ảnh
              </Tool>
              <Tool title="Chèn ảnh bằng link" disabled={!!busy} onClick={addImageLink}>
                🌐 Link ảnh
              </Tool>
              <Tool title="Chèn video YouTube" disabled={!!busy} onClick={() => insert([BLANK.video()])}>
                ▶ Video
              </Tool>
            </span>
            <span className="pe-tg" data-g="block">
              <Tool title="Bảng" disabled={!!busy} onClick={() => insert([BLANK.table()])}>
                ▦ Bảng
              </Tool>
              <Tool title="Hộp lưu ý" disabled={!!busy} onClick={() => insert([BLANK.note()])}>
                ⚠ Lưu ý
              </Tool>
            </span>
            <span className="pe-tg" data-g="shop">
              <Tool
                title="Khối sản phẩm — thẻ sản phẩm kèm nút báo giá"
                disabled={!!busy}
                onClick={() => insert([BLANK.products()])}
              >
                🛒 Sản phẩm
              </Tool>
            </span>
          </div>

          <div className="pe-doc" onPaste={pasteRich}>
            <AutoText
              value={v.title}
              onValue={(x) => set("title", x.replace(/\n/g, " "))}
              maxLength={150}
              placeholder="Tiêu đề bài viết"
              aria-label="Tiêu đề"
              className="pe-title"
            />
            <AutoText
              value={v.excerpt}
              onValue={(x) => set("excerpt", x)}
              maxLength={400}
              placeholder="Đoạn dẫn: 1–2 câu tóm tắt, trả lời thẳng câu hỏi chính của bài. Hiện trên thẻ bài và kết quả Google."
              aria-label="Đoạn dẫn"
              className="pe-lead"
            />

            {items.map((it, i) => (
              <div
                key={it.k}
                className="pe-block"
                data-i={i}
                data-type={it.b.type}
                data-active={active === i || undefined}
                onFocus={() => setActive(i)}
              >
                <div className="pe-block__bar">
                  {isTextBlock(it.b) ? (
                    <select
                      value={it.b.type}
                      aria-label="Đổi loại khối"
                      title="Đổi loại khối, giữ nguyên chữ"
                      onChange={(e) => convert(i, e.target.value as TextType)}
                    >
                      {TEXT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {BLOCK_NAMES[t]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>{BLOCK_NAMES[it.b.type]}</span>
                  )}
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Đưa lên" title="Đưa lên">
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={i === items.length - 1}
                    onClick={() => move(i, 1)}
                    aria-label="Đưa xuống"
                    title="Đưa xuống"
                  >
                    ↓
                  </button>
                  <button type="button" onClick={() => remove(i)} aria-label="Xoá khối" title="Xoá khối">
                    ✕
                  </button>
                </div>
                <BlockEditor
                  b={it.b}
                  set={(b) => setBlock(it.k, b)}
                  remember={remember}
                  autoFocus={focusKey === it.k}
                  onEnter={() => insert([BLANK.p()], i + 1)}
                  products={products}
                  bySlug={bySlug}
                  onReplaceImage={() => {
                    replaceAt.current = i;
                    imageInput.current?.click();
                  }}
                  onImageUrl={() => {
                    const url = askImageUrl();
                    if (url && it.b.type === "image") setBlock(it.k, { ...it.b, src: url });
                  }}
                />
              </div>
            ))}
            {!items.length && (
              <p className="pe-empty">
                Bài chưa có nội dung. Bấm các nút trên thanh công cụ để thêm đoạn văn, tiêu đề mục, ảnh,
                bảng… hoặc dán thẳng từ Word / Google Docs vào một ô.
              </p>
            )}

            <div className="pe-add">
              <span>Thêm vào cuối bài:</span>
              {(["p", "h2", "h3", "list", "table"] as BlockType[]).map((t) => (
                <button key={t} type="button" onClick={() => insert([BLANK[t]()], items.length)}>
                  + {BLOCK_NAMES[t]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setActive(items.length - 1);
                  pickImages();
                }}
              >
                + Ảnh
              </button>
            </div>
          </div>
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
            onClick={removePost}
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

/** Nút trên thanh công cụ — giữ con trỏ trong ô đang gõ khi bấm. */
function Tool({
  title,
  disabled,
  onClick,
  children,
}: {
  title: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// ── Ô nhập của từng loại khối ──────────────────────────────────────

const P_HINT = "Viết đoạn văn… Bôi đen chữ rồi bấm B (đậm), I (nghiêng), Link. Bỏ trống một dòng là sang đoạn mới.";

function BlockEditor({
  b,
  set,
  remember,
  autoFocus,
  onEnter,
  products,
  bySlug,
  onReplaceImage,
  onImageUrl,
}: {
  b: PostBlock;
  set: (b: PostBlock) => void;
  remember: (f: Field) => void;
  autoFocus: boolean;
  /** Enter ở ô tiêu đề → thêm đoạn văn ngay sau. */
  onEnter: () => void;
  products: ProductPick[];
  bySlug: Map<string, ProductPick>;
  onReplaceImage: () => void;
  onImageUrl: () => void;
}) {
  switch (b.type) {
    case "h2":
    case "h3":
      return (
        <input
          className={`pe-bare pe-${b.type}`}
          value={b.text}
          maxLength={150}
          autoFocus={autoFocus}
          aria-label={BLOCK_NAMES[b.type]}
          placeholder={b.type === "h2" ? "Tiêu đề mục — nên đặt dạng câu hỏi: “… là gì?”" : "Tiêu đề nhỏ"}
          onChange={(e) => set({ ...b, text: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              onEnter();
            }
          }}
        />
      );
    case "p":
      return (
        <AutoText
          className="pe-p"
          value={b.text}
          onValue={(text) => set({ ...b, text })}
          remember={remember}
          autoFocus={autoFocus}
          placeholder={P_HINT}
          aria-label="Đoạn văn"
        />
      );
    case "quote":
      return (
        <AutoText
          className="pe-p pe-quote"
          value={b.text}
          onValue={(text) => set({ ...b, text })}
          remember={remember}
          autoFocus={autoFocus}
          placeholder="Câu trích dẫn — lời chuyên gia, khách hàng…"
          aria-label="Trích dẫn"
        />
      );
    case "list":
      return (
        <>
          <span className="pe-seg">
            <button type="button" aria-pressed={!b.ordered} onClick={() => set({ ...b, ordered: false })}>
              • Dấu chấm
            </button>
            <button type="button" aria-pressed={b.ordered} onClick={() => set({ ...b, ordered: true })}>
              1. Đánh số
            </button>
          </span>
          <AutoText
            className="pe-p pe-list"
            value={b.items.join("\n")}
            onValue={(t) => set({ ...b, items: t.split("\n") })}
            remember={remember}
            autoFocus={autoFocus}
            placeholder={"Mỗi dòng một ý\nNhấn Enter để xuống ý mới"}
            aria-label="Danh sách"
          />
        </>
      );
    case "image":
      return (
        <>
          {b.src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.src} alt={b.caption || "Ảnh trong bài"} className="pe-img" />
          )}
          <span className="pe-row pe-row--img">
            <input
              className={`${field} pe-mini`}
              value={b.caption}
              maxLength={300}
              placeholder="Chú thích ảnh (không bắt buộc) — cũng là mô tả ảnh cho Google"
              aria-label="Chú thích ảnh"
              onChange={(e) => set({ ...b, caption: e.target.value })}
            />
            <button type="button" onClick={onReplaceImage}>
              Đổi ảnh
            </button>
            <button type="button" onClick={onImageUrl}>
              Dán link
            </button>
          </span>
        </>
      );
    case "video":
      return <VideoBlock b={b} set={set} autoFocus={autoFocus} />;
    case "table":
      return <TableBlock b={b} set={set} remember={remember} />;
    case "note":
      return (
        <div className="pe-note">
          <span aria-hidden className="pe-note__icon">
            ⚠
          </span>
          <div className="grid flex-1 gap-1">
            <input
              className="pe-bare pe-note__t"
              value={b.title}
              maxLength={80}
              placeholder={NOTE_TITLE}
              aria-label="Tiêu đề hộp lưu ý"
              onChange={(e) => set({ ...b, title: e.target.value })}
            />
            <AutoText
              className="pe-p"
              value={b.text}
              onValue={(text) => set({ ...b, text })}
              remember={remember}
              autoFocus={autoFocus}
              placeholder="Nội dung cần lưu ý: liều lượng, thời điểm bón, bảo hộ khi dùng…"
              aria-label="Nội dung lưu ý"
            />
          </div>
        </div>
      );
    case "products":
      return <ProductsBlock b={b} set={set} products={products} bySlug={bySlug} autoFocus={autoFocus} />;
  }
}

function VideoBlock({
  b,
  set,
  autoFocus,
}: {
  b: Extract<PostBlock, { type: "video" }>;
  set: (b: PostBlock) => void;
  autoFocus: boolean;
}) {
  const [text, setText] = useState(b.youtubeId ? `https://youtu.be/${b.youtubeId}` : "");
  return (
    <>
      <input
        className={`${field} pe-mini`}
        value={text}
        autoFocus={autoFocus}
        placeholder="Dán link YouTube (video thường hoặc Shorts)"
        aria-label="Link YouTube"
        onChange={(e) => {
          setText(e.target.value);
          set({ ...b, youtubeId: parseYoutubeId(e.target.value) ?? "" });
        }}
      />
      {text && !b.youtubeId && <span className="text-xs text-red-700">Link chưa đúng — dán link YouTube</span>}
      {b.youtubeId && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={youtubeThumb(b.youtubeId)} alt="Ảnh video" className="pe-yt" />
      )}
      <input
        className={`${field} pe-mini`}
        value={b.caption}
        maxLength={300}
        placeholder="Chú thích (không bắt buộc)"
        aria-label="Chú thích video"
        onChange={(e) => set({ ...b, caption: e.target.value })}
      />
    </>
  );
}

function TableBlock({
  b,
  set,
  remember,
}: {
  b: Extract<PostBlock, { type: "table" }>;
  set: (b: PostBlock) => void;
  remember: (f: Field) => void;
}) {
  const cols = b.rows[0]?.length ?? 0;
  const cell = (i: number, j: number, val: string) =>
    set({ ...b, rows: b.rows.map((r, x) => (x === i ? r.map((c, y) => (y === j ? val : c)) : r)) });
  return (
    <>
      <div className="pe-table">
        <table>
          <tbody>
            {b.rows.map((r, i) => (
              <tr key={i} data-head={(b.head && i === 0) || undefined}>
                {r.map((c, j) => (
                  <td key={j}>
                    <input
                      className="pe-bare"
                      value={c}
                      maxLength={500}
                      placeholder={b.head && i === 0 ? `Tiêu đề cột ${j + 1}` : ""}
                      aria-label={`Hàng ${i + 1}, cột ${j + 1}`}
                      onFocus={(e) => remember({ el: e.currentTarget, set: (val) => cell(i, j, val) })}
                      onChange={(e) => cell(i, j, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <span className="pe-row">
        <button
          type="button"
          disabled={b.rows.length >= MAX_TABLE_ROWS}
          onClick={() => set({ ...b, rows: [...b.rows, Array(cols).fill("")] })}
        >
          + Hàng
        </button>
        <button
          type="button"
          disabled={cols >= MAX_TABLE_COLS}
          onClick={() => set({ ...b, rows: b.rows.map((r) => [...r, ""]) })}
        >
          + Cột
        </button>
        <button type="button" disabled={b.rows.length <= 1} onClick={() => set({ ...b, rows: b.rows.slice(0, -1) })}>
          − Hàng cuối
        </button>
        <button type="button" disabled={cols <= 1} onClick={() => set({ ...b, rows: b.rows.map((r) => r.slice(0, -1)) })}>
          − Cột cuối
        </button>
        <label className="pe-check">
          <input type="checkbox" checked={b.head} onChange={(e) => set({ ...b, head: e.target.checked })} /> Hàng đầu là
          tiêu đề cột
        </label>
      </span>
    </>
  );
}

function ProductsBlock({
  b,
  set,
  products,
  bySlug,
  autoFocus,
}: {
  b: Extract<PostBlock, { type: "products" }>;
  set: (b: PostBlock) => void;
  products: ProductPick[];
  bySlug: Map<string, ProductPick>;
  autoFocus: boolean;
}) {
  const [find, setFind] = useState("");
  const terms = fold(find).split(/\s+/).filter(Boolean);
  const matches = terms.length
    ? products
        .filter((p) => !b.slugs.includes(p.slug) && terms.every((t) => fold(`${p.name} ${p.sku ?? ""}`).includes(t)))
        .slice(0, 8)
    : [];
  const moveTo = (i: number, d: -1 | 1) => {
    const a = [...b.slugs];
    [a[i], a[i + d]] = [a[i + d], a[i]];
    set({ ...b, slugs: a });
  };
  return (
    <>
      <input
        className="pe-bare pe-h3"
        value={b.title}
        maxLength={80}
        placeholder={PRODUCTS_TITLE}
        aria-label="Tiêu đề khối sản phẩm"
        onChange={(e) => set({ ...b, title: e.target.value })}
      />
      <div className="pe-prods">
        {b.slugs.map((s, i) => {
          const p = bySlug.get(s);
          return (
            <div key={s} className="pe-prod">
              {p?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" />
              ) : (
                <span className="pe-prod__ph" aria-hidden>
                  🌱
                </span>
              )}
              <span className="min-w-0">
                {p ? p.name : <s>{s}</s>}
                <small>{p ? (p.sku ?? s) : "Sản phẩm đã bị xoá hoặc đang ẩn — không hiện trong bài"}</small>
              </span>
              <span className="pe-prod__tools">
                <button type="button" disabled={i === 0} onClick={() => moveTo(i, -1)} aria-label="Lên trước">
                  ‹
                </button>
                <button
                  type="button"
                  disabled={i === b.slugs.length - 1}
                  onClick={() => moveTo(i, 1)}
                  aria-label="Ra sau"
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={() => set({ ...b, slugs: b.slugs.filter((x) => x !== s) })}
                  aria-label="Bỏ sản phẩm"
                >
                  ✕
                </button>
              </span>
            </div>
          );
        })}
      </div>
      {b.slugs.length < MAX_BLOCK_PRODUCTS && (
        <div className="grid gap-1">
          <input
            className={`${field} pe-mini`}
            value={find}
            autoFocus={autoFocus}
            onChange={(e) => setFind(e.target.value)}
            placeholder="Tìm sản phẩm để thêm (tên hoặc mã)"
            aria-label="Tìm sản phẩm"
          />
          {matches.map((p) => (
            <button
              key={p.slug}
              type="button"
              className="pe-match"
              onClick={() => {
                set({ ...b, slugs: [...b.slugs, p.slug] });
                setFind("");
              }}
            >
              + {p.name} {p.sku && <small>{p.sku}</small>}
            </button>
          ))}
          {terms.length > 0 && !matches.length && <span className={hint}>Không tìm thấy sản phẩm.</span>}
        </div>
      )}
      <small className={hint}>
        Tối đa {MAX_BLOCK_PRODUCTS} sản phẩm. Trong bài hiện thẻ có ảnh, tên và nút “Nhận báo giá”.
      </small>
    </>
  );
}
