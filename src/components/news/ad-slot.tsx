import type { AdKey } from "@/lib/ads";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { getAd, type AdSize, type AdTone } from "@/lib/site-slots";
import { AdBand, AdCreativeView, adWidth } from "./ad-creative";

export { AdBand } from "./ad-creative";

type CreativeProps = {
  ad: AdKey;
  size: AdSize;
  tone?: AdTone;
  lang: Locale;
  dict: Dictionary;
  /** Billboard: ảnh bên trái thay vì bên phải. */
  reverse?: boolean;
  /** Billboard: trên điện thoại chỉ còn tiêu đề + nút. */
  compact?: boolean;
};

/**
 * Ô quảng cáo (không kèm nhãn "Quảng cáo"). Kích thước theo chuẩn IAB, chiều cao cố
 * định trên desktop để sau này thay bằng AdSense không làm trang nhảy (CLS).
 * Nội dung sửa ở /admin/ads; admin tắt ô thì không vẽ gì.
 */
export async function AdSlot({
  surface = "band",
  className = "",
  ad,
  size,
  tone,
  lang,
  reverse,
  compact,
}: CreativeProps & {
  /** band: dải xám quanh ô; dark: dải tối (trang Video); none: không có dải (cột phải). */
  surface?: "band" | "dark" | "none";
  className?: string;
}) {
  const slot = await getAd(ad, lang);
  if (!slot.visible) return null;
  return (
    <AdBand
      surface={surface}
      className={className}
      innerClassName={`${adWidth(size)} ${size === "mpu" || size === "halfpage" ? "flex flex-col items-center" : ""}`}
    >
      <AdCreativeView slot={slot} size={size} tone={tone} lang={lang} reverse={reverse} compact={compact} />
    </AdBand>
  );
}

/** Ô quảng cáo không kèm dải nền — dùng khi nhiều ô chung một <AdBand>. */
export async function AdCreative({ ad, lang, ...view }: CreativeProps) {
  const slot = await getAd(ad, lang);
  if (!slot.visible) return null;
  return <AdCreativeView slot={slot} lang={lang} size={view.size} tone={view.tone} reverse={view.reverse} />;
}

/** true khi còn ít nhất một ô đang bật — để khỏi vẽ dải quảng cáo rỗng. */
export async function anyAdVisible(ads: AdKey[], lang: Locale): Promise<boolean> {
  const slots = await Promise.all(ads.map((ad) => getAd(ad, lang)));
  return slots.some((s) => s.visible);
}
