import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FloatingContact } from "@/components/floating-contact";
import { AdSlot } from "@/components/news/ad-slot";
import { HomeOnly } from "@/components/news/home-only";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, locales, withLocale, type Locale } from "@/lib/i18n/config";
import {
  SITE_NAME,
  SITE_URL,
  abs,
  languageAlternates,
  ogLocale,
  organizationLd,
  websiteLd,
} from "@/lib/seo";
import { categoryName, getNewsCategories } from "@/lib/news-categories";
import { getServiceStrings } from "@/lib/services/service-i18n";
import { SOLUTION_CLUSTER_ORDER, servicesByCluster } from "@/lib/services/service-theme";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "en";
  const dict = getDictionary(lang);
  const home = abs(withLocale(lang, "/"));
  const ogImage = abs("/images/wp/2025_09_banner1-1.jpg");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: dict.meta.title,
      template: `%s | Flora Global`,
    },
    description: dict.meta.description,
    applicationName: SITE_NAME,
    formatDetection: { telephone: false },
    alternates: {
      canonical: home,
      languages: languageAlternates("/"),
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: ogLocale(lang),
      url: home,
      title: dict.meta.title,
      description: dict.meta.description,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const dict = getDictionary(lang);
  const s = getServiceStrings(lang);
  const newsCategories = await getNewsCategories();

  // Business-capability clusters (Precision Farming / Certification / Sourcing /
  // Export) replace the old Flora-vs-VOAC brand split — see document/REEDIT.txt.
  // Same 14 service URLs, regrouped by what problem they solve for a visitor
  // instead of which internal team owns them. The "ecosystem" cluster (VOAC
  // consortium/farm-network pages) gets its own top-level section below instead
  // of a heading inside Solutions, now that /ecosystem exists.
  const SOLUTIONS_ONLY = SOLUTION_CLUSTER_ORDER.filter((c) => c !== "ecosystem");
  const clusterLabel: Record<(typeof SOLUTION_CLUSTER_ORDER)[number], string> = {
    "precision-farming": s.clusterPrecisionFarming,
    certification: s.clusterCertification,
    sourcing: s.clusterSourcing,
    export: s.clusterExport,
    ecosystem: s.clusterEcosystem,
  };
  const clusteredServices = servicesByCluster();
  const nav = [
    { href: withLocale(lang, "/"), label: dict.nav.home },
    {
      href: withLocale(lang, "/solutions"),
      label: dict.nav.services,
      children: SOLUTIONS_ONLY.flatMap((cluster) => [
        // Đường dẫn đầy đủ: hàng menu phụ trong header dùng chính các nhóm này,
        // kể cả khi đang ở trang con /solutions/[slug].
        { href: `${withLocale(lang, "/solutions")}#${cluster}`, label: clusterLabel[cluster], heading: true },
        ...clusteredServices[cluster].map((slug) => ({
          href: withLocale(lang, `/solutions/${slug}`),
          label: dict.services[slug],
        })),
      ]),
    },
    {
      href: withLocale(lang, "/products"),
      label: dict.nav.products,
    },
    {
      href: withLocale(lang, "/ecosystem"),
      label: dict.nav.ecosystem,
      children: clusteredServices.ecosystem.map((slug) => ({
        href: withLocale(lang, `/ecosystem/${slug}`),
        label: dict.services[slug],
      })),
    },
    // Chứng nhận / Xuất khẩu là hai cụm trong /solutions, đưa lên menu chính
    // như thiết kế kiểu báo; con của chúng là các trang dịch vụ trong cụm.
    {
      href: `${withLocale(lang, "/solutions")}#certification`,
      label: dict.nav.certification,
      children: clusteredServices.certification.map((slug) => ({
        href: withLocale(lang, `/solutions/${slug}`),
        label: dict.services[slug],
      })),
    },
    {
      href: `${withLocale(lang, "/solutions")}#export`,
      label: dict.nav.export,
      children: [...clusteredServices.export, ...clusteredServices.sourcing].map((slug) => ({
        href: withLocale(lang, `/solutions/${slug}`),
        label: dict.services[slug],
      })),
    },
    {
      href: withLocale(lang, "/knowledge"),
      label: dict.nav.news,
      children: newsCategories.map((c) => ({
        href: withLocale(lang, `/knowledge/category/${c.slug}`),
        label: categoryName(c, lang),
      })),
    },
    { href: withLocale(lang, "/video"), label: dict.nav.video },
    { href: withLocale(lang, "/about-us"), label: dict.nav.about },
    { href: withLocale(lang, "/contact"), label: dict.nav.contact },
  ];

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(lang)};`,
        }}
      />
      <JsonLd data={[organizationLd(), websiteLd()]} />
      {/* `contents`: lớp này chỉ để truyền biến giao diện (xem .site-news trong
          globals.css), không tạo hộp nên header vẫn dính và footer vẫn ở đáy. */}
      <div className="site-news contents">
        {/* Thiết kế đặt billboard phía trên header, chỉ ở trang chủ. */}
        <HomeOnly home={withLocale(lang, "/")}>
          <AdSlot ad="chickenManure" size="billboard" lang={lang} dict={dict} />
        </HomeOnly>
        <SiteHeader
          nav={nav}
          locale={lang}
          labels={{
            contact: dict.nav.getInTouch,
            openMenu: dict.news.openMenu,
            closeMenu: dict.news.closeMenu,
            search: dict.news.search,
            searchPlaceholder: dict.news.searchPlaceholder,
            mainNav: dict.news.mainNav,
          }}
        />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={lang} dict={dict} nav={nav} />
        <FloatingContact locale={lang} label={dict.floating.contact} />
      </div>
    </>
  );
}
