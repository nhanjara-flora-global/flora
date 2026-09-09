import Link from "next/link";
import { withLocale, type Locale } from "@/lib/i18n/config";

export function FloatingContact({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  return (
    <Link
      href={withLocale(locale, "/contact")}
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 z-40 flex items-center gap-2 rounded-full bg-[var(--brand)] p-3.5 text-white shadow-lg transition hover:bg-[var(--brand-2)] sm:bottom-5 sm:left-5 sm:px-4 sm:py-3 print:hidden"
      aria-label={label}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5 shrink-0"
        aria-hidden
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span className="hidden text-xs font-semibold uppercase tracking-wide sm:inline">
        {label}
      </span>
    </Link>
  );
}
