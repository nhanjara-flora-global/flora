import Link from "next/link";
import { ArticleBody } from "@/components/article";
import { Media } from "@/components/news/media";
import { getProductBySlug } from "@/lib/catalog";
import { withLocale, type Locale } from "@/lib/i18n/config";
import { localizeProduct } from "@/lib/i18n/localized-catalog";
import { PRODUCT_FALLBACK_IMAGE } from "@/lib/media";

/** Chỗ giữ khối "Sản phẩm" trong HTML bài (blocksToHtml) — thay bằng thẻ sản phẩm thật lúc hiển thị. */
const PRODUCTS_RE =
  /<div class="post-products" data-products="([a-z0-9,-]+)"><p class="post-products__title">([\s\S]*?)<\/p><\/div>/g;

type Part = { html: string } | { title: string; slugs: string[] };

function splitProducts(html: string): Part[] {
  const parts: Part[] = [];
  let last = 0;
  for (const m of html.matchAll(PRODUCTS_RE)) {
    if (m.index > last) parts.push({ html: html.slice(last, m.index) });
    // Tiêu đề đã escape trong HTML; React tự escape lại nên đổi về chữ trơn.
    const title = m[2].replace(/<[^>]*>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    parts.push({ title, slugs: m[1].split(",").filter(Boolean) });
    last = m.index + m[0].length;
  }
  if (last < html.length) parts.push({ html: html.slice(last) });
  return parts;
}

/** Nội dung bài viết: HTML + khối sản phẩm (đọc giá, ảnh, tên mới nhất). */
export async function ArticleContent({
  html,
  className,
  lang,
  quoteLabel,
}: {
  html: string;
  className: string;
  lang: Locale;
  quoteLabel: string;
}) {
  const parts = splitProducts(html);
  if (parts.length === 1 && "html" in parts[0]) return <ArticleBody html={html} className={className} />;
  return (
    <>
      {parts.map((p, i) =>
        "html" in p ? (
          p.html.trim() ? <ArticleBody key={i} html={p.html} className={className} /> : null
        ) : (
          <ProductsBlock key={i} title={p.title} slugs={p.slugs} lang={lang} quoteLabel={quoteLabel} />
        ),
      )}
    </>
  );
}

async function ProductsBlock({
  title,
  slugs,
  lang,
  quoteLabel,
}: {
  title: string;
  slugs: string[];
  lang: Locale;
  quoteLabel: string;
}) {
  // Sản phẩm đã ẩn / xoá thì tự bỏ khỏi bài.
  const found = await Promise.all(slugs.map((s) => getProductBySlug(s).catch(() => null)));
  const products = found.filter((p) => p !== null).map((p) => localizeProduct(p, lang));
  if (!products.length) return null;
  return (
    <section aria-label={title} className="my-7 border-t-4 border-harvest bg-cream px-5 py-[18px]">
      <p className="text-xs font-bold uppercase tracking-[0.5px] text-harvest">{title}</p>
      <ul className="mt-3 grid gap-4 sm:grid-cols-2">
        {products.map((p) => (
          <li key={p.slug} className="flex items-center gap-4">
            <Media
              src={p.image_url ?? PRODUCT_FALLBACK_IMAGE[p.slug]?.src}
              alt=""
              ratio="1/1"
              sizes="80px"
              className="w-20 shrink-0 bg-[#e8e2d3]"
            />
            <div className="flex min-w-0 flex-col gap-1">
              <Link href={withLocale(lang, `/products/${p.slug}`)} className="font-serif text-base font-bold leading-snug hover:underline">
                {p.name}
              </Link>
              {p.short_description && <span className="line-clamp-2 text-[13px] text-ink-2">{p.short_description}</span>}
              <Link
                href={withLocale(lang, `/contact?product=${encodeURIComponent(p.name)}`)}
                className="self-start text-[13px] font-bold text-harvest hover:underline"
              >
                {quoteLabel} →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
