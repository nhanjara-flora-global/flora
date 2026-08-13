"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  localeFlags,
  localeLabels,
  localeShort,
  locales,
  stripLocale,
  type Locale,
} from "@/lib/i18n/config";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/";
  const bare = stripLocale(pathname);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={localeLabels[locale]}
        className="flex items-center gap-1.5 border border-[var(--line)] px-2.5 py-2 text-[12px] font-semibold text-[var(--ink)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
      >
        <span className="text-base leading-none">{localeFlags[locale]}</span>
        <span className="tracking-wide">{localeShort[locale]}</span>
        <svg
          viewBox="0 0 12 12"
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1 w-48 border-t-2 border-[var(--brand)] bg-white py-1 shadow-xl"
        >
          {locales.map((code) => {
            const active = code === locale;
            return (
              <li key={code} role="option" aria-selected={active}>
                <Link
                  href={`/${code}${bare === "/" ? "" : bare}`}
                  hrefLang={code}
                  onClick={() => {
                    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000`;
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition hover:bg-[var(--bg-soft)] ${
                    active
                      ? "font-semibold text-[var(--brand)]"
                      : "text-[var(--ink)] hover:text-[var(--brand)]"
                  }`}
                >
                  <span className="text-base leading-none">{localeFlags[code]}</span>
                  <span className="flex-1">{localeLabels[code]}</span>
                  {active && <span aria-hidden>✓</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
