"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { savePost, type PostInput } from "@/app/actions/posts";
import { NEWS_CATEGORIES } from "@/lib/legacy";

type Props = {
  initial?: Partial<PostInput> & { id?: string };
};

const field =
  "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]";

export function PostForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!initial?.id;

  function submit(status: "draft" | "published", form: HTMLFormElement) {
    setError(null);
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await savePost({
        id: initial?.id,
        title: String(fd.get("title") || ""),
        category: String(fd.get("category") || ""),
        excerpt: String(fd.get("excerpt") || ""),
        content: String(fd.get("content") || ""),
        coverUrl: String(fd.get("coverUrl") || ""),
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

  return (
    <form
      className="space-y-5"
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

      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          Ảnh bìa (URL, để trống nếu chưa có)
        </span>
        <input
          name="coverUrl"
          placeholder="/images/wp/..."
          defaultValue={initial?.coverUrl ?? ""}
          className={field}
        />
      </label>

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

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Nội dung</span>
        <textarea
          name="content"
          rows={16}
          required
          defaultValue={initial?.content}
          className={`${field} font-mono`}
        />
        <span className="mt-1 block text-xs text-[var(--muted)]">
          Viết văn bản thường — cách nhau một dòng trống để xuống đoạn. Hoặc dán HTML
          (bắt đầu bằng &lt;p&gt;, &lt;h2&gt;…).
        </span>
      </label>

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
