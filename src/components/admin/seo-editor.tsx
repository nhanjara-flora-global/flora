"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { resetSeo, saveSeo } from "@/app/actions/site";
import { uploadPostImage } from "@/app/actions/upload";
import { SEO_DESC_MAX, SEO_DESC_MIN, SEO_TITLE_MAX, viDateTime } from "@/lib/admin/site";
import type { LiveSeo } from "@/lib/admin/site-data";
import { compressImage } from "@/lib/compress-image";

const IMG_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

const field =
  "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]";
const labelCls = "mb-1 block text-sm font-medium";
const hint = "mt-1 block text-xs text-[var(--muted)]";
const btn =
  "rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-60";
const btnSm =
  "rounded-md border border-[var(--line)] bg-white px-2.5 py-1 text-xs font-medium hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-60";
const btnPrimary =
  "rounded-md bg-[var(--brand)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--brand-2)] disabled:opacity-60";

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-white">
      <header className="border-b border-[var(--line)] px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
      </header>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

/** Đếm ký tự kèm màu: xanh = vừa, vàng = nên sửa. */
function Count({ n, min, max }: { n: number; min?: number; max: number }) {
  const ok = n > 0 && n <= max && (!min || n >= min);
  return (
    <span className={ok ? "text-emerald-700" : n ? "text-amber-700" : ""}>
      {n} ký tự {min ? `(nên ${min}–${max})` : `(Google hiện khoảng ${max})`}
    </span>
  );
}

export function SeoEditor({
  path,
  isHome,
  siteUrl,
  canSave,
  live,
  postEditHref,
  initial,
}: {
  path: string;
  isHome: boolean;
  siteUrl: string;
  canSave: boolean;
  live: LiveSeo | null;
  postEditHref: string | null;
  initial: { title: string; description: string; imageUrl: string; noindex: boolean; updatedAt: string } | null;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [noindex, setNoindex] = useState(initial?.noindex ?? false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const touch = () => {
    setDirty(true);
    setNotice("");
  };

  // Chưa đặt tay thì "Google đang thấy" chính là bản tự tạo → dùng làm chữ mờ gợi ý.
  const autoTitle = !initial?.title ? live?.title ?? "" : "";
  const autoDesc = !initial?.description ? live?.description ?? "" : "";
  const shownTitle = title.trim() || live?.title || "";
  const shownDesc = description.trim() || live?.description || "";
  const shownImage = imageUrl.trim() || live?.image || "";

  async function save() {
    setError("");
    setNotice("");
    setBusy("Đang lưu…");
    const res = await saveSeo({ path, title, description, imageUrl, noindex }).catch(() => ({
      ok: false as const,
      error: "Mất kết nối — thử lại.",
    }));
    setBusy("");
    if (!res.ok) return setError(res.error);
    setDirty(false);
    setNotice("Đã lưu — trang và sitemap cập nhật ngay.");
    router.refresh();
  }

  async function reset() {
    if (!confirm("Xoá SEO đặt tay của trang này và quay về bản web tự tạo?")) return;
    setError("");
    setBusy("Đang xoá…");
    const res = await resetSeo(path).catch(() => ({ ok: false as const, error: "Mất kết nối — thử lại." }));
    setBusy("");
    if (!res.ok) return setError(res.error);
    setTitle("");
    setDescription("");
    setImageUrl("");
    setNoindex(false);
    setDirty(false);
    setNotice("Đã quay về bản tự tạo.");
    router.refresh();
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setBusy("Đang tải ảnh…");
    try {
      const fd = new FormData();
      fd.append("file", await compressImage(file, 1600));
      const res = await uploadPostImage(fd);
      if (!res.ok) setError(res.error);
      else {
        setImageUrl(res.url);
        touch();
      }
    } catch {
      setError("Không đọc được ảnh này, vui lòng chọn ảnh khác (JPG, PNG, WebP).");
    } finally {
      setBusy("");
    }
  }

  function pasteImageLink() {
    const url = prompt("Dán link ảnh trực tiếp (https://…) hoặc đường dẫn trong web (/images/…)");
    if (url === null || !url.trim()) return;
    if (!/^(https:\/\/|\/)\S+$/.test(url.trim())) {
      setError("Link ảnh phải bắt đầu bằng https:// hoặc / và không có dấu cách.");
      return;
    }
    setError("");
    setImageUrl(url.trim());
    touch();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        {postEditHref && (
          <p className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            Đây là bài viết — bài còn có ô <b>Tiêu đề SEO / Mô tả SEO</b> trong{" "}
            <a href={postEditHref} className="font-medium underline">
              trình soạn bài
            </a>
            . Ô ở đây được ưu tiên hơn; để trống thì dùng ô trong bài.
          </p>
        )}
        <Card title="Hiện trên Google">
          <label className="block">
            <span className={labelCls}>Tiêu đề Google</span>
            <input
              value={title}
              maxLength={150}
              placeholder={autoTitle || "Để trống = tiêu đề web tự tạo"}
              onChange={(e) => {
                setTitle(e.target.value);
                touch();
              }}
              className={field}
            />
            <span className={hint}>
              <Count n={shownTitle.length} max={SEO_TITLE_MAX} /> · Tiêu đề đặt tay là tiêu đề đầy đủ, web
              không nối thêm “| Flora Global”.
            </span>
          </label>
          <label className="block">
            <span className={labelCls}>Mô tả Google</span>
            <textarea
              rows={3}
              value={description}
              maxLength={320}
              placeholder={autoDesc || "1–2 câu hiện dưới tiêu đề trên Google. Để trống = mô tả web tự tạo."}
              onChange={(e) => {
                setDescription(e.target.value);
                touch();
              }}
              className={field}
            />
            <span className={hint}>
              <Count n={shownDesc.length} min={SEO_DESC_MIN} max={SEO_DESC_MAX} />
            </span>
          </label>
          <div className="rounded-md bg-[var(--bg-soft)] p-3" aria-label="Xem trước trên Google">
            <small className="block truncate text-xs text-[var(--muted)]">
              {siteUrl.replace(/^https?:\/\//, "")}
              {path}
            </small>
            <b className="block text-base font-medium leading-snug text-[#1a0dab]">
              {shownTitle.length > 70 ? `${shownTitle.slice(0, 68)}…` : shownTitle || "Tiêu đề trang"}
            </b>
            <span className="block text-sm leading-snug text-[var(--muted)]">
              {shownDesc.length > SEO_DESC_MAX ? `${shownDesc.slice(0, SEO_DESC_MAX - 2)}…` : shownDesc || "Mô tả trang…"}
            </span>
          </div>
        </Card>

        <Card title="Ảnh khi chia sẻ (Facebook, Zalo…)">
          {shownImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- xem nhanh, có thể là link ngoài
            <img src={shownImage} alt="" className="aspect-[1200/630] w-full max-w-md rounded-md object-cover" />
          ) : (
            <p className="text-sm text-[var(--muted)]">Chưa đọc được ảnh chia sẻ hiện tại.</p>
          )}
          <p className="text-xs text-[var(--muted)]">
            {imageUrl ? "Ảnh đặt tay." : "Đang dùng ảnh web tự chọn."} Nên dùng ảnh 1200×630.
          </p>
          <div className="flex flex-wrap gap-2">
            <label className={`${btnSm} cursor-pointer`}>
              Tải ảnh lên
              <input type="file" accept={IMG_ACCEPT} onChange={onPickImage} className="sr-only" disabled={!!busy || !canSave} />
            </label>
            <button type="button" onClick={pasteImageLink} className={btnSm}>
              Dán link ảnh
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={() => {
                  setImageUrl("");
                  touch();
                }}
                className={btnSm}
              >
                Dùng ảnh tự chọn
              </button>
            )}
          </div>
        </Card>

        <Card title="Google đang thấy">
          {live ? (
            <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[140px_1fr]">
              <dt className="text-[var(--muted)]">Mã trả về</dt>
              <dd>{live.status === 200 ? "200 — trang mở bình thường" : live.status}</dd>
              <dt className="text-[var(--muted)]">Tiêu đề</dt>
              <dd className="break-words">{live.title ?? "—"}</dd>
              <dt className="text-[var(--muted)]">Mô tả</dt>
              <dd className="break-words">{live.description ?? "—"}</dd>
              <dt className="text-[var(--muted)]">Robots</dt>
              <dd>{live.robots ?? "index, follow (mặc định)"}</dd>
              <dt className="text-[var(--muted)]">Canonical</dt>
              <dd className="break-all">{live.canonical ?? "—"}</dd>
            </dl>
          ) : (
            <p className="text-sm text-[var(--muted)]">Không mở được trang để đọc (quá 8 giây hoặc lỗi mạng).</p>
          )}
          <p className="text-xs text-[var(--muted)]">Đọc lại mỗi lần mở trang này; đã gồm SEO đặt tay đang lưu.</p>
        </Card>
      </div>

      <aside className="space-y-5">
        <Card title="Lưu">
          <p className="text-sm text-[var(--muted)]">
            {initial ? `Đặt tay lần cuối ${viDateTime(initial.updatedAt)}.` : "Trang đang dùng SEO tự tạo."}
            {dirty && <b className="text-amber-700"> Có thay đổi chưa lưu.</b>}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={save} disabled={!!busy || !canSave} className={btnPrimary}>
              Lưu
            </button>
            {initial && (
              <button type="button" onClick={reset} disabled={!!busy || !canSave} className={btn}>
                Xoá SEO đặt tay
              </button>
            )}
            <a href={path} target="_blank" rel="noreferrer" className={btn}>
              Xem trang ↗
            </a>
          </div>
          {busy && <p className="text-sm text-[var(--muted)]">{busy}</p>}
          {error && <p className="text-sm text-rose-700">{error}</p>}
          {notice && <p className="text-sm text-emerald-700">{notice}</p>}
        </Card>

        <Card title="Hiện trên Google">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={noindex}
              disabled={isHome}
              onChange={(e) => {
                setNoindex(e.target.checked);
                touch();
              }}
              className="mt-0.5"
            />
            <span>
              <b>Ẩn khỏi Google</b>
              <span className={hint}>
                {isHome
                  ? "Không được ẩn trang chủ."
                  : "Trang vẫn mở được bằng link, nhưng rời sitemap và Google sẽ gỡ khỏi kết quả tìm kiếm (vài ngày tới vài tuần)."}
              </span>
            </span>
          </label>
        </Card>
      </aside>
    </div>
  );
}
