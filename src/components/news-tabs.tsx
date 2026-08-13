import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { NEWS_CATEGORIES } from "@/lib/legacy";

export function NewsTabs({
  active,
  locale,
  dict,
}: {
  active: string | null;
  locale: Locale;
  dict: Dictionary;
}) {
  const base = "px-4 py-2 text-sm font-semibold uppercase tracking-wide transition";
  const on = "bg-[var(--brand)] text-white";
  const off =
    "border border-[var(--line)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]";

  return (
    <div className="flex flex-wrap gap-2 border-b border-[var(--line)] pb-4">
      <Link href={withLocale(locale, "/news")} className={`${base} ${active === null ? on : off}`}>
        {dict.common.all}
      </Link>
      {NEWS_CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={withLocale(locale, `/news/category/${c.slug}`)}
          className={`${base} ${active === c.slug ? on : off}`}
        >
          {dict.newsCategories[c.slug]}
        </Link>
      ))}
    </div>
  );
}
