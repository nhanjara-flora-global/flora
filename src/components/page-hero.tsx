import Image from "next/image";
import Link from "next/link";

type Crumb = { href: string; label: string };

export function PageHero({
  title,
  eyebrow,
  image,
  crumbs = [],
  homeHref = "/",
}: {
  title: string;
  eyebrow?: string;
  image?: string | null;
  crumbs?: Crumb[];
  homeHref?: string;
}) {
  const last = crumbs.at(-1);

  return (
    <>
      <div className="border-b border-[var(--line)] bg-[var(--bg-soft)]">
        <nav className="container-page meta flex flex-wrap items-center justify-between gap-2 py-2.5 text-[var(--muted)]">
          <span className="flex flex-wrap items-center gap-2">
            <Link href={homeHref} className="hover:text-[var(--brand)]">
              Flora Global Corporate
            </Link>
            {crumbs.map((c) => (
              <span key={c.href} className="flex items-center gap-2">
                <span aria-hidden>→</span>
                <Link href={c.href} className="hover:text-[var(--brand)]">
                  {c.label}
                </Link>
              </span>
            ))}
          </span>
          <span className="font-semibold text-[var(--ink)]">{last?.label ?? title}</span>
        </nav>
      </div>

      {image && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--bg-soft)] md:aspect-[1440/390]">
          <Image src={image} alt={title} fill priority sizes="100vw" className="object-cover" />
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 pb-2 pt-[var(--section-y-sm)] text-center md:px-6">
        {eyebrow && <p className="eyebrow mb-3 text-[var(--muted)]">{eyebrow}</p>}
        <h1 className="display-lg text-[var(--brand)]">{title}</h1>
      </div>
    </>
  );
}
