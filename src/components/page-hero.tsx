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
  overlay = true,
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
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
            />
          )}
          {overlay && (
            <div className="container-page absolute inset-0 flex items-end pb-10 md:pb-14">
              <div className="relative max-w-2xl text-white">
                {eyebrow && <p className="eyebrow mb-3 text-white/85">{eyebrow}</p>}
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
