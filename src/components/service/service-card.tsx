import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ServiceIcon } from "@/components/service/service-icon";
import { withLocale, type Locale } from "@/lib/i18n/config";
import { getServiceTheme } from "@/lib/services/service-theme";

type Props = {
  slug: string;
  title: string;
  excerpt: string;
  label: string;
  index: number;
  lang: Locale;
  cover?: string | null;
  readMore: string;
};

/** Photo-forward card — used for the Flora division. */
export function ServiceCardLarge({
  slug,
  title,
  excerpt,
  label,
  index,
  lang,
  cover,
  readMore,
}: Props) {
  const theme = getServiceTheme(slug);
  return (
    <Link
      href={withLocale(lang, `/services/${slug}`)}
      className="svc card card-interactive group flex flex-col"
      style={{ ["--sv" as string]: theme.accent } as CSSProperties}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--sv-soft)]">
        {cover && (
          <Image
            src={cover}
            alt={title}
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        )}
        <span className="absolute left-0 top-0 h-1 w-full bg-[var(--sv)]" />
        <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-[var(--sv)] shadow-[var(--shadow-soft)] backdrop-blur">
          <ServiceIcon name={theme.icon} className="h-5 w-5" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow text-[var(--sv-ink)]">
          {String(index).padStart(2, "0")} · {label}
        </p>
        <h3 className="display-sm mt-3 text-[var(--ink)] transition-colors group-hover:text-[var(--sv)]">
          {title}
        </h3>
        <p className="body-sm mt-3 line-clamp-3 text-[var(--muted)]">{excerpt}</p>
        <span className="body-sm mt-5 font-semibold text-[var(--sv-ink)]">{readMore}</span>
      </div>
    </Link>
  );
}

/** Icon-forward colour tile — used for the VOAC division (no unique photos). */
export function ServiceCardTile({ slug, title, excerpt, label, index, lang, readMore }: Props) {
  const theme = getServiceTheme(slug);
  return (
    <Link
      href={withLocale(lang, `/services/${slug}`)}
      className="svc card card-interactive group relative flex flex-col overflow-hidden p-6"
      style={{ ["--sv" as string]: theme.accent } as CSSProperties}
    >
      <span
        aria-hidden
        className="svc-watermark pointer-events-none absolute -right-3 -top-8 text-[7rem]"
      >
        {String(index).padStart(2, "0")}
      </span>
      <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--sv)] text-white">
        <ServiceIcon name={theme.icon} className="h-6 w-6" />
      </span>
      <p className="eyebrow relative mt-5 text-[var(--sv-ink)]">{label}</p>
      <h3 className="display-sm relative mt-2 text-[var(--ink)] transition-colors group-hover:text-[var(--sv)]">
        {title}
      </h3>
      <p className="body-sm relative mt-3 line-clamp-3 flex-1 text-[var(--muted)]">{excerpt}</p>
      <span className="body-sm relative mt-5 font-semibold text-[var(--sv-ink)]">{readMore}</span>
    </Link>
  );
}
