"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteProduct, setProductStatus } from "@/app/actions/products";

export function ProductActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        alert(res.error ?? "Có lỗi xảy ra.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex gap-3 text-sm">
      {status === "published" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setProductStatus(id, "draft"))}
          className="text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-50"
        >
          Ẩn
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setProductStatus(id, "published"))}
          className="font-medium text-green-700 hover:underline disabled:opacity-50"
        >
          Đăng
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm("Xoá sản phẩm này?")) run(() => deleteProduct(id));
        }}
        className="text-red-700 hover:underline disabled:opacity-50"
      >
        Xoá
      </button>
    </div>
  );
}
