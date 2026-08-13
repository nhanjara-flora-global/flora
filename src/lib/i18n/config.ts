export const locales = ["en", "vi", "zh", "ko", "hi", "si"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
  zh: "中文",
  ko: "한국어",
  hi: "हिन्दी",
  si: "සිංහල",
};

/** Compact codes shown in the collapsed switcher */
export const localeShort: Record<Locale, string> = {
  en: "EN",
  vi: "VN",
  zh: "CN",
  ko: "KR",
  hi: "IN",
  si: "LK",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  vi: "🇻🇳",
  zh: "🇨🇳",
  ko: "🇰🇷",
  hi: "🇮🇳",
  si: "🇱🇰",
};

/** ISO-3166 country → locale. Anything unmapped falls back to English. */
export const countryLocales: Record<string, Locale> = {
  VN: "vi",
  CN: "zh",
  TW: "zh",
  HK: "zh",
  MO: "zh",
  SG: "zh",
  KR: "ko",
  KP: "ko",
  IN: "hi",
  NP: "hi",
  LK: "si",
};

export function localeForCountry(country: string | null | undefined): Locale | null {
  if (!country) return null;
  return countryLocales[country.toUpperCase()] ?? null;
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function stripLocale(pathname: string): string {
  const parts = pathname.split("/");
  if (parts.length > 1 && isLocale(parts[1])) {
    const rest = parts.slice(2).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname || "/";
}

export function withLocale(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}

export function resolveLocale(locale: string): Locale {
  return isLocale(locale) ? locale : defaultLocale;
}
