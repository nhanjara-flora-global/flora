import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { withLocale, type Locale } from "@/lib/i18n/config";
import { NEWS_CATEGORIES, SERVICE_ORDER } from "@/lib/legacy";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const f = dict.footer;
  const support = [
    {
      href: withLocale(locale, "/about-us"),
      icon: "/images/wp/2018_07_t1.jpg",
      lines: [f.infoAbout, f.aboutUs],
    },
    {
      href: withLocale(locale, "/news"),
      icon: "/images/wp/2018_07_t2.jpg",
      lines: [f.newUpdates, f.fromUs],
    },
    {
      href: withLocale(locale, "/contact"),
      icon: "/images/wp/2018_07_t3.jpg",
      lines: [f.contact, f.withUs],
    },
  ];

  return (
    <footer className="mt-auto">
      <div className="bg-[var(--brand)] text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight">
            {f.needHelp}
            <br />
            {f.needSupport}
          </p>
          <div className="grid gap-5 sm:grid-cols-3 md:col-span-2">
            {support.map((box) => (
              <Link key={box.href} href={box.href} className="group flex items-center gap-3">
                <Image
                  src={box.icon}
                  alt=""
                  width={50}
                  height={50}
                  className="h-12 w-12 shrink-0 rounded-full bg-white object-contain"
                />
                <span className="text-sm leading-snug group-hover:underline">
                  {box.lines[0]}
                  <br />
                  {box.lines[1]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-soft)] text-[var(--ink)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
          <div>
            <FooterTitle>{f.aboutTitle}</FooterTitle>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>
                <Link href={withLocale(locale, "/about-us")} className="hover:text-[var(--brand)]">
                  {dict.nav.about}
                </Link>
              </li>
              <li>
                <Link href={withLocale(locale, "/contact")} className="hover:text-[var(--brand)]">
                  {dict.nav.contact}
                </Link>
              </li>
              <li>
                <Link href={withLocale(locale, "/products")} className="hover:text-[var(--brand)]">
                  {dict.nav.products}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <FooterTitle>{f.servicesTitle}</FooterTitle>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              {SERVICE_ORDER.map((slug) => (
                <li key={slug}>
                  <Link
                    href={withLocale(locale, `/services/${slug}`)}
                    className="hover:text-[var(--brand)]"
                  >
                    {dict.services[slug]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterTitle>{f.blogsTitle}</FooterTitle>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              {NEWS_CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={withLocale(locale, `/news/category/${c.slug}`)}
                    className="hover:text-[var(--brand)]"
                  >
                    {dict.newsCategories[c.slug]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterTitle>{f.companyTitle}</FooterTitle>
            <address className="space-y-2 text-sm not-italic text-[var(--muted)]">
              <p>{f.address}</p>
              <p>
                <a href="mailto:info@flora-global.vn" className="hover:text-[var(--brand)]">
                  info@flora-global.vn
                </a>
              </p>
              <p>
                <a href="tel:0932108990" className="hover:text-[var(--brand)]">
                  0932.108.990
                </a>
              </p>
              <p>
                <a
                  href="https://www.facebook.com/profile.php?id=61564643382722"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--brand)]"
                >
                  {f.facebook}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-[var(--line)] py-4 text-center text-xs text-[var(--muted)]">
          {f.copyright.replace("{year}", String(new Date().getFullYear()))}
        </div>
      </div>
    </footer>
  );
}

function FooterTitle({ children }: { children: React.ReactNode }) {
  return (
    <>
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--ink)]">{children}</p>
      <div className="mb-4 mt-2 h-0.5 w-10 bg-[var(--brand)]" />
    </>
  );
}
