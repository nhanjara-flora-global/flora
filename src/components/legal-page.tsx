import type { Metadata } from "next";
import { ArticleBody } from "@/components/article";
import { PageHero } from "@/components/page-hero";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/legacy";
import { LEGAL_UPDATED, getLegalContent, type LegalDoc } from "@/lib/legal";
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
    <>
      <PageHero
        title={title}
        image="/images/wp/2025_09_banner1-1.jpg"
        homeHref={withLocale(lang, "/")}
        crumbs={[{ href: withLocale(lang, `/${doc}`), label: title }]}
      />
      <div className="container-page section-y">
        <div className="mx-auto max-w-3xl">
          <p className="meta mb-6 text-[var(--muted)]">
            {dict.footer.legalUpdated}: {formatDate(LEGAL_UPDATED)}
          </p>
          <ArticleBody html={getLegalContent(doc, lang)} />
        </div>
      </div>
    </>
  );
}
