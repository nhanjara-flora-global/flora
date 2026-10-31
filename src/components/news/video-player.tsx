"use client";

import { useState } from "react";
import { isHotlinked } from "@/lib/media";
import { videoEmbedUrl, videoThumbnail, type Video } from "@/lib/data/videos";

/**
 * Trình phát "nhẹ": ban đầu chỉ là ảnh bìa + nút phát. iframe YouTube/TikTok
 * (vài trăm KB script) chỉ được tải khi người xem bấm phát.
 */
export function VideoPlayer({
  video,
  playLabel,
  round = true,
}: {
  video: Video;
  playLabel: string;
  /** Nút phát tròn lớn (video chính) hay vuông nhỏ. */
  round?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const thumb = videoThumbnail(video);
  const vertical = video.platform === "tiktok";

  return (
    <div className="relative bg-[#24402e]" style={{ aspectRatio: "16/9" }}>
      {/* TikTok là video dọc: khung 9:16 đặt giữa nền 16:9. */}
      <div
        className={vertical ? "absolute inset-y-0 left-1/2 -translate-x-1/2" : "absolute inset-0"}
        style={vertical ? { aspectRatio: "9/16" } : undefined}
      >
        {playing ? (
          <iframe
            src={videoEmbedUrl(video)}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={playLabel}
            className="group absolute inset-0 flex items-center justify-center"
          >
            {thumb && (
              // eslint-disable-next-line @next/next/no-img-element -- ảnh bìa từ YouTube/TikTok, tải thẳng từ nguồn
              <img
                src={thumb}
                alt=""
                referrerPolicy={isHotlinked(thumb) ? "no-referrer" : undefined}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <span
              aria-hidden="true"
              className={`relative flex items-center justify-center bg-white shadow-lg transition group-hover:scale-105 ${
                round ? "h-[72px] w-[72px] rounded-full" : "h-14 w-14"
              }`}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#141414">
                <path d="M7 4l13 8-13 8z" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
