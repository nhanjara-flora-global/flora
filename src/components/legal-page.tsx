import type { Metadata } from "next";
import { ArticleBody } from "@/components/article";
import { ArticleShell, CtaBox, LinkList } from "@/components/news/shells";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import { LEGAL_UPDATED, getLegalContent, type LegalDoc } from "@/lib/legal";
import { formatNewsDate } from "@/lib/news-format";
import { pageSeo } from "@/lib/seo";

export async function legalMetadata(doc: LegalDoc, rawLang: string): Promise<Metadata> {
  const lang = resolveLocale(rawLang);
  const dict = getDictionary(lang);
  return pageSeo({
    lang,
    path: `/${doc}`,
    title: dict.footer[doc],
    description: dict.footer[doc],
    image: "/images/wp/2025_09_banner1-1.jpg",
  });
}

export function LegalPage({ doc, rawLang }: { doc: LegalDoc; rawLang: string }) {
  const lang = resolveLocale(rawLang);
  const dict = getDictionary(lang);
  const title = dict.footer[doc];

  return (
    <ArticleShell
      breadcrumbLabel={dict.news.breadcrumb}
      breadcrumb={[{ href: withLocale(lang, `/${doc}`), label: title }]}
      title={title}
      meta={
        <p className="mt-4 text-[13px] text-muted">
          {dict.footer.legalUpdated}: {formatNewsDate(LEGAL_UPDATED, lang)}
        </p>
      }
      sidebarLabel={dict.news.sidebar}
      sidebar={
        <>
          <LinkList
            title={dict.footer.aboutTitle}
            items={[
              { href: withLocale(lang, "/about-us"), label: dict.nav.about },
              { href: withLocale(lang, "/terms"), label: dict.footer.terms },
              { href: withLocale(lang, "/privacy"), label: dict.footer.privacy },
            ]}
          />
          <CtaBox
            title={dict.contact.companyName}
            body="0932.108.990 · info@flora-global.vn"
            href={withLocale(lang, "/contact")}
            cta={dict.nav.getInTouch}
          />
        </>
      }
    >
      <ArticleBody html={getLegalContent(doc, lang)} className="prose-legacy prose-news mt-6" />
    </ArticleShell>
  );
}
