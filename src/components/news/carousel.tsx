"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Hàng cuộn ngang có nút ‹ ›. Trên điện thoại vuốt tay; nút chỉ là lối tắt
 * nên tự mờ đi khi đã chạm đầu/cuối hàng.
 */
export function Carousel({
  title,
  href,
  onDark = false,
  prevLabel,
  nextLabel,
  itemWidth = 220,
  children,
}: {
  title: string;
  href?: string;
  onDark?: boolean;
  prevLabel: string;
  nextLabel: string;
  itemWidth?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setEdge({
        start: el.scrollLeft <= 1,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
      });
    // Đo sau khi vẽ xong (ảnh/khung đã có kích thước) thay vì setState đồng bộ trong effect.
    const raf = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scroll = (dir: 1 | -1) =>
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });

  const btn = `flex h-11 w-11 items-center justify-center border text-lg disabled:opacity-35 md:h-8 md:w-8 ${
    onDark ? "border-[#6e8574] text-white" : "border-[#c8c8c8] bg-white text-ink"
  }`;

  return (
    <>
      <div
        className={`mb-4 flex items-center justify-between gap-3 border-t pt-2.5 ${
          onDark ? "border-white" : "border-ink"
        }`}
      >
        <h2 className="text-[13px] font-bold uppercase tracking-[0.4px]">
          {href ? (
            <Link href={href} className="hover:underline">
              {title} <span aria-hidden="true">›</span>
            </Link>
          ) : (
            title
          )}
        </h2>
        <div className="flex gap-1.5">
          <button type="button" aria-label={prevLabel} disabled={edge.start} onClick={() => scroll(-1)} className={btn}>
            ‹
          </button>
          <button type="button" aria-label={nextLabel} disabled={edge.end} onClick={() => scroll(1)} className={btn}>
            ›
          </button>
        </div>
      </div>
      <ul
        ref={ref}
        className="flex snap-x gap-4 overflow-x-auto pb-1.5 [scrollbar-width:thin]"
        style={{ "--item": `${itemWidth}px` } as React.CSSProperties}
      >
        {children}
      </ul>
    </>
  );
}

export function CarouselItem({ children }: { children: React.ReactNode }) {
  return <li className="w-[var(--item)] shrink-0 snap-start">{children}</li>;
}
