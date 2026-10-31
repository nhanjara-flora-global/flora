import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { withLocale, type Locale } from "@/lib/i18n/config";

export function SiteFooter({
  locale,
  dict,
  nav,
}: {
  locale: Locale;
  dict: Dictionary;
  nav: { href: string; label: string }[];
}) {
  const f = dict.footer;

  return (
    <footer className="mt-auto bg-dark-2 text-[13px] text-[#d5ded7]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-4 pb-6 pt-8">
        <Link href={withLocale(locale, "/")} className="self-start">
          <Image
            src="/images/wp/2025_08_logo.png"
            alt="Flora Global"
            width={840}
            height={282}
            className="h-10 w-auto brightness-0 invert"
          />
        </Link>
        <nav
          aria-label={dict.news.footerNav}
          className="flex flex-wrap gap-x-[22px] gap-y-2 border-b border-[#2b4434] pb-5 font-semibold text-white"
        >
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="py-1 hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap gap-x-[22px] gap-y-2">
          <Link href={withLocale(locale, "/terms")} className="py-1 hover:underline">
            {f.terms}
          </Link>
          <Link href={withLocale(locale, "/privacy")} className="py-1 hover:underline">
            {f.privacy}
          </Link>
          <a href="tel:0932108990" className="py-1 hover:underline">
            0932.108.990
          </a>
          <a href="mailto:info@flora-global.vn" className="py-1 hover:underline">
            info@flora-global.vn
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61564643382722"
            target="_blank"
            rel="noreferrer"
            className="py-1 hover:underline"
          >
            Facebook
          </a>
        </div>
        <p className="leading-relaxed text-[#afc0b3]">
          {f.copyright.replace("{year}", String(new Date().getFullYear()))}. {f.address}
        </p>
      </div>
    </footer>
  );
}
