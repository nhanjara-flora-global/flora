import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FloatingContact } from "@/components/floating-contact";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, locales, withLocale, type Locale } from "@/lib/i18n/config";
import { NEWS_CATEGORIES, SERVICE_ORDER } from "@/lib/legacy";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return {
    title: {
      default: dict.meta.title,
      template: `%s | Flora Global`,
    },
    description: dict.meta.description,
    metadataBase: new URL("https://flora-global.vn"),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const dict = getDictionary(lang);

  const nav = [
    { href: withLocale(lang, "/"), label: dict.nav.home },
    { href: withLocale(lang, "/about-us"), label: dict.nav.about },
    {
      href: withLocale(lang, "/services"),
      label: dict.nav.services,
      children: SERVICE_ORDER.map((slug) => ({
        href: withLocale(lang, `/services/${slug}`),
        label: dict.services[slug],
      })),
    },
    {
      href: withLocale(lang, "/news"),
      label: dict.nav.news,
      children: NEWS_CATEGORIES.map((c) => ({
        href: withLocale(lang, `/news/category/${c.slug}`),
        label: dict.newsCategories[c.slug],
      })),
    },
    { href: withLocale(lang, "/products"), label: dict.nav.products },
    { href: withLocale(lang, "/contact"), label: dict.nav.contact },
  ];

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(lang)};`,
        }}
      />
      <SiteHeader
        nav={nav}
        locale={lang}
        tagline={dict.topbar.tagline}
        getInTouch={dict.nav.getInTouch}
        cartLabel={dict.nav.cart}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter locale={lang} dict={dict} />
      <FloatingContact locale={lang} label={dict.floating.contact} />
    </>
  );
}
