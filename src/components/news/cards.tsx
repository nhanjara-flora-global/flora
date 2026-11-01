import Link from "next/link";
import { Media, PlayBadge } from "./media";
import { Meta } from "./ui";

/**
 * Thẻ tin kiểu báo. Cả thẻ bấm được nhờ link tiêu đề phủ `after:inset-0`
 * (một điểm dừng Tab cho mỗi thẻ, trình đọc màn hình đọc đúng tiêu đề).
 */
export type Story = {
  href: string;
  title: string;
  excerpt?: string | null;
  image?: string | null;
  meta?: (string | null | undefined)[];
};

const stretched = "after:absolute after:inset-0 group-hover:underline";

// Điện thoại dùng cỡ lớn hơn một bậc: đọc bằng một tay, không phóng to.
const TITLE_SIZE = {
  sm: "text-base leading-[1.35] md:text-[15px]",
  md: "text-[17px] leading-[1.35] md:text-base",
  lg: "text-[17px] leading-[1.3]",
  xl: "text-xl leading-[1.3]",
} as const;

/** Đoạn mô tả: 15px trên điện thoại, 13px trên màn hình lớn. */
const EXCERPT = "text-[15px] leading-normal md:text-[13px]";

/** Tin chính: ảnh lớn, tiêu đề 30px. */
export function LeadStory({
  story,
  preload,
  centered = false,
}: {
  story: Story;
  preload?: boolean;
  centered?: boolean;
}) {
  return (
    <article className={`group relative flex flex-col gap-2 ${centered ? "text-center" : ""}`}>
      <Media src={story.image} alt="" sizes="(max-width:768px) 100vw, 50vw" preload={preload} />
      <h2 className="mt-1.5 font-serif text-2xl font-bold leading-[1.2] md:text-[30px]">
        <Link href={story.href} className={stretched}>
          {story.title}
        </Link>
      </h2>
      {story.excerpt && <p className="text-[15px] leading-[1.55] text-ink-2">{story.excerpt}</p>}
      <Meta parts={story.meta ?? []} />
    </article>
  );
}

/** Ảnh 16:9 + tiêu đề + mô tả + meta. */
export function StoryCard({
  story,
  size = "md",
  excerpt = true,
  onDark = false,
  sizes,
  ratio = "16/9",
  mobileRow = false,
}: {
  story: Story;
  size?: keyof typeof TITLE_SIZE;
  excerpt?: boolean;
  onDark?: boolean;
  sizes?: string;
  ratio?: string;
  /**
   * Điện thoại: ảnh nhỏ bên trái, chữ bên phải, bỏ mô tả (dòng tin kiểu BBC) —
   * mỗi khối chỉ giữ một ảnh lớn nên trang ngắn và lướt nhanh hơn.
   */
  mobileRow?: boolean;
}) {
  return (
    <article
      className={`group relative flex flex-col gap-1.5 ${
        mobileRow ? "max-md:flex-row max-md:items-start max-md:gap-3" : ""
      }`}
    >
      <Media
        src={story.image}
        alt=""
        sizes={sizes ?? `(max-width:768px) ${mobileRow ? "40vw" : "100vw"}, 25vw`}
        ratio={ratio}
        className={mobileRow ? "max-md:w-[40%] max-md:shrink-0" : ""}
      />
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className={`mt-1 font-serif font-bold ${TITLE_SIZE[size]} ${mobileRow ? "max-md:mt-0" : ""}`}>
          <Link href={story.href} className={stretched}>
            {story.title}
          </Link>
        </h3>
        {excerpt && story.excerpt && (
          <p
            className={`line-clamp-3 ${size === "xl" ? "text-[15px] leading-normal md:text-sm" : EXCERPT} ${
              onDark ? "text-[#cbd8ce]" : "text-ink-2"
            } ${mobileRow ? "max-md:hidden" : ""}`}
          >
            {story.excerpt}
          </p>
        )}
        <Meta parts={story.meta ?? []} onDark={onDark} />
      </div>
    </article>
  );
}

/** Tin chỉ có chữ (cột danh sách). */
export function TextStory({
  story,
  size = "lg",
  excerpt = true,
  className = "",
}: {
  story: Story;
  size?: keyof typeof TITLE_SIZE;
  excerpt?: boolean;
  className?: string;
}) {
  return (
    <article className={`group relative flex flex-col gap-1.5 ${className}`}>
      <h3 className={`font-serif font-bold ${TITLE_SIZE[size]}`}>
        <Link href={story.href} className={stretched}>
          {story.title}
        </Link>
      </h3>
      {excerpt && story.excerpt && (
        <p className={`line-clamp-2 text-ink-2 ${EXCERPT}`}>{story.excerpt}</p>
      )}
      <Meta parts={story.meta ?? []} />
    </article>
  );
}

/** Ảnh nhỏ bên trái (40% trên điện thoại), tiêu đề bên phải. */
export function ThumbStory({
  story,
  className = "",
  onDark = false,
}: {
  story: Story;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <article className={`group relative flex items-start gap-3 ${className}`}>
      <Media src={story.image} alt="" sizes="(max-width:768px) 40vw, 96px" className="w-[40%] shrink-0 md:w-24" />
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="font-serif text-[17px] font-bold leading-[1.3] md:text-[15px]">
          <Link href={story.href} className={stretched}>
            {story.title}
          </Link>
        </h3>
        <Meta parts={story.meta ?? []} onDark={onDark} />
      </div>
    </article>
  );
}

/** Ngày bên trái, chữ ở giữa, ảnh bên phải (danh sách "Mới nhất"). */
export function RowStory({ story, date }: { story: Story; date: string }) {
  return (
    <article className="group relative flex flex-wrap gap-x-6 gap-y-3 border-b border-rule py-5">
      <div className="w-[100px] shrink-0 text-xs text-muted">{date}</div>
      <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-1.5">
        <h3 className="font-serif text-lg font-bold leading-[1.3] md:text-xl">
          <Link href={story.href} className={stretched}>
            {story.title}
          </Link>
        </h3>
        {story.excerpt && <p className={`line-clamp-2 text-ink-2 ${EXCERPT}`}>{story.excerpt}</p>}
        <Meta parts={story.meta ?? []} />
      </div>
      {story.image && (
        <Media src={story.image} alt="" sizes="180px" className="w-[160px] shrink-0 md:w-[180px]" />
      )}
    </article>
  );
}

/** Thẻ video: ảnh 16:9 + nút phát vuông trắng góc dưới trái. */
export function VideoCard({
  href,
  title,
  image,
  meta,
  onDark = false,
  sizes = "(max-width:768px) 70vw, 240px",
}: {
  href: string;
  title: string;
  image: string | null;
  meta: (string | null | undefined)[];
  onDark?: boolean;
  sizes?: string;
}) {
  return (
    <article className="group relative flex flex-col gap-1.5">
      <Media src={image} alt="" sizes={sizes} className={onDark ? "bg-[#2c4a36]" : ""}>
        <PlayBadge />
      </Media>
      <h3 className="mt-1 font-serif text-[15px] font-bold leading-[1.35]">
        <Link href={href} className={stretched}>
          {title}
        </Link>
      </h3>
      <Meta parts={meta} onDark={onDark} />
    </article>
  );
}

/** Sản phẩm trong carousel: ảnh vuông, nhãn, tên, ghi chú giá. */
export function ProductTile({
  href,
  name,
  label,
  image,
  imageTitle,
  note,
}: {
  href: string;
  name: string;
  label: string;
  image: string | null;
  imageTitle?: string;
  note: string;
}) {
  return (
    <article className="group relative flex flex-col gap-1.5">
      <Media src={image} alt="" title={imageTitle} ratio="1/1" sizes="220px" className="bg-[#f0ece6]" />
      <span className="text-xs font-semibold text-primary">{label}</span>
      <h3 className="font-serif text-[15px] font-bold leading-[1.35]">
        <Link href={href} className={stretched}>
          {name}
        </Link>
      </h3>
      <div className="text-xs text-muted">{note}</div>
    </article>
  );
}

/** Ảnh lớn một bên, chữ một bên — tin nổi bật đầu mục trong trang danh mục. */
export function FeatureStory({
  story,
  kicker,
  cta,
}: {
  story: Story;
  kicker?: string | null;
  cta?: string;
}) {
  return (
    <article className="group relative flex flex-wrap items-center gap-6">
      <Media src={story.image} alt="" sizes="(max-width:768px) 100vw, 60vw" className="flex-[3_1_480px]" />
      <div className="flex min-w-0 flex-[2_1_280px] flex-col gap-2.5">
        {kicker && <span className="text-xs font-bold uppercase tracking-[0.5px] text-primary">{kicker}</span>}
        <h3 className="font-serif text-[22px] font-bold leading-tight md:text-[26px]">
          <Link href={story.href} className={stretched}>
            {story.title}
          </Link>
        </h3>
        {story.excerpt && <p className="text-sm leading-relaxed text-ink-2">{story.excerpt}</p>}
        {cta && (
          <span className="text-[13px] font-bold text-primary">
            {cta} <span aria-hidden="true">›</span>
          </span>
        )}
      </div>
    </article>
  );
}
