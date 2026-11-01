import Link from "next/link";

/** Kẻ ngang 1px + nhãn chữ hoa "TIN MỚI ›", tùy chọn nút ở bên phải. */
export function SectionHeader({
  title,
  href,
  id,
  onDark = false,
  actions,
}: {
  title: string;
  href?: string;
  id?: string;
  onDark?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className={`mb-4 flex items-center justify-between gap-3 border-t pt-2.5 ${
        onDark ? "border-white" : "border-ink"
      }`}
    >
      <h2 id={id} className="text-[13px] font-bold uppercase tracking-[0.4px]">
        {href ? (
          <Link href={href} className="hover:underline">
            {title} <span aria-hidden="true">›</span>
          </Link>
        ) : (
          title
        )}
      </h2>
      {actions}
    </div>
  );
}

/** "12 thg 10, 2026 | Canh tác hữu cơ" — phần nào trống thì bỏ. */
export function Meta({
  parts,
  onDark = false,
  className = "",
}: {
  parts: (string | null | undefined)[];
  onDark?: boolean;
  className?: string;
}) {
  const shown = parts.filter(Boolean);
  if (shown.length === 0) return null;
  return (
    <div className={`text-[13px] md:text-xs ${onDark ? "text-on-dark-muted" : "text-muted"} ${className}`}>
      {shown.map((part, i) => (
        <span key={i}>
          {i > 0 && <span aria-hidden="true"> | </span>}
          {part}
        </span>
      ))}
    </div>
  );
}

export function Breadcrumb({
  items,
  label,
}: {
  items: { href: string; label: string }[];
  label: string;
}) {
  return (
    <nav aria-label={label} className="mb-3 flex flex-wrap gap-1.5 text-xs text-muted">
      {items.map((item, i) => (
        <span key={item.href} className="flex gap-1.5">
          {i > 0 && <span aria-hidden="true">›</span>}
          <Link
            href={item.href}
            className={`hover:underline ${i === items.length - 1 ? "font-semibold text-primary" : ""}`}
          >
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}

/** Danh sách đánh số 1–10, số to màu chủ đạo. */
export function RankedList({
  items,
  compact = false,
}: {
  items: { href: string; title: string }[];
  compact?: boolean;
}) {
  return (
    <ol
      className={
        compact ? "" : "grid gap-x-6 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"
      }
    >
      {items.map((item, i) => (
        <li
          key={item.href}
          className={`flex items-start border-b border-rule ${
            compact ? "gap-3 py-3" : "gap-3.5 py-3.5"
          }`}
        >
          <span
            aria-hidden="true"
            className={`font-serif font-bold leading-none text-primary ${
              compact ? "min-w-6 text-2xl" : "min-w-[34px] text-[30px]"
            }`}
          >
            {i + 1}
          </span>
          <Link
            href={item.href}
            className={`font-serif font-bold leading-[1.35] hover:underline ${
              compact ? "text-sm" : "text-[15px]"
            }`}
          >
            {item.title}
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function Pagination({
  page,
  pages,
  hrefFor,
  label,
  prevLabel,
  nextLabel,
}: {
  page: number;
  pages: number;
  hrefFor: (page: number) => string;
  label: string;
  prevLabel: string;
  nextLabel: string;
}) {
  if (pages <= 1) return null;
  const box = "flex h-11 min-w-11 items-center justify-center px-2";
  return (
    <nav aria-label={label} className="flex flex-wrap justify-center gap-1.5 pt-6 text-sm">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} aria-label={prevLabel} className={`${box} border border-[#c8c8c8]`}>
          ‹
        </Link>
      )}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={hrefFor(n)}
          aria-current={n === page ? "page" : undefined}
          className={`${box} ${n === page ? "bg-ink font-bold text-white" : "hover:underline"}`}
        >
          {n}
        </Link>
      ))}
      {page < pages && (
        <Link href={hrefFor(page + 1)} aria-label={nextLabel} className={`${box} border border-[#c8c8c8]`}>
          ›
        </Link>
      )}
    </nav>
  );
}
