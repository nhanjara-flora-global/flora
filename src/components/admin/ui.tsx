import Link from "next/link";
import type { ReactNode } from "react";
import type { OrderStatus, PaymentStatus } from "@/lib/admin/data";

/* ── Surfaces ─────────────────────────────────────────────────────── */

export function Panel({
  title,
  description,
  action,
  children,
  bleed = false,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  /** Let tables run edge to edge instead of sitting inside the padding. */
  bleed?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-[var(--line)] bg-white">
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
          <div>
            {title && <h2 className="display-sm text-[var(--ink)]">{title}</h2>}
            {description && (
              <p className="body-sm mt-0.5 text-[var(--muted)]">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={bleed ? "" : "p-5"}>{children}</div>
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow text-[var(--muted)]">{eyebrow}</p>}
        <h1 className="display-lg mt-1 text-[var(--ink)]">{title}</h1>
        {description && <p className="body-sm mt-1 text-[var(--muted)]">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="eyebrow text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--brand)]">
        {value}
      </p>
      {hint && <p className="body-sm mt-1 text-[var(--muted)]">{hint}</p>}
    </>
  );

  const className =
    "block rounded-md border border-[var(--line)] bg-white p-5";

  return href ? (
    <Link href={href} className={`${className} transition hover:border-[var(--brand)]`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="font-medium text-[var(--ink)]">{title}</p>
      {description && <p className="body-sm mt-1 text-[var(--muted)]">{description}</p>}
    </div>
  );
}

export function Notice({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn";
  title: string;
  children?: ReactNode;
}) {
  const tones = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
  };
  return (
    <div className={`mb-6 rounded-md border px-4 py-3 ${tones[tone]}`}>
      <p className="text-sm font-semibold">{title}</p>
      {children && <div className="body-sm mt-1 opacity-90">{children}</div>}
    </div>
  );
}

/* ── Badges ───────────────────────────────────────────────────────── */

type Tone = "neutral" | "amber" | "blue" | "green" | "red" | "violet";

const TONES: Record<Tone, string> = {
  neutral: "border-[var(--line)] bg-[var(--bg-soft)] text-[var(--muted)]",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  blue: "border-sky-200 bg-sky-50 text-sky-800",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  red: "border-rose-200 bg-rose-50 text-rose-800",
  violet: "border-violet-200 bg-violet-50 text-violet-800",
};

export function Badge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}
    >
      {label}
    </span>
  );
}

export const ORDER_STATUS_TONE: Record<OrderStatus, Tone> = {
  pending: "amber",
  confirmed: "blue",
  processing: "violet",
  shipped: "blue",
  completed: "green",
  cancelled: "neutral",
  refunded: "red",
};

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, Tone> = {
  unpaid: "amber",
  paid: "green",
  failed: "red",
  refunded: "neutral",
};

export const PRODUCT_STATUS_TONE: Record<string, Tone> = {
  published: "green",
  draft: "amber",
  archived: "neutral",
};

export const STOCK_TONE: Record<string, Tone> = {
  instock: "green",
  outofstock: "red",
  onbackorder: "amber",
};

/* ── Tables ───────────────────────────────────────────────────────── */

export function Table({
  head,
  children,
}: {
  head: ReactNode[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] bg-[var(--bg-soft)]">
            {head.map((cell, i) => (
              <th
                key={i}
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-[var(--line)] last:border-0 hover:bg-[var(--bg-soft)]">
      {children}
    </tr>
  );
}

export function Cell({
  children,
  align = "left",
  muted = false,
}: {
  children: ReactNode;
  align?: "left" | "right";
  muted?: boolean;
}) {
  return (
    <td
      className={`px-5 py-3 align-middle ${align === "right" ? "text-right" : ""} ${
        muted ? "text-[var(--muted)]" : ""
      }`}
    >
      {children}
    </td>
  );
}

/* ── Filters & paging ─────────────────────────────────────────────── */

function queryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== null) {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/** Plain GET form, so filtering works before (and without) hydration. */
export function SearchForm({
  action,
  placeholder,
  defaultValue,
  hidden = {},
}: {
  action: string;
  placeholder: string;
  defaultValue?: string;
  hidden?: Record<string, string | undefined>;
}) {
  return (
    <form action={action} className="flex w-full max-w-sm gap-2">
      {Object.entries(hidden).map(([name, value]) =>
        value ? <input key={name} type="hidden" name={name} value={value} /> : null,
      )}
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
      />
      <button
        type="submit"
        className="rounded-md border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
      >
        Tìm
      </button>
    </form>
  );
}

export function FilterTabs({
  basePath,
  active,
  params = {},
  options,
}: {
  basePath: string;
  active: string | undefined;
  params?: Record<string, string | undefined>;
  options: Array<{ value?: string; label: string; count?: number }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = (option.value ?? undefined) === (active ?? undefined);
        return (
          <Link
            key={option.label}
            href={`${basePath}${queryString({ ...params, status: option.value, page: undefined })}`}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              on
                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={on ? "ml-1.5 opacity-80" : "ml-1.5 opacity-60"}>
                {option.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export function Pagination({
  basePath,
  page,
  pageCount,
  total,
  params = {},
}: {
  basePath: string;
  page: number;
  pageCount: number;
  total: number;
  params?: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) {
    return (
      <p className="border-t border-[var(--line)] px-5 py-3 text-sm text-[var(--muted)]">
        {total} bản ghi
      </p>
    );
  }

  const link =
    "rounded-md border border-[var(--line)] px-3 py-1.5 text-sm transition hover:border-[var(--brand)] hover:text-[var(--brand)]";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] px-5 py-3">
      <p className="text-sm text-[var(--muted)]">
        Trang {page}/{pageCount} · {total} bản ghi
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={`${basePath}${queryString({ ...params, page: page - 1 })}`} className={link}>
            ← Trước
          </Link>
        ) : (
          <span className={`${link} pointer-events-none opacity-40`}>← Trước</span>
        )}
        {page < pageCount ? (
          <Link href={`${basePath}${queryString({ ...params, page: page + 1 })}`} className={link}>
            Sau →
          </Link>
        ) : (
          <span className={`${link} pointer-events-none opacity-40`}>Sau →</span>
        )}
      </div>
    </div>
  );
}
