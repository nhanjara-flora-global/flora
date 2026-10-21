"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/config";
import { LanguageSwitcher } from "./language-switcher";

/** `heading: true` biến mục thành nhãn nhóm — hiển thị, không bấm được. */
type NavChild = { href: string; label: string; heading?: boolean };

type NavItem = {
  href: string;
  label: string;
  children?: NavChild[];
};

export function SiteHeader({
  nav,
  locale,
  topbar,
  getInTouch,
}: {
  nav: NavItem[];
  locale: Locale;
  topbar: { tagline: string; group: string; service: string };
  getInTouch: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  /**
   * Dropdown trước đây chỉ mở bằng CSS group-hover: không có thao tác nào
   * đóng được nó, và trên thiết bị cảm ứng trạng thái hover dính lại sau khi
   * chạm nên menu cứ hiện mãi. Giữ state để còn đóng được.
   */
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Đóng mọi menu khi đổi trang. Reset ngay lúc render thay vì trong effect —
  // effect chạy sau khi vẽ nên menu còn nháy lại một nhịp, và eslint cũng cảnh
  // báo setState đồng bộ trong effect.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
    setExpanded(null);
    setOpenMenu(null);
  }

  // Khoá cuộn nền khi menu mobile mở — nếu không, người dùng vuốt trong menu
  // lại kéo trang phía sau, và thanh menu dài hơn màn hình thì bị hụt.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (openMenu === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    const onPointerDown = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest("[data-nav-item]")) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openMenu]);

  // Thanh đỏ dính đỉnh trang; khi nó chạm đỉnh (tức phần trên đã cuộn khỏi màn hình)
  // thì hiện logo trắng ở bên trái.
  const barRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => {
      const bar = barRef.current;
      if (!bar) return;
      const stuckAt = parseFloat(getComputedStyle(bar).top) || 0;
      setScrolled(bar.getBoundingClientRect().top <= stuckAt + 0.5);
    };
    const raf = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const isActive = (href: string) =>
    pathname === href ||
    (href !== withLocale(locale, "/") && !!pathname?.startsWith(`${href}/`));

  // Giới thiệu / Liên hệ nằm ở thanh trắng phía trên, không lặp lại ở thanh đỏ.
  const topHrefs = [withLocale(locale, "/about-us"), withLocale(locale, "/contact")];
  const topLinks = nav.filter((item) => topHrefs.includes(item.href));
  const mainNav = nav.filter((item) => !topHrefs.includes(item.href));

  return (
    <header className="contents">
      {/* Dải chữ chạy luôn dính đỉnh trang. */}
      <div className="sticky top-0 z-50 hidden h-8 bg-[var(--brand-2)] text-white md:block">
        <div className="marquee meta h-full">
          {[false, true].map((copy) => (
            <div key={String(copy)} className="marquee-track" aria-hidden={copy || undefined}>
              {/* Lặp nội dung để một track luôn dài hơn màn hình, chữ chạy liền mạch không có khoảng trống. */}
              {[0, 1, 2, 3].map((n) => (
                <ul key={n} className="marquee-set" aria-hidden={n > 0 || undefined}>
                  <li>{topbar.group}</li>
                  <li>
                    {topbar.service}{" "}
                    <a
                      href="mailto:info@flora-global.vn"
                      tabIndex={copy || n > 0 ? -1 : undefined}
                      className="hover:underline"
                    >
                      info@flora-global.vn
                    </a>
                  </li>
                  <li>
                    <a
                      href="tel:0932108990"
                      tabIndex={copy || n > 0 ? -1 : undefined}
                      className="inline-flex items-center gap-1.5 hover:underline"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                        <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1L6.6 10.8Z" />
                      </svg>
                      0932.108.990
                    </a>
                  </li>
                  <li>{topbar.tagline}</li>
                </ul>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Thanh trắng: cuộn đi cùng trang trên desktop; trên mobile/tablet dính
          bên dưới dải chữ chạy để nút menu luôn bấm được. */}
      <div className="sticky top-0 z-40 bg-white shadow-md md:top-8 lg:static lg:shadow-none">
      <div className="container-page flex items-center justify-between gap-6 py-3">
        <Link href={withLocale(locale, "/")} className="flex items-center gap-3">
          <Image
            src="/images/wp/2025_08_logo.png"
            alt="Flora Global Corporate"
            width={120}
            height={48}
            className="h-11 w-auto object-contain"
            priority
          />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {topLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[13px] font-semibold uppercase tracking-wide transition hover:text-[var(--brand)] ${
                isActive(item.href) ? "text-[var(--brand)]" : "text-[var(--ink)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <LanguageSwitcher locale={locale} />
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--line)]"
          >
            <span
              className={`h-0.5 w-5 bg-[var(--ink)] transition-transform ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 bg-[var(--ink)] transition-opacity ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 bg-[var(--ink)] transition-transform ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          />
          <nav className="absolute inset-x-0 top-full z-50 max-h-[80dvh] overflow-y-auto overscroll-contain border-t border-[var(--line)] bg-white text-[var(--ink)] shadow-xl lg:hidden">
          {nav.map((item) => (
            <div key={item.href} className="border-b border-[var(--line)]">
              <div className="flex items-center justify-between">
                <Link
                  href={item.href}
                  className="flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <button
                    type="button"
                    aria-label={item.label}
                    onClick={() =>
                      setExpanded((v) => (v === item.href ? null : item.href))
                    }
                    className="px-4 py-3 text-lg text-[var(--muted)]"
                  >
                    {expanded === item.href ? "−" : "+"}
                  </button>
                )}
              </div>
              {item.children && expanded === item.href && (
                <div className="bg-[var(--bg-soft)] pb-2">
                  {item.children.map((child) =>
                    child.heading ? (
                      <p
                        key={child.href}
                        className="px-6 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--ink)]"
                      >
                        {child.label}
                      </p>
                    ) : (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-6 py-2.5 text-sm text-[var(--muted)]"
                      >
                        {child.label}
                      </Link>
                    ),
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="space-y-3 p-4">
            <Link
              href={withLocale(locale, "/contact")}
              className="block rounded-[var(--radius-control)] bg-[var(--brand)] px-4 py-3 text-center text-[13px] font-semibold uppercase tracking-wide text-white"
            >
              {getInTouch}
            </Link>
            <div className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              <a href="tel:0932108990" className="py-1">
                0932.108.990
              </a>
              <a href="mailto:info@flora-global.vn" className="py-1">
                info@flora-global.vn
              </a>
            </div>
          </div>
        </nav>
        </>
      )}
      </div>

      <div
        ref={barRef}
        className={`sticky top-8 z-40 hidden bg-[var(--brand)] text-white transition-shadow lg:block ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="container-page flex items-center justify-between gap-6">
          <div className="flex items-center">
            <Link
              href={withLocale(locale, "/")}
              tabIndex={scrolled ? 0 : -1}
              aria-hidden={!scrolled}
              className={`shrink-0 overflow-hidden transition-all duration-300 ${
                scrolled ? "mr-7 max-w-40 opacity-100" : "pointer-events-none mr-0 max-w-0 opacity-0"
              }`}
            >
              <Image
                src="/images/wp/2025_08_logo.png"
                alt="Flora Global Corporate"
                width={120}
                height={48}
                className="h-8 w-auto max-w-none object-contain brightness-0 invert"
              />
            </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {mainNav.map((item) => {
              const active = isActive(item.href);
              return (
                <div
                  key={item.href}
                  data-nav-item
                  className="relative py-3"
                  onMouseEnter={() => item.children && setOpenMenu(item.href)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Link
                    href={item.href}
                    className={`text-[13px] font-semibold uppercase tracking-wide border-b-2 border-transparent pb-1 transition hover:border-white ${
                      active ? "border-white text-white" : "text-white/90"
                    }`}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div
                      className={`absolute left-1/2 top-full z-50 max-h-[75vh] w-72 -translate-x-1/2 overflow-y-auto border-t-2 border-[var(--brand)] bg-white shadow-xl transition ${
                        openMenu === item.href ? "visible opacity-100" : "invisible opacity-0"
                      }`}
                    >
                      {item.children.map((child) =>
                        child.heading ? (
                          <p
                            key={child.href}
                            className="border-b border-[var(--line)] bg-[var(--bg-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]"
                          >
                            {child.label}
                          </p>
                        ) : (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpenMenu(null)}
                            className="block border-b border-[var(--line)] px-4 py-3 text-[13px] text-[var(--ink)] last:border-b-0 hover:bg-[var(--bg-soft)] hover:text-[var(--brand)]"
                          >
                            {child.label}
                          </Link>
                        ),
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          </div>
          <LanguageSwitcher locale={locale} onDark />
        </div>
      </div>
    </header>
  );
}
