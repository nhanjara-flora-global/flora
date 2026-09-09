import Image from "next/image";
import type { ServiceBlock, FeatureItem } from "@/lib/services/parse-service";

function Prose({ html }: { html: string }) {
  return <div className="svc-rich" dangerouslySetInnerHTML={{ __html: html }} />;
}

function PullQuote({ html }: { html: string }) {
  return (
    <figure className="my-6 text-center">
      <blockquote
        className="mx-auto max-w-2xl font-[family-name:var(--font-display)] text-xl italic leading-snug text-[var(--sv)] md:text-2xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}

function FeatureGrid({ items }: { items: FeatureItem[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--sv-line)] bg-[var(--sv-line)] sm:grid-cols-2">
      {items.map((it, i) => (
        <div key={i} className="flex flex-col gap-2 bg-[var(--surface)] p-5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--sv-soft)] text-xs font-semibold text-[var(--sv-ink)]">
            {String(i + 1).padStart(2, "0")}
          </span>
          {it.label && (
            <p className="font-[family-name:var(--font-display)] text-base font-semibold text-[var(--ink)]">
              {it.label}
            </p>
          )}
          {it.html && (
            <p
              className="body-sm text-[var(--muted)]"
              dangerouslySetInnerHTML={{ __html: it.html }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Timeline({ items }: { items: FeatureItem[] }) {
  return (
    <ol className="relative ml-3 border-l-2 border-[var(--sv-line)]">
      {items.map((it, i) => (
        <li key={i} className="relative pb-7 pl-7 last:pb-0">
          <span className="absolute -left-[13px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--sv)] text-[11px] font-bold text-white">
            {i + 1}
          </span>
          {it.label && (
            <p className="font-[family-name:var(--font-display)] text-base font-semibold text-[var(--ink)]">
              {it.label}
            </p>
          )}
          {it.html && (
            <p
              className="body-sm mt-1 text-[var(--muted)]"
              dangerouslySetInnerHTML={{ __html: it.html }}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((text, i) => (
        <li key={i} className="flex gap-3 rounded-[var(--radius-control)] bg-[var(--sv-softer)] p-3">
          <svg
            viewBox="0 0 24 24"
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sv)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m5 13 4 4L19 7" />
          </svg>
          <span className="body-sm text-[var(--ink)]">{text}</span>
        </li>
      ))}
    </ul>
  );
}

function SpecRows({ rows }: { rows: { key: string; value: string }[] }) {
  return (
    <dl className="divide-y divide-[var(--sv-line)] rounded-[var(--radius-card)] border border-[var(--sv-line)]">
      {rows.map((r, i) => (
        <div key={i} className="flex justify-between gap-4 px-4 py-2.5">
          <dt className="body-sm text-[var(--muted)]">{r.key}</dt>
          <dd className="body-sm text-right font-semibold text-[var(--ink)]">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DataTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="svc-table-wrap">
      <table className="svc-table">
        {head.length > 0 && (
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={i} scope="col" dangerouslySetInnerHTML={{ __html: h }} />
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) =>
                j === 0 ? (
                  <th key={j} scope="row" dangerouslySetInnerHTML={{ __html: c }} />
                ) : (
                  <td key={j} dangerouslySetInnerHTML={{ __html: c }} />
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LogoStrip({ images }: { images: { src: string; alt: string }[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-2 sm:gap-6">
      {images.map((img, i) => (
        <div
          key={i}
          className="relative h-24 w-40 rounded-[var(--radius-control)] border border-[var(--sv-line)] bg-white p-3 sm:h-28 sm:w-48"
        >
          <Image
            src={img.src}
            alt={img.alt || "Certification mark"}
            fill
            sizes="192px"
            className="object-contain p-2"
          />
        </div>
      ))}
    </div>
  );
}

export function ServiceBlocks({ blocks }: { blocks: ServiceBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "paragraph":
            return <Prose key={i} html={block.html} />;
          case "quote":
            return <PullQuote key={i} html={block.html} />;
          case "features":
            return block.ordered ? (
              <Timeline key={i} items={block.items} />
            ) : (
              <FeatureGrid key={i} items={block.items} />
            );
          case "checklist":
            return <Checklist key={i} items={block.items} />;
          case "specs":
            return <SpecRows key={i} rows={block.rows} />;
          case "table":
            return <DataTable key={i} head={block.head} rows={block.rows} />;
          case "logos":
            return <LogoStrip key={i} images={block.images} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

export { SpecRows };
