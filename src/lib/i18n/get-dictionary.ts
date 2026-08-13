import type { Locale } from "./config";
import { defaultLocale, isLocale } from "./config";
import en from "./dictionaries/en.json";
import hi from "./dictionaries/hi.json";
import ko from "./dictionaries/ko.json";
import si from "./dictionaries/si.json";
import vi from "./dictionaries/vi.json";
import zh from "./dictionaries/zh.json";

const dictionaries = {
  en,
  vi,
  zh,
  ko,
  hi,
  si,
} as const;

export type Dictionary = typeof en;

export function getDictionary(locale: string): Dictionary {
  if (isLocale(locale)) return dictionaries[locale] as Dictionary;
  return dictionaries[defaultLocale];
}

export function resolveLocale(locale: string): Locale {
  return isLocale(locale) ? locale : defaultLocale;
}
