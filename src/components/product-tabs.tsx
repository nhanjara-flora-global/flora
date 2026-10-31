"use client";

import { useState } from "react";

export type ProductTab = { key: string; label: string; content: React.ReactNode };

export function ProductTabs({ tabs }: { tabs: ProductTab[] }) {
  const [active, setActive] = useState(0);
  if (tabs.length === 0) return null;
  const current = tabs[Math.min(active, tabs.length - 1)];

  return (
    <div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-[var(--line)]" role="tablist">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`-mb-px border-b-[3px] px-1 py-3 text-sm transition ${
              i === active
                ? "border-ink font-bold text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="py-8">
        {current.content}
      </div>
    </div>
  );
}
