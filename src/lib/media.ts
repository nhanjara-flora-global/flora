/**
 * Ảnh dùng chung cho giao diện kiểu báo.
 *
 * Ảnh trong /public và trên Supabase Storage đi qua bộ tối ưu của next/image.
 * Ảnh dán link trực tiếp từ nơi khác (YouTube thumbnail, Wikimedia, CDN đối
 * tác...) thì để trình duyệt tải thẳng từ nguồn: không cần khai báo
 * remotePatterns cho từng tên miền, không tốn băng thông hay bộ nhớ đệm ảnh
 * của server. Đổi lại ảnh đó không được nén lại — nên dán link cỡ vừa phải.
 */

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

/** true khi `src` là link ngoài mà next/image không được phép tối ưu. */
export function isHotlinked(src: string): boolean {
  if (!/^https?:\/\//i.test(src)) return false;
  try {
    return new URL(src).hostname !== supabaseHost;
  } catch {
    return true;
  }
}

export type WebImage = { src: string; credit: string };

/**
 * Ảnh lấy từ mạng cho những chỗ site chưa có ảnh riêng. Ghi nguồn vì phần
 * lớn là giấy phép CC cần ghi công tác giả.
 */
export const WEB_IMAGES = {
  fishmeal: {
    src: "https://upload.wikimedia.org/wikipedia/commons/8/85/Fishmeal_powder.jpg",
    credit: "Phu Thinh Co / Wikimedia Commons (CC BY-SA 2.0)",
  },
} satisfies Record<string, WebImage>;

/** Ảnh thay thế cho sản phẩm chưa có ảnh, theo slug. */
export const PRODUCT_FALLBACK_IMAGE: Record<string, WebImage> = {
  "bot-protein-tu-ca": WEB_IMAGES.fishmeal,
};

/**
 * Bài đăng từ /admin có thể chưa có ảnh bìa. Dùng lại ảnh sẵn có trong
 * /public theo chuyên mục, thay vì để khung trống.
 */
export const CATEGORY_FALLBACK_COVER: Record<string, string> = {
  "canh-tac-huu-co": "/images/wp/2026_03_PRECISION-GROWING.jpg",
  "chung-nhan-tieu-chuan": "/images/wp/2025_09_tuvanthietke.jpg",
  "xuat-khau-logistics": "/images/wp/2025_09_quanlyduan.jpg",
  "thi-truong-xu-huong": "/images/home/hero-greenhouse.jpg",
  "goc-nhin-flora": "/images/wp/2026_03_ELITE.jpg",
};
export const DEFAULT_COVER = "/images/home/hero-greenhouse.jpg";

export function coverFor(article: {
  cover: string | null;
  category?: string | null;
  categories?: string[];
}): string {
  if (article.cover) return article.cover;
  const cat = article.category ?? article.categories?.[0];
  return (cat && CATEGORY_FALLBACK_COVER[cat]) || DEFAULT_COVER;
}
