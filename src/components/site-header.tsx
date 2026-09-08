"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/config";
import { CartBadge } from "./cart-badge";
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
  tagline,
  getInTouch,
  cartLabel,
}: {
  nav: NavItem[];
  locale: Locale;
  tagline: string;
  getInTouch: string;
  cartLabel: string;
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

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-white/95 backdrop-blur">
      <div className="hidden bg-[var(--brand)] text-white md:block">
        <div className="container-page meta flex items-center justify-between py-1.5">
          <p className="tracking-wide">{tagline}</p>
          <div className="flex items-center gap-5">
            <a href="mailto:info@flora-global.vn" className="hover:underline">
              info@flora-global.vn
            </a>
            <a href="tel:0932108990" className="hover:underline">
              0932.108.990
            </a>
          </div>
        </div>
      </div>

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

        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== withLocale(locale, "/") &&
                pathname?.startsWith(`${item.href}/`));
            return (
              <div
                key={item.href}
                data-nav-item
                className="relative py-2"
                onMouseEnter={() => item.children && setOpenMenu(item.href)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href={item.href}
                  className={`text-[13px] font-semibold uppercase tracking-wide transition hover:text-[var(--brand)] ${
                    active ? "text-[var(--brand)]" : "text-[var(--ink)]"
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

        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <CartBadge label={cartLabel} href={withLocale(locale, "/cart")} />
          <Link
            href={withLocale(locale, "/contact")}
            className="hidden rounded-[var(--radius-control)] bg-[var(--brand)] px-4 py-2 text-[13px] font-semibold uppercase tracking-wide text-white transition hover:bg-[var(--brand-2)] sm:inline-block"
          >
            {getInTouch}
          </Link>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--line)] lg:hidden"
          >
            <span className="h-0.5 w-5 bg-[var(--ink)]" />
            <span className="h-0.5 w-5 bg-[var(--ink)]" />
            <span className="h-0.5 w-5 bg-[var(--ink)]" />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-[var(--line)] bg-white lg:hidden">
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
        </nav>
      )}
    </header>
  );
}
