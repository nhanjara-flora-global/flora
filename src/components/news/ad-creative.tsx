import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { localHref } from "@/lib/news-format";
import type { AdSize, AdTone, ResolvedSlot } from "@/lib/site-slots";
import { Media } from "./media";

/**
 * Phần vẽ ô quảng cáo — không đọc dữ liệu, nên dùng chung cho web (qua
 * <AdSlot> / <AdCreative> trong ad-slot.tsx) và khung xem trước trong admin.
 */

const TONE: Record<AdTone, { box: string; eyebrow: string; body: string; cta: string }> = {
  dark: {
    box: "bg-dark text-white",
    eyebrow: "text-[#f2c38b]",
    body: "text-[#d5ded7]",
    cta: "bg-harvest text-white",
  },
  primary: {
    box: "bg-primary text-white",
    eyebrow: "text-[#f2c38b]",
    body: "text-[#e3ece5]",
    cta: "bg-white text-ink",
  },
  light: {
    box: "border border-[#dcdcdc] bg-white text-ink",
    eyebrow: "text-primary",
    body: "text-ink-2",
    cta: "bg-primary text-white",
  },
  cream: {
    box: "border border-[#e6d3b5] bg-cream text-ink",
    eyebrow: "text-harvest",
    body: "text-ink-2",
    cta: "bg-primary text-white",
  },
  image: {
    box: "border border-[#dcdcdc] bg-white text-ink",
    eyebrow: "text-primary",
    body: "text-ink-2",
    cta: "text-harvest",
  },
};

export function adWidth(size: AdSize): string {
  return size === "billboard" ? "max-w-[970px]" : size === "leaderboard" ? "max-w-[728px]" : "";
}

export function AdBand({
  surface = "band",
  className = "",
  innerClassName = "",
  children,
}: {
  surface?: "band" | "dark" | "none";
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <aside
      className={`${
        surface === "band" ? "bg-ad-bg p-4" : surface === "dark" ? "bg-[#16261c] p-4" : ""
      } ${className}`}
    >
      <div className={`mx-auto ${innerClassName}`}>{children}</div>
    </aside>
  );
}

export function AdCreativeView({
  slot,
  size,
  tone = "dark",
  lang,
  reverse = false,
  compact = false,
}: {
  slot: ResolvedSlot;
  size: AdSize;
  tone?: AdTone;
  lang: Locale;
  /** Billboard: ảnh bên trái thay vì bên phải. */
  reverse?: boolean;
  /** Billboard: trên điện thoại chỉ còn tiêu đề + nút, để tin chính vẫn lọt màn hình đầu. */
  compact?: boolean;
}) {
  const { copy, image } = slot;
  const t = TONE[tone];
  const link = localHref(lang, slot.href);

  const cta = (
    <span
      className={`self-start text-[13px] font-bold ${
        tone === "image" ? t.cta : `${t.cta} px-3.5 py-2`
      }`}
    >
      {copy.cta}
      {tone === "image" && <span aria-hidden="true"> ›</span>}
    </span>
  );

  if (size === "billboard") {
    const mobileHidden = compact ? "max-md:hidden" : "";
    return (
      <Link
        href={link}
        className={`flex flex-col md:h-[250px] ${reverse ? "md:flex-row-reverse" : "md:flex-row"} ${t.box}`}
      >
        <div
          className={`flex flex-col justify-center gap-2.5 px-6 py-5 md:flex-[1_1_360px] md:px-7 ${
            compact ? "max-md:gap-2 max-md:px-4 max-md:py-3" : ""
          }`}
        >
          <span className={`text-xs font-bold uppercase tracking-[0.6px] ${t.eyebrow} ${mobileHidden}`}>
            {copy.eyebrow}
          </span>
          <span
            className={`font-serif text-[22px] font-bold leading-[1.2] md:text-[26px] ${
              compact ? "max-md:text-[17px]" : ""
            }`}
          >
            {copy.title}
          </span>
          {copy.body && <span className={`text-sm ${t.body} ${mobileHidden}`}>{copy.body}</span>}
          {cta}
        </div>
        {image && (
          <Media
            src={image}
            alt=""
            ratio=""
            sizes="(max-width:768px) 100vw, 420px"
            className={`h-32 md:h-auto md:flex-[1_1_280px] ${mobileHidden}`}
          />
        )}
      </Link>
    );
  }
  if (size === "leaderboard") {
    return (
      <Link
        href={link}
        className={`flex min-h-[90px] flex-wrap items-center gap-x-5 gap-y-3 px-5 py-3.5 md:h-[90px] md:flex-nowrap md:py-0 ${t.box}`}
      >
        <span className="flex min-w-0 flex-[1_1_300px] flex-col gap-1">
          <span className="line-clamp-2 font-serif text-[17px] font-bold leading-tight md:text-lg">
            {copy.title}
          </span>
          {copy.body && <span className={`line-clamp-1 text-[13px] ${t.body}`}>{copy.body}</span>}
        </span>
        <span className={`shrink-0 px-4 py-2.5 text-[13px] font-bold ${t.cta}`}>{copy.cta}</span>
      </Link>
    );
  }
  if (size === "mpu") {
    return tone === "image" ? (
      <Link href={link} className={`flex h-[250px] w-[300px] max-w-full flex-col ${t.box}`}>
        {image && <Media src={image} alt="" ratio="" sizes="300px" className="min-h-0 flex-1" />}
        <span className="flex flex-col gap-1.5 px-3.5 py-3">
          <span className="line-clamp-2 font-serif text-base font-bold leading-tight">{copy.title}</span>
          {cta}
        </span>
      </Link>
    ) : (
      <Link
        href={link}
        className={`flex h-[250px] w-[300px] max-w-full flex-col justify-between p-5 ${t.box}`}
      >
        <span className={`text-xs font-bold uppercase tracking-[0.6px] ${t.eyebrow}`}>
          {copy.eyebrow}
        </span>
        <span className="line-clamp-4 font-serif text-[22px] font-bold leading-[1.2]">{copy.title}</span>
        {copy.body && <span className={`line-clamp-2 text-[13px] ${t.body}`}>{copy.body}</span>}
        {cta}
      </Link>
    );
  }
  return (
    <Link href={link} className={`flex h-[600px] w-[300px] max-w-full flex-col ${t.box}`}>
      {image && <Media src={image} alt="" ratio="" sizes="300px" className="min-h-0 flex-1" />}
      <span className="flex flex-col gap-2.5 p-5">
        <span className={`text-xs font-bold uppercase tracking-[0.6px] ${t.eyebrow}`}>
          {copy.eyebrow}
        </span>
        <span className="font-serif text-[22px] font-bold leading-[1.2]">{copy.title}</span>
        {cta}
      </span>
    </Link>
  );
}
