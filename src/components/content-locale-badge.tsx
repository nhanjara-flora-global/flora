import type { Locale } from "@/lib/i18n/config";
import {
  fallbackBadgeLabel,
  machineBadgeLabel,
  type LocalizedArticle,
} from "@/lib/i18n/localized-content";

export function ContentLocaleBadge({
  article,
  uiLocale,
}: {
  article: LocalizedArticle;
  uiLocale: Locale;
}) {
  // A human translation reads as the original — no notice needed.
  if (article.method === "original" || article.method === "manual") return null;

  let text: string;
  let tone: string;

  if (article.method === "fallback") {
    text = fallbackBadgeLabel(uiLocale, article.sourceLocale);
    tone = "border-amber-300 bg-amber-50 text-amber-900";
  } else {
    text = machineBadgeLabel(uiLocale);
    tone = "border-[var(--line)] bg-[var(--bg-soft)] text-[var(--muted)]";
  }

  return (
    <p
      className={`meta mb-6 w-fit rounded-[var(--radius-control)] border px-3 py-2 leading-relaxed ${tone}`}
      role="status"
    >
      {text}
    </p>
  );
}
