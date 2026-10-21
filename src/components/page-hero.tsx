import Image from "next/image";
import Link from "next/link";
import { HeroVideo } from "./hero-video";

type Crumb = { href: string; label: string };

export function PageHero({
  title,
  eyebrow,
  image,
  crumbs = [],
  homeHref = "/",
  overlay = false,
  video,
  videoSpeed,
}: {
  title: string;
  eyebrow?: string;
  image?: string | null;
  crumbs?: Crumb[];
  homeHref?: string;
  /** Put eyebrow + title on top of the hero image instead of below it. */
  overlay?: boolean;
  /** Looping muted background video; `image` stays underneath as the poster / reduced-motion fallback. */
  video?: string;
  /** Playback rate for `video` (1 = normal, 0.5 = half speed). */
  videoSpeed?: number;
}) {
  const last = crumbs.at(-1);

  return (
    <>
      <div className="border-b border-[var(--line)] bg-[var(--bg-soft)]">
        <nav className="container-page meta flex flex-wrap items-center gap-x-2 gap-y-1 py-2.5 text-[var(--muted)] sm:justify-between">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
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
          <span className="hidden font-semibold text-[var(--ink)] sm:block">
            {last?.label ?? title}
          </span>
        </nav>
      </div>

      {image && (
        <div
          className={`relative w-full overflow-hidden bg-[var(--bg-soft)] md:aspect-[1440/390] ${
            overlay ? "min-h-64 aspect-[4/3]" : "aspect-[16/9]"
          }`}
        >
          <Image src={image} alt={overlay ? "" : title} fill priority sizes="100vw" className="object-cover" />
          {video && <HeroVideo src={video} poster={image} speed={videoSpeed} />}
          {overlay && (
            <div className="container-page absolute inset-0 flex items-center">
              <div className="max-w-xl text-white [text-shadow:0_2px_12px_rgb(0_0_0/0.45)]">
                {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
                <h1 className="display-lg">{title}</h1>
              </div>
            </div>
          )}
        </div>
      )}

      {!(overlay && image) && (
        <div className="container-page pb-2 pt-[var(--section-y-sm)] text-center">
          <div className="mx-auto max-w-4xl">
            {eyebrow && <p className="eyebrow mb-3 text-[var(--muted)]">{eyebrow}</p>}
            <h1 className="display-lg text-[var(--brand)]">{title}</h1>
          </div>
        </div>
      )}
    </>
  );
}
