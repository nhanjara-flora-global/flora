"use client";

import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { localeLabels, locales, stripLocale, withLocale } from "@/lib/i18n/config";
import { LanguageSwitcher } from "./language-switcher";

/** `heading: true` biến mục thành nhãn nhóm — hiển thị, không bấm được. */
type NavChild = { href: string; label: string; heading?: boolean };

type NavItem = {
  href: string;
  label: string;
  children?: NavChild[];
};

type Labels = {
  contact: string;
  openMenu: string;
  closeMenu: string;
  search: string;
  searchPlaceholder: string;
  mainNav: string;
};

/**
 * Header kiểu báo (document/flora-design-handoff): hàng trên chia ba —
 * menu + tìm kiếm | logo giữa | Liên hệ + ngôn ngữ; hàng dưới là menu chính
 * căn giữa, gạch chân mục đang xem. Cả khối dính đỉnh khi cuộn. Mục con
 * (dịch vụ, chuyên mục) nằm trong ngăn kéo mở bằng nút menu.
 */
export function SiteHeader({
  nav,
  locale,
  labels,
}: {
  nav: NavItem[];
  locale: Locale;
  labels: Labels;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Đóng ngăn kéo / ô tìm kiếm khi đổi trang. Reset lúc render thay vì trong
  // effect để menu không nháy lại một nhịp.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
    setSearching(false);
    setExpanded(null);
  }

  // Khoá cuộn nền và cho Esc đóng khi ngăn kéo mở.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (searching) searchRef.current?.focus();
  }, [searching]);

  const home = withLocale(locale, "/");
  const isActive = (href: string) =>
    pathname === href || (href !== home && !href.includes("#") && !!pathname?.startsWith(`${href}/`));

  const iconBtn =
    "flex h-11 w-11 items-center justify-center text-ink hover:bg-ad-bg";

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-white text-ink">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 py-1.5 md:py-2.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={labels.openMenu}
            aria-expanded={open}
            aria-controls="site-drawer"
            onClick={() => setOpen(true)}
            className={iconBtn}
          >
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={labels.search}
            aria-expanded={searching}
            aria-controls="site-search"
            onClick={() => setSearching((v) => !v)}
            className={iconBtn}
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
          </button>
        </div>

        <Link href={home} className="flex items-center">
          <Image
            src="/images/wp/2025_08_logo.png"
            alt="Flora Global"
            width={840}
            height={282}
            preload
            className="h-9 w-auto md:h-11"
          />
        </Link>

        <div className="flex items-center justify-end gap-3">
          <Link
            href={withLocale(locale, "/contact")}
            className="hidden h-9 items-center bg-ink px-3.5 text-[13px] font-semibold text-white hover:bg-[#333] sm:flex"
          >
            {labels.contact}
          </Link>
          {/* Ít ngôn ngữ thì hiện thẳng "VI / EN" như thiết kế; nhiều thì gom vào menu thả. */}
          {locales.length <= 3 ? (
            <span className="flex items-center text-[13px] font-semibold">
              {locales.map((code, i) => (
                <Fragment key={code}>
                  {i > 0 && (
                    <span aria-hidden="true" className="text-[#9a9a9a]">
                      /
                    </span>
                  )}
                  <Link
                    href={withLocale(code, stripLocale(pathname || "/"))}
                    hrefLang={code}
                    lang={code}
                    aria-label={localeLabels[code]}
                    aria-current={code === locale ? "true" : undefined}
                    onClick={() => {
                      document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000`;
                    }}
                    className={`flex h-11 items-center px-1.5 ${
                      code === locale ? "text-ink" : "text-muted hover:underline"
                    }`}
                  >
                    {code.toUpperCase()}
                  </Link>
                </Fragment>
              ))}
            </span>
          ) : (
            <LanguageSwitcher locale={locale} />
          )}
        </div>
      </div>

      {searching && (
        <div id="site-search" className="border-t border-rule bg-ad-bg">
          <Form
            action={withLocale(locale, "/search")}
            role="search"
            className="mx-auto flex max-w-[720px] gap-2 px-4 py-3"
          >
            <label className="sr-only" htmlFor="site-search-q">
              {labels.search}
            </label>
            <input
              ref={searchRef}
              id="site-search-q"
              type="search"
              name="q"
              required
              placeholder={labels.searchPlaceholder}
              className="h-11 min-w-0 flex-1 border border-[#8a8a8a] bg-white px-3 text-sm"
            />
            <button type="submit" className="h-11 bg-ink px-4 text-sm font-bold text-white">
              {labels.search}
            </button>
          </Form>
        </div>
      )}

      <nav aria-label={labels.mainNav} className="border-t border-rule">
        {/* w-max + mx-auto: căn giữa khi đủ chỗ, cuộn ngang khi không đủ (điện thoại). */}
        <div className="mx-auto max-w-[1280px] overflow-x-auto px-4 [scrollbar-width:none]">
          <ul className="mx-auto flex w-max gap-[22px] text-[13px]">
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block whitespace-nowrap border-b-[3px] pb-2 pt-2.5 ${
                      active ? "border-ink font-bold" : "border-transparent hover:border-[#c8c8c8]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {open && (
        <>
          <button
            type="button"
            aria-label={labels.closeMenu}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <nav
            id="site-drawer"
            aria-label={labels.mainNav}
            className="fixed inset-y-0 left-0 z-50 flex w-[min(360px,90vw)] flex-col overflow-y-auto overscroll-contain bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-rule px-2 py-1.5">
              <Link href={home} className="px-2">
                <Image src="/images/wp/2025_08_logo.png" alt="Flora Global" width={840} height={282} className="h-8 w-auto" />
              </Link>
              <button type="button" aria-label={labels.closeMenu} onClick={() => setOpen(false)} className={iconBtn}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <ul>
              {nav.map((item) => (
                <li key={item.href} className="border-b border-rule">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex-1 px-4 py-3 text-[15px] ${isActive(item.href) ? "font-bold" : "font-semibold"}`}
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <button
                        type="button"
                        aria-label={item.label}
                        aria-expanded={expanded === item.href}
                        onClick={() => setExpanded((v) => (v === item.href ? null : item.href))}
                        className="flex h-11 w-12 items-center justify-center text-lg text-muted"
                      >
                        {expanded === item.href ? "−" : "+"}
                      </button>
                    )}
                  </div>
                  {item.children && expanded === item.href && (
                    <ul className="bg-ad-bg pb-2">
                      {item.children.map((child) =>
                        child.heading ? (
                          <li
                            key={child.href}
                            className="px-6 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-ink"
                          >
                            {child.label}
                          </li>
                        ) : (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setOpen(false)}
                              className="block px-6 py-2.5 text-sm text-ink-2 hover:underline"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ),
                      )}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-1 p-4 text-sm text-ink-2">
              <a href="tel:0932108990" className="py-1.5">
                0932.108.990
              </a>
              <a href="mailto:info@flora-global.vn" className="py-1.5">
                info@flora-global.vn
              </a>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
