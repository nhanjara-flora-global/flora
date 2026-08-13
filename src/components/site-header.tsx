"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/config";
import { CartBadge } from "./cart-badge";
import { LanguageSwitcher } from "./language-switcher";

type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
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

  useEffect(() => {
    setOpen(false);
    setExpanded(null);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-white/95 backdrop-blur">
      <div className="hidden bg-[var(--brand)] text-white md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-xs md:px-6">
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

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 md:px-6">
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
              <div key={item.href} className="group relative py-2">
                <Link
                  href={item.href}
                  className={`text-[13px] font-semibold uppercase tracking-wide transition hover:text-[var(--brand)] ${
                    active ? "text-[var(--brand)]" : "text-[var(--ink)]"
                  }`}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="invisible absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 border-t-2 border-[var(--brand)] bg-white opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block border-b border-[var(--line)] px-4 py-3 text-[13px] text-[var(--ink)] last:border-b-0 hover:bg-[var(--bg-soft)] hover:text-[var(--brand)]"
                      >
                        {child.label}
                      </Link>
                    ))}
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
            className="hidden bg-[var(--brand)] px-4 py-2 text-[13px] font-semibold uppercase tracking-wide text-white transition hover:bg-[var(--brand-2)] sm:inline-block"
          >
            {getInTouch}
          </Link>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-[var(--line)] lg:hidden"
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
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-6 py-2.5 text-sm text-[var(--muted)]"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
