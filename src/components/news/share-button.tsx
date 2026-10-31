"use client";

import { useState } from "react";

/** Dùng bảng chia sẻ của hệ điều hành nếu có, không thì sao chép link. */
export function ShareButton({
  title,
  label,
  copiedLabel,
}: {
  title: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Người dùng đóng bảng chia sẻ — không làm gì thêm.
        return;
      }
    }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={share}
      className="h-11 border border-[#c8c8c8] px-3 text-[13px] text-ink md:h-8"
    >
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
