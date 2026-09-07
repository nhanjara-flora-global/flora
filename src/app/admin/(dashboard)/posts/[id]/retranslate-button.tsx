"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { retranslatePost } from "@/app/actions/posts";

export function RetranslateButton({
  id,
  hasTranslations,
}: {
  id: string;
  hasTranslations: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await retranslatePost(id);
          if (!res.ok) {
            alert(res.error ?? "Lỗi dịch.");
            return;
          }
          router.refresh();
        })
      }
      className="rounded-md border border-[var(--line)] bg-white px-3 py-1.5 font-medium hover:border-[var(--brand)] disabled:opacity-60"
    >
      {pending
        ? "Đang dịch…"
        : hasTranslations
          ? "Dịch lại 5 ngôn ngữ"
          : "Dịch 5 ngôn ngữ"}
    </button>
  );
}
