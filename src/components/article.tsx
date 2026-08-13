import Image from "next/image";
import Link from "next/link";
import { formatDate, type LegacyArticle } from "@/lib/legacy";

export function ArticleBody({ html }: { html: string }) {
  return <div className="prose-legacy" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ArticleCard({
  article,
  href,
  meta,
  readMore = "Read more →",
}: {
  article: LegacyArticle;
  href: string;
  meta?: string;
  readMore?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col border border-[var(--line)] bg-white transition hover:border-[var(--brand)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-soft)]">
        {article.cover && (
          <Image
            src={article.cover}
            alt={article.title}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs uppercase tracking-wide text-[var(--muted)]">
          {meta ?? formatDate(article.date)}
        </span>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold leading-snug group-hover:text-[var(--brand)]">
          {article.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm text-[var(--muted)]">{article.excerpt}</p>
        <span className="mt-4 text-sm font-semibold text-[var(--brand)]">{readMore}</span>
      </div>
    </Link>
  );
}
