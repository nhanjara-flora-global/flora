import type { Metadata } from "next";
import Form from "next/form";
import { RowStory } from "@/components/news/cards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import { getLocalizedPosts } from "@/lib/i18n/localized-content";
import { coverFor } from "@/lib/media";
import { fill, formatNewsDate } from "@/lib/news-format";
import { pageSeo } from "@/lib/seo";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  return pageSeo({ lang: locale, path: "/search", title: getDictionary(locale).news.search, noIndex: true });
}

/** Bỏ dấu + chữ thường để "phan bon" khớp "Phân bón". */
function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}

export default async function SearchPage({ params, searchParams }: Props) {
  const [{ lang: raw }, { q: rawQ }] = await Promise.all([params, searchParams]);
  const lang = resolveLocale(raw);
  const n = getDictionary(lang).news;
  const q = (rawQ ?? "").trim().slice(0, 100);

  const terms = normalize(q).split(/\s+/).filter(Boolean);
  const results = terms.length
    ? (await getLocalizedPosts(lang)).filter((p) => {
        const haystack = normalize(`${p.title} ${p.excerpt}`);
        return terms.every((t) => haystack.includes(t));
      })
    : [];

  return (
    <div className="mx-auto max-w-[920px] px-4 pb-14 pt-8">
      <h1 className="text-[28px] font-extrabold md:text-[32px]">{n.search}</h1>
      <Form action={withLocale(lang, "/search")} role="search" className="mt-4 flex gap-2">
        <label htmlFor="search-q" className="sr-only">
          {n.search}
        </label>
        <input
          id="search-q"
          type="search"
          name="q"
          defaultValue={q}
          placeholder={n.searchPlaceholder}
          className="h-11 min-w-0 flex-1 border border-[#8a8a8a] px-3 text-sm"
        />
        <button type="submit" className="h-11 bg-ink px-4 text-sm font-bold text-white">
          {n.search}
        </button>
      </Form>

      <p role="status" className="mt-5 text-sm text-muted">
        {!q
          ? n.searchPrompt
          : results.length
            ? fill(n.searchResults, { count: results.length, q })
            : fill(n.searchEmpty, { q })}
      </p>

      <div className="mt-2">
        {results.map((p) => (
          <RowStory
            key={p.slug}
            date={formatNewsDate(p.date, lang)}
            story={{
              href: withLocale(lang, `/knowledge/${p.slug}`),
              title: p.title,
              excerpt: p.excerpt,
              image: coverFor({ cover: p.cover, categories: p.categories }),
            }}
          />
        ))}
      </div>
    </div>
  );
}
