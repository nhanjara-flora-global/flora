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
      className="fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full bg-[var(--brand)] px-4 py-3 text-white shadow-lg transition hover:bg-[var(--brand-2)]"
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
      <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
    </Link>
  );
}
