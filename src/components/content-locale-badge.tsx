import type { Locale } from "@/lib/i18n/config";
import {
  fallbackBadgeLabel,
  machineBadgeLabel,
  manualBadgeLabel,
  type LocalizedArticle,
} from "@/lib/i18n/localized-content";

export function ContentLocaleBadge({
  article,
  uiLocale,
}: {
  article: LocalizedArticle;
  uiLocale: Locale;
}) {
  if (article.method === "original") return null;

  let text: string;
  let tone: string;

  if (article.method === "fallback") {
    text = fallbackBadgeLabel(uiLocale, article.sourceLocale);
    tone = "border-amber-300 bg-amber-50 text-amber-900";
  } else if (article.method === "machine") {
    text = machineBadgeLabel(uiLocale);
    tone = "border-[var(--line)] bg-[var(--bg-soft)] text-[var(--muted)]";
  } else {
    text = manualBadgeLabel(uiLocale);
    tone = "border-[var(--brand)]/30 bg-[var(--brand)]/5 text-[var(--brand)]";
  }

  return (
    <p
      className={`mb-6 border px-3 py-2 text-xs leading-relaxed ${tone}`}
      role="status"
    >
      {text}
    </p>
  );
}
