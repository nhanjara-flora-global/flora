"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { saveProduct } from "@/app/actions/products";
import { uploadPostImage } from "@/app/actions/upload";
import type { Category } from "@/lib/data/local";
import {
  STOCK_STATUSES,
  STOCK_STATUS_LABEL,
  type ProductInput,
  type StockStatus,
} from "@/lib/products";

type Initial = {
  id?: string;
  slug?: string;
  name?: string;
  shortDescription?: string;
  description?: string;
  price?: number | null;
  compareAtPrice?: number | null;
  currency?: string;
  sku?: string;
  stockStatus?: StockStatus;
  imageUrl?: string;
  categoryIds?: string[];
};

type Props = {
  initial?: Initial;
  categories: Category[];
};

const field =
  "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]";

const IMG_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

function numOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function ProductForm({ initial, categories }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [catIds, setCatIds] = useState<string[]>(initial?.categoryIds ?? []);
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!initial?.id;

  function submit(status: "draft" | "published", form: HTMLFormElement) {
    setError(null);
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    if (!name) {
      setError("Thiếu tên sản phẩm.");
      return;
    }
    const input: ProductInput = {
      id: initial?.id,
      name,
      shortDescription: String(fd.get("shortDescription") || ""),
      description: String(fd.get("description") || ""),
      price: numOrNull(fd.get("price")),
      compareAtPrice: numOrNull(fd.get("compareAtPrice")),
      currency: String(fd.get("currency") || "VND"),
      sku: String(fd.get("sku") || ""),
      stockStatus: String(fd.get("stockStatus") || "instock") as StockStatus,
      imageUrl,
      status,
      categoryIds: catIds,
    };
    startTransition(async () => {
      const res = await saveProduct(input);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadPostImage(fd);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      setImageUrl(res.url);
    } finally {
      setUploading(false);
    }
  }

  function toggleCat(id: string) {
    setCatIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
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
        <span className="mb-1 block text-sm font-medium">Tên sản phẩm</span>
        <input name="name" required defaultValue={initial?.name} className={field} />
        {isEdit && initial?.slug && (
          <span className="mt-1 block text-xs text-[var(--muted)]">
            Đường dẫn: /{initial.slug} (không đổi khi sửa)
          </span>
        )}
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Mô tả ngắn</span>
        <textarea
          name="shortDescription"
          rows={2}
          defaultValue={initial?.shortDescription}
          className={field}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Mô tả chi tiết</span>
        <textarea
          name="description"
          rows={8}
          defaultValue={initial?.description}
          className={field}
        />
        <span className="mt-1 block text-xs text-[var(--muted)]">
          Văn bản thường — hiển thị nguyên văn trên trang sản phẩm.
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Giá (để trống = “Liên hệ”)
          </span>
          <input
            type="number"
            name="price"
            min={0}
            step={1000}
            defaultValue={initial?.price ?? ""}
            className={field}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Giá gạch ngang</span>
          <input
            type="number"
            name="compareAtPrice"
            min={0}
            step={1000}
            defaultValue={initial?.compareAtPrice ?? ""}
            className={field}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Tiền tệ</span>
          <select
            name="currency"
            defaultValue={initial?.currency ?? "VND"}
            className={field}
          >
            <option value="VND">VND</option>
            <option value="USD">USD</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">SKU</span>
          <input name="sku" defaultValue={initial?.sku ?? ""} className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Kho</span>
          <select
            name="stockStatus"
            defaultValue={initial?.stockStatus ?? "instock"}
            className={field}
          >
            {STOCK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STOCK_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="block">
        <span className="mb-1 block text-sm font-medium">Ảnh sản phẩm</span>
        <div className="flex flex-wrap items-center gap-2">
          <input
            placeholder="/images/products/… hoặc dán URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={`${field} flex-1`}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="shrink-0 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium hover:border-[var(--brand)] disabled:opacity-60"
          >
            {uploading ? "Đang tải…" : "Tải lên"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={IMG_ACCEPT}
            hidden
            onChange={onPickImage}
          />
        </div>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="mt-2 max-h-40 rounded-md border border-[var(--line)] object-cover"
          />
        )}
      </div>

      <fieldset className="block">
        <legend className="mb-1 text-sm font-medium">Chuyên mục</legend>
        {categories.length === 0 ? (
          <p className="text-xs text-[var(--muted)]">
            Chưa có chuyên mục nào trong bảng <code>categories</code>.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={catIds.includes(c.id)}
                  onChange={() => toggleCat(c.id)}
                />
                {c.name}
              </label>
            ))}
          </div>
        )}
      </fieldset>

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
          {pending ? "Đang xử lý…" : isEdit ? "Lưu & đăng" : "Đăng bán"}
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
    </form>
  );
}
