import Image from "next/image";
import { isHotlinked } from "@/lib/media";

/**
 * Khung ảnh góc vuông, tỉ lệ cố định (giữ chỗ trước khi ảnh tải xong nên
 * trang không nhảy). Ảnh link ngoài được trình duyệt tải thẳng từ nguồn.
 */
export function Media({
  src,
  alt,
  ratio = "16/9",
  sizes,
  preload,
  title,
  className = "",
  imgClassName = "",
  children,
}: {
  src: string | null | undefined;
  alt: string;
  /** CSS aspect-ratio; "" khi khung cha tự quyết định chiều cao. */
  ratio?: string;
  sizes: string;
  preload?: boolean;
  title?: string;
  className?: string;
  imgClassName?: string;
  /** Lớp phủ trên ảnh (nút phát video, nhãn...). */
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-[#dfe6dc] ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {src && (
        <Image
          src={src}
          alt={alt}
          title={title}
          fill
          sizes={sizes}
          preload={preload}
          unoptimized={isHotlinked(src)}
          className={`object-cover ${imgClassName}`}
        />
      )}
      {children}
    </div>
  );
}

export function PlayBadge({ size = 32 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="absolute bottom-2 left-2 flex items-center justify-center bg-white"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.42} height={size * 0.42} viewBox="0 0 24 24" fill="#141414">
        <path d="M7 4l13 8-13 8z" />
      </svg>
    </span>
  );
}
