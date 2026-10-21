"use client";

import { useEffect, useRef } from "react";

/** Looping muted background video. `speed` < 1 slows playback (HTML has no attribute for it). */
export function HeroVideo({
  src,
  poster,
  speed = 1,
}: {
  src: string;
  poster?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const apply = () => {
      v.playbackRate = speed;
    };
    apply();
    // Browsers may reset the rate when the media (re)loads.
    v.addEventListener("loadedmetadata", apply);
    v.addEventListener("play", apply);
    return () => {
      v.removeEventListener("loadedmetadata", apply);
      v.removeEventListener("play", apply);
    };
  }, [speed]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
    />
  );
}
