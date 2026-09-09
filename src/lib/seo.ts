import type { Metadata } from "next";
import {
  defaultLocale,
  locales,
  withLocale,
  type Locale,
} from "@/lib/i18n/config";

/** Canonical origin, no trailing slash. Set NEXT_PUBLIC_SITE_URL per environment. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://flora-global.vn"
).replace(/\/+$/, "");

export const SITE_NAME = "Flora Global Corporate";
export const ORG_LEGAL_NAME = "Flora Global Company Limited";
const DEFAULT_OG_IMAGE = "/images/wp/2025_09_banner1-1.jpg";

const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  vi: "vi_VN",
  zh: "zh_CN",
  ko: "ko_KR",
  hi: "hi_IN",
  si: "si_LK",
};

export function ogLocale(lang: Locale): string {
  return OG_LOCALE[lang] ?? "en_US";
}

/** Site-relative path → absolute URL. Absolute inputs pass through untouched. */
export function abs(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * hreflang map for a locale-agnostic path (e.g. "/services"). Every locale plus
 * an `x-default` pointing at the default locale — Google needs the full set,
 * including the page's own language, on every URL in the group.
 */
export function languageAlternates(path = "/"): Record<string, string> {
  const langs: Record<string, string> = {};
  for (const l of locales) langs[l] = abs(withLocale(l, path));
  langs["x-default"] = abs(withLocale(defaultLocale, path));
  return langs;
}

type PageSeoInput = {
  lang: Locale;
  /** Locale-agnostic path, e.g. "/news/my-post". Defaults to the locale home. */
  path?: string;
  title?: string;
  /** Skip the "%s | Flora Global" layout template for this page's <title>. */
  titleAbsolute?: boolean;
  description?: string;
  /** Site-relative or absolute; falls back to the default banner. */
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
};

/**
 * Per-page metadata: canonical + hreflang alternates + Open Graph + Twitter,
 * consistent across every route. `title` still runs through the layout template.
 */
export function pageSeo({
  lang,
  path = "/",
  title,
  titleAbsolute,
  description,
  image,
  type = "website",
  publishedTime,
  noIndex,
}: PageSeoInput): Metadata {
  const url = abs(withLocale(lang, path));
  const img = abs(image || DEFAULT_OG_IMAGE);

  return {
    ...(title ? { title: titleAbsolute ? { absolute: title } : title } : {}),
    ...(description ? { description } : {}),
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      locale: ogLocale(lang),
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: [{ url: img }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: [img],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

type JsonLdNode = Record<string, unknown>;

export function organizationLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: ORG_LEGAL_NAME,
    url: SITE_URL,
    logo: abs("/images/wp/2025_08_logo.png"),
    image: abs(DEFAULT_OG_IMAGE),
    email: "info@flora-global.vn",
    telephone: "+84932108990",
    address: {
      "@type": "PostalAddress",
      streetAddress: "692/31 Doan Van Bo Street, Xom Chieu Ward",
      addressLocality: "Ho Chi Minh City",
      addressCountry: "VN",
    },
    sameAs: [
      "https://www.facebook.com/profile.php?id=61564643382722",
    ],
  };
}

export function websiteLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: locales.map((l) => l),
  };
}

export function breadcrumbLd(
  items: { name: string; path: string }[],
): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}
