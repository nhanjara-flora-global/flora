import Link from "next/link";
import { AD_CREATIVES, type AdKey } from "@/lib/ads";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localHref } from "@/lib/news-format";
import { Media } from "./media";

type Size = "billboard" | "leaderboard" | "mpu" | "halfpage";
type Tone = "dark" | "light" | "cream" | "primary" | "image";

const TONE: Record<Tone, { box: string; eyebrow: string; body: string; cta: string }> = {
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

type CreativeProps = {
  ad: AdKey;
  size: Size;
  tone?: Tone;
  lang: Locale;
  dict: Dictionary;
  /** Billboard: ảnh bên trái thay vì bên phải. */
  reverse?: boolean;
};

/**
 * Ô quảng cáo với nhãn "QUẢNG CÁO". Kích thước theo chuẩn IAB, chiều cao cố
 * định trên desktop để sau này thay bằng AdSense không làm trang nhảy (CLS).
 */
export function AdSlot({
  surface = "band",
  className = "",
  ...creative
}: CreativeProps & {
  /** band: dải xám quanh ô; dark: dải tối (trang Video); none: chỉ nhãn (cột phải). */
  surface?: "band" | "dark" | "none";
  className?: string;
}) {
  const { size } = creative;
  const width =
    size === "billboard" ? "max-w-[970px]" : size === "leaderboard" ? "max-w-[728px]" : "";
  return (
    <AdBand
      label={creative.dict.news.ad}
      surface={surface}
      className={className}
      innerClassName={`${width} ${size === "mpu" || size === "halfpage" ? "flex flex-col items-center" : ""}`}
    >
      <AdCreative {...creative} />
    </AdBand>
  );
}

export function AdBand({
  label,
  surface = "band",
  className = "",
  innerClassName = "",
  children,
}: {
  label: string;
  surface?: "band" | "dark" | "none";
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <aside
      aria-label={label}
      className={`${
        surface === "band"
          ? "bg-ad-bg px-4 pb-4 pt-2.5"
          : surface === "dark"
            ? "bg-[#16261c] px-4 pb-4 pt-2.5"
            : ""
      } ${className}`}
    >
      <div className={`mx-auto ${innerClassName}`}>
        <div
          className={`mb-1.5 text-center text-[11px] uppercase tracking-[0.6px] ${
            surface === "dark" ? "text-on-dark-muted" : "text-muted"
          }`}
        >
          {label}
        </div>
        {children}
      </div>
    </aside>
  );
}

export function AdCreative({ ad, size, tone = "dark", lang, dict, reverse = false }: CreativeProps) {
  const copy = dict.news.ads[ad];
  const { href, image } = AD_CREATIVES[ad];
  const t = TONE[tone];
  const link = localHref(lang, href);

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

  let creative: React.ReactNode;
  if (size === "billboard") {
    creative = (
      <Link
        href={link}
        className={`flex flex-col md:h-[250px] ${reverse ? "md:flex-row-reverse" : "md:flex-row"} ${t.box}`}
      >
        <div className="flex flex-col justify-center gap-2.5 px-6 py-5 md:flex-[1_1_360px] md:px-7">
          <span className={`text-xs font-bold uppercase tracking-[0.6px] ${t.eyebrow}`}>
            {copy.eyebrow}
          </span>
          <span className="font-serif text-[22px] font-bold leading-[1.2] md:text-[26px]">
            {copy.title}
          </span>
          {copy.body && <span className={`text-sm ${t.body}`}>{copy.body}</span>}
          {cta}
        </div>
        {image && (
          <Media src={image} alt="" ratio="" sizes="(max-width:768px) 100vw, 420px" className="h-32 md:h-auto md:flex-[1_1_280px]" />
        )}
      </Link>
    );
  } else if (size === "leaderboard") {
    creative = (
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
  } else if (size === "mpu") {
    creative =
      tone === "image" ? (
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
  } else {
    creative = (
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

  return creative;
}
