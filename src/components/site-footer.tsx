import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/data/local";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { withLocale, type Locale } from "@/lib/i18n/config";
import { NEWS_CATEGORIES, SERVICE_ORDER } from "@/lib/legacy";
import { SOLUTION_CLUSTER_ORDER, getSolutionCluster } from "@/lib/services/service-theme";
import { getServiceStrings } from "@/lib/services/service-i18n";

export function SiteFooter({
  locale,
  dict,
  productCategories,
}: {
  locale: Locale;
  dict: Dictionary;
  productCategories: Category[];
}) {
  const f = dict.footer;
  const s = getServiceStrings(locale);
  const ecosystemSlugs = SERVICE_ORDER.filter((slug) => getSolutionCluster(slug) === "ecosystem");
  const clusterLabel: Record<(typeof SOLUTION_CLUSTER_ORDER)[number], string> = {
    "precision-farming": s.clusterPrecisionFarming,
    certification: s.clusterCertification,
    sourcing: s.clusterSourcing,
    export: s.clusterExport,
    ecosystem: s.clusterEcosystem,
  };
  const support = [
    {
      href: withLocale(locale, "/about-us"),
      icon: "/images/wp/2018_07_t1.jpg",
      lines: [f.infoAbout, f.aboutUs],
    },
    {
      href: withLocale(locale, "/knowledge"),
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
    <footer className="relative isolate mt-auto flex min-h-[90svh] flex-col overflow-hidden">
      <Image
        src="/images/footer/HOME_0000s_0007s_0000s_0000_BG.png"
        alt=""
        fill
        sizes="100vw"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 select-none object-cover"
      />
      <div className="bg-[color-mix(in_srgb,var(--brand)_62%,transparent)] text-white">
        <div className="container-page grid items-center gap-6 py-4 md:grid-cols-3">
          <p className="display-md">
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
                <span className="text-base leading-snug group-hover:underline">
                  {box.lines[0]}
                  <br />
                  {box.lines[1]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden bg-[color-mix(in_srgb,var(--bg-soft)_78%,transparent)] text-[var(--ink)]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 select-none bg-[var(--brand)] opacity-[0.12] [mask-image:url(/images/footer/ttl.svg)] [mask-position:center_bottom] [mask-repeat:no-repeat] [mask-size:100%_auto]"
        />
        <div className="container-page relative z-10 grid flex-1 grid-cols-12 content-start gap-8 pb-[clamp(6rem,16vw,14rem)] pt-12">
          <div className="col-span-full lg:col-span-4">
            <div className="mb-4 flex items-center gap-3">
              <Image
                src="/images/footer/flora-logo-footer.png"
                alt="Flora Global"
                width={784}
                height={672}
                className="h-24 w-auto shrink-0 object-contain"
              />
              <p className="text-lg font-bold leading-snug text-[var(--ink)]">
                {f.companyTitle.split("\n").map((line, i) => (
                  <Fragment key={i}>
                    {i > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </p>
            </div>
            <address className="space-y-2 text-base not-italic text-[var(--muted)]">
              <p>
                <span className="font-semibold text-[var(--ink)]">{f.addressLabel}: </span>
                {f.address}
              </p>
              <p>
                <span className="font-semibold text-[var(--ink)]">{dict.contact.phoneLabel}: </span>
                <a href="tel:0932108990" className="hover:text-[var(--brand)]">
                  0932.108.990
                </a>
              </p>
              <p>
                <span className="font-semibold text-[var(--ink)]">{dict.contact.emailLabel}: </span>
                <a href="mailto:info@flora-global.vn" className="hover:text-[var(--brand)]">
                  info@flora-global.vn
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

          <div className="col-span-full grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-5">
            <div>
              <FooterTitle>{f.servicesTitle}</FooterTitle>
              <ul className="space-y-2 text-base text-[var(--muted)]">
                {SOLUTION_CLUSTER_ORDER.filter((c) => c !== "ecosystem").map((cluster) => (
                  <li key={cluster}>
                    <Link
                      href={`${withLocale(locale, "/solutions")}#${cluster}`}
                      className="hover:text-[var(--brand)]"
                    >
                      {clusterLabel[cluster]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <FooterTitle>{f.productsTitle}</FooterTitle>
              <ul className="space-y-2 text-base text-[var(--muted)]">
                <li>
                  <Link href={withLocale(locale, "/products")} className="hover:text-[var(--brand)]">
                    {dict.productsPage.all}
                  </Link>
                </li>
                {productCategories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={withLocale(locale, `/products/${c.slug}`)}
                      className="hover:text-[var(--brand)]"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <FooterTitle>{f.ecosystemTitle}</FooterTitle>
              <ul className="space-y-2 text-base text-[var(--muted)]">
                {ecosystemSlugs.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={withLocale(locale, `/ecosystem/${slug}`)}
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
              <ul className="space-y-2 text-base text-[var(--muted)]">
                {NEWS_CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={withLocale(locale, `/knowledge/category/${c.slug}`)}
                      className="hover:text-[var(--brand)]"
                    >
                      {dict.newsCategories[c.slug]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <FooterTitle>{f.aboutTitle}</FooterTitle>
              <ul className="space-y-2 text-base text-[var(--muted)]">
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
                  <Link href={withLocale(locale, "/terms")} className="hover:text-[var(--brand)]">
                    {f.terms}
                  </Link>
                </li>
                <li>
                  <Link href={withLocale(locale, "/privacy")} className="hover:text-[var(--brand)]">
                    {f.privacy}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="relative isolate overflow-hidden border-t border-[var(--line)] py-6 text-center text-sm text-[var(--muted)]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 flex select-none items-center justify-center overflow-hidden whitespace-nowrap text-[clamp(2.5rem,9vw,6.5rem)] font-black uppercase leading-none tracking-wide text-[var(--brand)] opacity-10"
          >
            Flora Global
          </span>
          {f.copyright.replace("{year}", String(new Date().getFullYear()))}
        </div>
      </div>
    </footer>
  );
}

function FooterTitle({ children }: { children: React.ReactNode }) {
  return (
    <>
      <p className="text-base font-semibold uppercase tracking-wide text-[var(--ink)]">{children}</p>
      <div className="mb-4 mt-2 h-0.5 w-10 bg-[var(--brand)]" />
    </>
  );
}
