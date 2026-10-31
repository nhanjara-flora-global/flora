import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentLocaleBadge } from "@/components/content-locale-badge";
import { AdSlot } from "@/components/news/ad-slot";
import { ArticleContent } from "@/components/news/article-content";
import { Media } from "@/components/news/media";
import { ShareButton } from "@/components/news/share-button";
import { ArticleShell, MoreStories } from "@/components/news/shells";
import { RankedList, SectionHeader } from "@/components/news/ui";
import { PreviewBanner } from "@/components/preview-banner";
import { JsonLd } from "@/components/seo/json-ld";
import { getProductBySlug } from "@/lib/catalog";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { locales, resolveLocale, withLocale } from "@/lib/i18n/config";
import { getLocalizedPost, getLocalizedPosts, type LocalizedArticle } from "@/lib/i18n/localized-content";
import { localizeProduct } from "@/lib/i18n/localized-catalog";
import { getPosts } from "@/lib/legacy";
import { PRODUCT_FALLBACK_IMAGE, coverFor } from "@/lib/media";
import { categoryName, getNewsCategories } from "@/lib/news-categories";
import { formatNewsDate, splitAfterParagraph } from "@/lib/news-format";
import { isPreview } from "@/lib/preview";
import { SITE_NAME, SITE_URL, abs, breadcrumbLd, pageSeo } from "@/lib/seo";

export const revalidate = 300;

const PROSE = "prose-legacy prose-news";

type Props = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((lang) => getPosts().map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = resolveLocale(lang);
  const post = await getLocalizedPost(slug, locale, { draft: await isPreview() });
  if (!post) return { title: "Not found" };
  return pageSeo({
    lang: locale,
    path: `/knowledge/${slug}`,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.cover,
    type: "article",
    publishedTime: post.date || undefined,
    noIndex: post.isDraft,
  });
}

export default async function NewsPostPage({ params }: Props) {
  const { lang: raw, slug } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const n = dict.news;
  const post = await getLocalizedPost(slug, lang, { draft: await isPreview() });
  if (!post) notFound();

  const allCats = await getNewsCategories();
  const cats = (post.categories ?? [])
    .map((c) => allCats.find((x) => x.slug === c))
    .filter((c) => c !== undefined);
  const primary = cats[0];
  const others = (await getLocalizedPosts(lang)).filter((p) => p.slug !== slug);
  const sameCategory = primary ? others.filter((p) => p.categories?.includes(primary.slug)) : [];
  const related = [...sameCategory, ...others.filter((p) => !sameCategory.includes(p))].slice(0, 3);
  const mostRead = others.filter((p) => !related.includes(p)).slice(0, 5);
  const more = others.filter((p) => !related.includes(p) && !mostRead.includes(p)).slice(0, 3);

  // Sản phẩm gợi ý trong hộp "Sản phẩm liên quan" — chọn theo chuyên mục ở /admin/post-categories.
  const productSlug = primary?.relatedProduct;
  const rawProduct = productSlug ? await getProductBySlug(productSlug) : null;
  const product = rawProduct ? localizeProduct(rawProduct, lang) : null;
  const productImage = product?.image_url ?? (product && PRODUCT_FALLBACK_IMAGE[product.slug]?.src);

  const href = (p: LocalizedArticle) => withLocale(lang, `/knowledge/${p.slug}`);
  const cover = coverFor({ cover: post.cover, categories: post.categories });
  const body = splitAfterParagraph(post.content, 3);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    ...(post.cover ? { image: [abs(post.cover)] } : {}),
    ...(post.date ? { datePublished: post.date, dateModified: post.date } : {}),
    inLanguage: lang,
    mainEntityOfPage: abs(withLocale(lang, `/knowledge/${slug}`)),
    author: { "@type": "Organization", name: SITE_NAME, "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
  const crumbs = breadcrumbLd([
    { name: SITE_NAME, path: withLocale(lang, "/") },
    { name: dict.newsPage.title, path: withLocale(lang, "/knowledge") },
    { name: post.title, path: withLocale(lang, `/knowledge/${slug}`) },
  ]);

  return (
    <>
      {post.isDraft && <PreviewBanner />}
      <JsonLd data={[articleLd, crumbs]} />
      <ArticleShell
        top={<AdSlot ad="certification" size="billboard" tone="dark" lang={lang} dict={dict} />}
        breadcrumbLabel={n.breadcrumb}
        breadcrumb={[
          { href: withLocale(lang, "/knowledge"), label: dict.newsPage.title },
          ...(primary
            ? [{ href: withLocale(lang, `/knowledge/category/${primary.slug}`), label: categoryName(primary, lang) }]
            : []),
        ]}
        title={post.title}
        meta={
          <>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted">
              {post.date && <time dateTime={post.date}>{formatNewsDate(post.date, lang)}</time>}
              <ShareButton title={post.title} label={n.share} copiedLabel={n.linkCopied} />
            </div>
            <div className="mt-3.5 text-sm font-bold">{n.byline}</div>
          </>
        }
        figure={{ src: cover, alt: post.title }}
        sidebarLabel={n.sidebar}
        sidebar={
          <>
            <AdSlot ad="sourcing" size="halfpage" tone="dark" surface="none" lang={lang} dict={dict} />
            {mostRead.length > 0 && (
              <section aria-labelledby="a-most">
                <SectionHeader id="a-most" title={n.recommended} />
                <RankedList compact items={mostRead.map((p) => ({ href: href(p), title: p.title }))} />
              </section>
            )}
            <AdSlot ad="lotus" size="mpu" tone="cream" surface="none" lang={lang} dict={dict} />
          </>
        }
        after={
          <MoreStories
            id="a-more"
            title={n.moreFrom}
            items={more.map((p) => ({
              href: href(p),
              title: p.title,
              excerpt: p.excerpt,
              image: coverFor({ cover: p.cover, categories: p.categories }),
              date: formatNewsDate(p.date, lang),
            }))}
          />
        }
      >
        <div className="mt-6">
          <ContentLocaleBadge article={post} uiLocale={lang} />
        </div>

        <div className="mt-6">
          <ArticleContent html={body ? body[0] : post.content} className={PROSE} lang={lang} quoteLabel={n.quote} />
        </div>
        {body && (
          <>
            <AdSlot ad="chickenManure" size="mpu" tone="primary" lang={lang} dict={dict} className="my-7" />
            <ArticleContent html={body[1]} className={PROSE} lang={lang} quoteLabel={n.quote} />
          </>
        )}

        {product && (
          <aside
            aria-label={n.relatedProduct}
            className="mt-7 flex flex-wrap items-center gap-4 border-t-4 border-harvest bg-cream px-5 py-[18px]"
          >
            <Media src={productImage} alt="" ratio="1/1" sizes="96px" className="w-24 shrink-0 bg-[#e8e2d3]" />
            <div className="flex flex-[1_1_240px] flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-[0.5px] text-harvest">{n.relatedProduct}</span>
              <Link href={withLocale(lang, `/products/${product.slug}`)} className="font-serif text-lg font-bold hover:underline">
                {product.name}
              </Link>
              {product.short_description && (
                <span className="line-clamp-2 text-[13px] text-ink-2">{product.short_description}</span>
              )}
            </div>
            <Link
              href={withLocale(lang, `/contact?product=${encodeURIComponent(product.name)}`)}
              className="bg-ink px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#333]"
            >
              {n.quote}
            </Link>
          </aside>
        )}

        {cats.length > 0 && (
          <ul aria-label={n.topics} className="mt-7 flex flex-wrap gap-2">
            {cats.map((c) => (
              <li key={c.slug}>
                <Link
                  href={withLocale(lang, `/knowledge/category/${c.slug}`)}
                  className="block bg-ad-bg px-3 py-1.5 text-[13px] hover:underline"
                >
                  {categoryName(c, lang)}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {related.length > 0 && (
          <section aria-labelledby="a-related" className="mt-9">
            <SectionHeader id="a-related" title={dict.common.relatedPosts} />
            <ul className="grid gap-4 sm:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link href={href(p)} className="font-serif text-[15px] font-bold leading-[1.35] hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </ArticleShell>
    </>
  );
}
