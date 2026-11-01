import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { localHref } from "@/lib/news-format";
import type { ResolvedSlot } from "@/lib/site-slots";
import { Media } from "./media";

/** Banner sửa được trong /admin/banners — chỉ vẽ, dùng chung cho web và khung xem trước. */

/**
 * Dải xanh ngay dưới menu trang chủ. Trên điện thoại gọn một hàng (nhãn + nút,
 * bỏ đoạn mô tả nếu đã có nhãn) để không đẩy tin chính xuống dưới màn hình đầu.
 */
export function HomeStrip({ slot, lang }: { slot: ResolvedSlot; lang: Locale }) {
  const { copy } = slot;
  return (
    <Link
      href={localHref(lang, slot.href)}
      className="flex flex-wrap items-center gap-x-5 gap-y-2 bg-primary px-5 py-3 text-white max-md:flex-nowrap max-md:justify-between max-md:px-4 max-md:py-2.5"
    >
      {copy.eyebrow && <span className="text-[13px] font-extrabold uppercase tracking-[0.5px]">{copy.eyebrow}</span>}
      <span className={`flex-[1_1_240px] text-sm ${copy.eyebrow ? "max-md:hidden" : ""}`}>{copy.body}</span>
      {copy.cta && <span className="shrink-0 bg-harvest px-3 py-1.5 text-[13px] font-bold">{copy.cta}</span>}
    </Link>
  );
}

/** Khối ảnh lớn + chữ trên nền tối (trang chủ: xanh đậm; trang Video: đen). */
export function FieldStoryBanner({
  slot,
  lang,
  surface = "dark",
}: {
  slot: ResolvedSlot;
  lang: Locale;
  surface?: "dark" | "black";
}) {
  const { copy } = slot;
  const href = localHref(lang, slot.href);
  return (
    <div className={`flex flex-wrap text-white ${surface === "black" ? "bg-black" : "bg-dark"}`}>
      {slot.image && (
        <Media
          src={slot.image}
          alt={copy.title}
          ratio=""
          sizes="(max-width:768px) 100vw, 60vw"
          className="min-h-[240px] flex-[3_1_480px] md:min-h-[320px]"
        />
      )}
      <div className="flex flex-[2_1_300px] flex-col justify-center gap-3 p-6 md:p-8">
        <h3 className="font-serif text-2xl font-bold leading-[1.2] md:text-[28px]">{copy.title}</h3>
        {copy.body && (
          <p className={`text-sm leading-relaxed ${surface === "black" ? "text-on-dark" : "text-[#d5ded7]"}`}>
            {copy.body}
          </p>
        )}
        {copy.cta && (
          <Link
            href={href}
            className="self-start bg-white px-3.5 py-2 text-[13px] font-bold text-ink hover:bg-[#e8e8e8]"
          >
            {copy.cta}
          </Link>
        )}
      </div>
    </div>
  );
}
