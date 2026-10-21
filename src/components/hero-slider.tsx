"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export type Slide = {
  src: string;
  alt: string;
};

/** Legacy banners are pre-composed artwork (1900×594), so they render untouched. */
export function HeroSlider({
  slides,
  children,
}: {
  slides: Slide[];
  /** Optional text/CTA overlay, rendered above the slides on a darkening scrim. */
  children?: React.ReactNode;
}) {
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
    <section
      className={`relative w-full overflow-hidden bg-[var(--bg-soft)] ${
        // Có nội dung phủ lên thì chiều cao theo nội dung; nếu cố định tỉ lệ thì
        // khung chữ cao hơn hero và bị cắt mất phần trên.
        children ? "" : "aspect-[16/10] sm:aspect-[1900/594]"
      }`}
    >
      {slides.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          quality={95}
          sizes="100vw"
          className={`object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {children && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent" />
          <div className="container-page relative z-10 flex items-end pb-6 pt-44 md:min-h-[28rem] md:items-center md:py-12">
            {children}
          </div>
        </>
      )}

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
