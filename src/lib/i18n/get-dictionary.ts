import type { Locale } from "./config";
import { defaultLocale, isLocale } from "./config";
import en from "./dictionaries/en.json";
import vi from "./dictionaries/vi.json";

const dictionaries = {
  en,
  vi,
} as const;

export type Dictionary = typeof en;

export function getDictionary(locale: string): Dictionary {
  if (isLocale(locale)) return dictionaries[locale] as Dictionary;
  return dictionaries[defaultLocale];
}

export function resolveLocale(locale: string): Locale {
  return isLocale(locale) ? locale : defaultLocale;
}
