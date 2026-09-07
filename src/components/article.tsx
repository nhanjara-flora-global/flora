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
      className="card card-interactive group flex flex-col"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-soft)]">
        {article.cover ? (
          <Image
            src={article.cover}
            alt={article.title}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(145deg,#dce8d4_0%,#b7c9a5_45%,#6f8f5a_100%)]" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="meta uppercase text-[var(--muted)]">
          {meta ?? formatDate(article.date)}
        </span>
        <h2 className="display-sm mt-2 transition-colors group-hover:text-[var(--brand)]">
          {article.title}
        </h2>
        <p className="body-sm mt-3 line-clamp-3 text-[var(--muted)]">{article.excerpt}</p>
        <span className="body-sm mt-4 font-semibold text-[var(--brand)]">{readMore}</span>
      </div>
    </Link>
  );
}
