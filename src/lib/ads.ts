import type { Dictionary } from "@/lib/i18n/get-dictionary";

/**
 * Ô quảng cáo hiện tự quảng cáo sản phẩm/dịch vụ Flora. Chữ nằm trong
 * dictionaries (news.ads.*), ở đây chỉ giữ link và ảnh. Khi chuyển sang
 * Google AdSense chỉ cần thay phần ruột của <AdSlot>, kích thước ô giữ nguyên.
 */
export type AdKey = keyof Dictionary["news"]["ads"];

export type AdCreative = {
  /** Đường dẫn trong site (chưa gắn locale) hoặc tel:/https:. */
  href: string;
  image?: string;
};

export const AD_CREATIVES: Record<AdKey, AdCreative> = {
  chickenManure: {
    href: "/products/phan-ga-huu-co-nhat-ban",
    image: "/images/products/phan-ga.jpg",
  },
  certification: {
    href: "tel:0932108990",
    image: "/images/wp/2025_09_tuvanthietke.jpg",
  },
  sourcing: {
    href: "/solutions/strategic-sourcing-procurement-your-bridge-to-vietnam",
    image: "/images/voac/voac-tim-nguon-core-sourcing.jpg",
  },
  lotus: {
    href: "/products/bot-hat-sen-100-nguyen-chat",
    image: "/images/products/bot-hat-sen.jpg",
  },
  partnerFarm: {
    href: "/ecosystem/voac-doi-tac-nong-trai-huu-co-voac",
    image: "/images/voac/voac-doi-tac-organic-farms.jpg",
  },
  ashFertilizer: {
    href: "/products/phan-bon-huu-co-tu-tro-phan-ga-nung",
    image: "/images/products/phan-bon.jpg",
  },
  voacInputs: {
    href: "/solutions/voac-nguyen-lieu-nong-nghiep-huu-co-voac",
    image: "/images/voac/voac-organic-inputs.jpg",
  },
};
