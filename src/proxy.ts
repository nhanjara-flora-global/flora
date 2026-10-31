import { NextRequest, NextResponse } from "next/server";
import {
  defaultLocale,
  isLocale,
  localeForCountry,
  locales,
  withLocale,
} from "@/lib/i18n/config";

/** Locales the site used to serve (zh, ko, hi, si) — removed, now English-only fallback. */
const RETIRED_LOCALES = ["zh", "ko", "hi", "si"];

/**
 * Locale priority: explicit cookie choice → visitor country (Vercel edge geo)
 * → browser Accept-Language → English.
 */
function preferLocale(request: NextRequest): string {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && isLocale(cookie)) return cookie;

  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry");
  const byCountry = localeForCountry(country);
  if (byCountry) return byCountry;

  const header = request.headers.get("accept-language") ?? "";
  const preferred = header
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const tag of preferred) {
    if (isLocale(tag)) return tag;
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Admin stays outside locale routing
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  // Retired locales: send old (possibly indexed) URLs to the English page
  const first = pathname.split("/")[1];
  if (RETIRED_LOCALES.includes(first)) {
    const url = request.nextUrl.clone();
    url.pathname = withLocale(defaultLocale, pathname.slice(first.length + 1) || "/");
    return NextResponse.redirect(url, 308);
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = preferLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
