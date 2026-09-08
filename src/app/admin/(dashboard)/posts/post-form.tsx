"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { savePost, type PostInput } from "@/app/actions/posts";
import { uploadPostImage } from "@/app/actions/upload";
import { RichEditor } from "@/components/admin/rich-editor";
import { NEWS_CATEGORIES } from "@/lib/legacy";

type Props = {
  initial?: Partial<PostInput> & { id?: string };
};

const field =
  "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]";

const EMPTY_HTML = /^\s*(<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>\s*)?$/i;

export function PostForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!initial?.id;

  function submit(status: "draft" | "published", form: HTMLFormElement) {
    setError(null);
    if (EMPTY_HTML.test(content)) {
      setError("Thiếu nội dung.");
      return;
    }
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await savePost({
        id: initial?.id,
        title: String(fd.get("title") || ""),
        category: String(fd.get("category") || ""),
        excerpt: String(fd.get("excerpt") || ""),
        content,
        coverUrl,
        date: String(fd.get("date") || ""),
        status,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin/posts");
      router.refresh();
    });
  }

  async function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCoverUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadPostImage(fd);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      setCoverUrl(res.url);
    } finally {
      setCoverUploading(false);
    }
  }

  return (
    <form
      className="max-w-3xl space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit("published", e.currentTarget);
      }}
    >
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Tiêu đề (tiếng Việt)</span>
        <input name="title" required defaultValue={initial?.title} className={field} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Chuyên mục</span>
          <select
            name="category"
            required
            defaultValue={initial?.category ?? NEWS_CATEGORIES[0].slug}
            className={field}
          >
            {NEWS_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Ngày đăng</span>
          <input
            type="date"
            name="date"
            defaultValue={initial?.date ?? new Date().toISOString().slice(0, 10)}
            className={field}
          />
        </label>
      </div>

      <div className="block">
        <span className="mb-1 block text-sm font-medium">Ảnh bìa</span>
        <div className="flex flex-wrap items-center gap-2">
          <input
            name="coverUrl"
            placeholder="/images/wp/… hoặc dán URL"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            className={`${field} flex-1`}
          />
          <button
            type="button"
            disabled={coverUploading}
            onClick={() => coverInputRef.current?.click()}
            className="shrink-0 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium hover:border-[var(--brand)] disabled:opacity-60"
          >
            {coverUploading ? "Đang tải…" : "Tải lên"}
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            hidden
            onChange={onPickCover}
          />
        </div>
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            className="mt-2 max-h-40 rounded-md border border-[var(--line)] object-cover"
          />
        )}
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Tóm tắt</span>
        <textarea
          name="excerpt"
          rows={2}
          required
          defaultValue={initial?.excerpt}
          className={field}
        />
      </label>

      <div className="block">
        <span className="mb-1 block text-sm font-medium">Nội dung</span>
        <RichEditor value={content} onChange={setContent} />
        <span className="mt-1 block text-xs text-[var(--muted)]">
          Dán thẳng từ Word / Google Docs — đậm, nghiêng, tiêu đề, danh sách được
          giữ nguyên. Chèn ảnh bằng nút 🖼 (tải lên hoặc dán URL).
        </span>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[var(--brand)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--brand-2)] disabled:opacity-60"
        >
          {pending ? "Đang xử lý…" : isEdit ? "Lưu & đăng" : "Đăng bài"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={(e) =>
            submit("draft", e.currentTarget.closest("form") as HTMLFormElement)
          }
          className="rounded-md border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-medium hover:border-[var(--brand)] disabled:opacity-60"
        >
          Lưu nháp
        </button>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Khi đăng, hệ thống tự dịch sang 5 ngôn ngữ (mất vài giây).
      </p>
    </form>
  );
}
