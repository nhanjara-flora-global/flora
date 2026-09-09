"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export type Slide = {
  src: string;
  alt: string;
};

/** Legacy banners are pre-composed artwork (1900×594), so they render untouched. */
export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (next: number) => setIndex((next + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    const timer = setInterval(() => go(index + 1), 6000);
    return () => clearInterval(timer);
  }, [index, go]);

  return (
    <section className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--bg-soft)] sm:aspect-[1900/594]">
      {slides.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-1 left-1/2 z-10 flex -translate-x-1/2 md:bottom-3">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => go(i)}
              className="flex h-9 w-9 items-center justify-center"
            >
              <span
                className={`block h-1.5 w-7 border border-white/60 transition ${
                  i === index ? "bg-white" : "bg-white/25"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
