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

const nn = (n: number) => String(n).padStart(2, "0");

const accent = (slug: string) =>
  ({ ["--sv" as string]: getServiceTheme(slug).accent }) as CSSProperties;

/** Thẻ mở đầu, chạy hết chiều ngang: ảnh một bên, nội dung một bên. */
export function ServiceCardFeature({
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
      className="svc card card-interactive group grid overflow-hidden md:grid-cols-2"
      style={accent(slug)}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--sv-soft)] md:aspect-auto md:min-h-[22rem]">
        {cover && (
          <Image
            src={cover}
            alt={title}
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        )}
        <span className="absolute left-0 top-0 h-1 w-full bg-[var(--sv)] md:h-full md:w-1" />
      </div>
      <div className="flex flex-col justify-center p-7 md:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--sv)] text-white">
          <ServiceIcon name={theme.icon} className="h-6 w-6" />
        </span>
        <p className="eyebrow mt-6 text-[var(--sv-ink)]">
          {nn(index)} · {label}
        </p>
        <h3 className="display-md mt-3 text-[var(--ink)] transition-colors group-hover:text-[var(--sv)]">
          {title}
        </h3>
        <p className="body-base mt-4 text-[var(--muted)]">{excerpt}</p>
        <span className="body-sm mt-7 font-semibold text-[var(--sv-ink)]">{readMore}</span>
      </div>
    </Link>
  );
}

/** Thẻ có ảnh — dùng cho các dịch vụ Flora còn lại. */
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
      style={accent(slug)}
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
          {nn(index)} · {label}
        </p>
        <h3 className="display-sm mt-3 text-[var(--ink)] transition-colors group-hover:text-[var(--sv)]">
          {title}
        </h3>
        {/* flex-1 đẩy dòng "đọc tiếp" xuống đáy, để các thẻ cùng hàng canh bằng nhau. */}
        <p className="body-sm mt-3 line-clamp-3 flex-1 text-[var(--muted)]">{excerpt}</p>
        <span className="body-sm mt-5 font-semibold text-[var(--sv-ink)]">{readMore}</span>
      </div>
    </Link>
  );
}

/** Thẻ dựa vào biểu tượng — dùng cho dịch vụ VOAC (không có ảnh riêng). */
export function ServiceCardTile({ slug, title, excerpt, label, index, lang, readMore }: Props) {
  const theme = getServiceTheme(slug);
  return (
    <Link
      href={withLocale(lang, `/services/${slug}`)}
      className="svc card card-interactive group relative flex flex-col gap-1 overflow-hidden p-7"
      style={accent(slug)}
    >
      <span className="absolute left-0 top-0 h-full w-1 bg-[var(--sv)]" />
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--sv)] text-white">
        <ServiceIcon name={theme.icon} className="h-6 w-6" />
      </span>
      <p className="eyebrow mt-5 text-[var(--sv-ink)]">
        {nn(index)} · {label}
      </p>
      <h3 className="display-sm mt-2 text-[var(--ink)] transition-colors group-hover:text-[var(--sv)]">
        {title}
      </h3>
      <p className="body-sm mt-3 line-clamp-3 flex-1 text-[var(--muted)]">{excerpt}</p>
      <span className="body-sm mt-5 font-semibold text-[var(--sv-ink)]">{readMore}</span>
    </Link>
  );
}

/** Dòng ngang gọn — dùng cho chương trình & bộ chuẩn của VOAC. */
export function ServiceRow({ slug, title, excerpt, label, index, lang, readMore }: Props) {
  const theme = getServiceTheme(slug);
  return (
    <Link
      href={withLocale(lang, `/services/${slug}`)}
      className="svc group flex items-start gap-5 py-6 transition-colors hover:bg-[var(--sv-soft)] sm:items-center sm:gap-7 sm:px-4"
      style={accent(slug)}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--sv)] text-white">
        <ServiceIcon name={theme.icon} className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="eyebrow block text-[var(--sv-ink)]">
          {nn(index)} · {label}
        </span>
        <span className="display-sm mt-1.5 block text-[var(--ink)] transition-colors group-hover:text-[var(--sv)]">
          {title}
        </span>
        <span className="body-sm mt-2 block text-[var(--muted)]">{excerpt}</span>
      </span>
      <span className="body-sm hidden shrink-0 font-semibold text-[var(--sv-ink)] lg:block">
        {readMore}
      </span>
    </Link>
  );
}
