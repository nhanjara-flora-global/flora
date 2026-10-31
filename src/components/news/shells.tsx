import Link from "next/link";
import { RowStory, type Story } from "./cards";
import { Media } from "./media";
import { Breadcrumb, CategoryBand, SectionHeader } from "./ui";

type Crumb = { href: string; label: string };

/**
 * Khung trang "danh mục": dải màu chủ đạo (tên mục + menu con), ô quảng cáo,
 * tiêu đề H1 và phần nội dung. Dùng cho Kiến thức, Giải pháp, Hệ sinh thái,
 * Sản phẩm để mọi trang danh sách cùng một kiểu.
 */
export function ListingShell({
  band,
  navLabel,
  ad,
  title,
  intro,
  children,
}: {
  band: { title: string; href: string; items?: (Crumb & { active?: boolean })[] };
  navLabel: string;
  ad?: React.ReactNode;
  title: string;
  intro?: string | null;
  children: React.ReactNode;
}) {
  return (
    <>
      <CategoryBand
        title={band.title}
        titleHref={band.href}
        label={navLabel}
        items={(band.items ?? []).map((i) => ({ ...i, active: !!i.active }))}
      />
      {ad}
      <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-6">
        <h1 className="text-[28px] font-extrabold tracking-[-0.3px] md:text-[32px]">{title}</h1>
        {intro && <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-ink-2">{intro}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </>
  );
}

/**
 * Khung trang "bài viết": breadcrumb, H1 serif, sapo, ảnh, cột nội dung tối đa
 * 680px và cột phải 300px (xuống dưới bài trên điện thoại). Dùng cho bài
 * Kiến thức, trang dịch vụ, sản phẩm, giới thiệu, liên hệ và pháp lý.
 */
export function ArticleShell({
  top,
  breadcrumb,
  breadcrumbLabel,
  kicker,
  title,
  standfirst,
  meta,
  figure,
  sidebar,
  sidebarLabel,
  after,
  as: Tag = "article",
  children,
}: {
  /** Ô quảng cáo ngay dưới header. */
  top?: React.ReactNode;
  breadcrumb?: Crumb[];
  breadcrumbLabel: string;
  /** Nhãn nhỏ phía trên tiêu đề ("Dịch vụ 03", "Hữu cơ"...). */
  kicker?: string | null;
  title: string;
  standfirst?: string | null;
  meta?: React.ReactNode;
  figure?: { src: string; alt: string; caption?: string | null } | null;
  sidebar?: React.ReactNode;
  sidebarLabel: string;
  /** Khối toàn chiều ngang dưới bài ("Thêm từ Flora Global", bản đồ...). */
  after?: React.ReactNode;
  as?: "article" | "div";
  children: React.ReactNode;
}) {
  return (
    <>
      {top}
      <div className="mx-auto max-w-[1100px] px-4 pb-14 pt-8">
        <div className="flex flex-wrap items-start gap-10">
          <Tag className="min-w-0 max-w-[680px] flex-[1_1_560px]">
            {breadcrumb && breadcrumb.length > 0 && <Breadcrumb label={breadcrumbLabel} items={breadcrumb} />}
            {kicker && (
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.5px] text-primary">{kicker}</p>
            )}
            <h1 className="break-words font-serif text-[28px] font-bold leading-[1.18] tracking-[-0.3px] md:text-[38px]">
              {title}
            </h1>
            {standfirst && (
              <p className="mt-3 font-serif text-lg leading-snug text-ink-2 md:text-xl">{standfirst}</p>
            )}
            {meta}
            {figure && (
              <figure className="mt-6">
                <Media src={figure.src} alt={figure.alt} sizes="(max-width:768px) 100vw, 680px" preload />
                {figure.caption && (
                  <figcaption className="mt-2 text-[13px] leading-normal text-muted">{figure.caption}</figcaption>
                )}
              </figure>
            )}
            {children}
          </Tag>
          {sidebar && (
            <aside aria-label={sidebarLabel} className="flex min-w-0 flex-[1_1_300px] flex-col gap-8 lg:max-w-[300px]">
              {sidebar}
            </aside>
          )}
        </div>
        {after}
      </div>
    </>
  );
}

/** Hộp kêu gọi hành động ở cột phải: nền tối, nút màu harvest. */
export function CtaBox({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body?: string | null;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col gap-3 bg-dark p-5 text-white">
      <p className="font-serif text-xl font-bold leading-tight">{title}</p>
      {body && <p className="text-[13px] leading-normal text-on-dark">{body}</p>}
      <Link href={href} className="self-start bg-harvest px-3.5 py-2.5 text-[13px] font-bold hover:brightness-110">
        {cta}
      </Link>
    </div>
  );
}

/** Danh sách liên kết có tiêu đề mục (cột phải). */
export function LinkList({
  title,
  href,
  items,
}: {
  title: string;
  href?: string;
  items: { href: string; label: string; note?: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <SectionHeader title={title} href={href} />
      <ul>
        {items.map((item) => (
          <li key={item.href} className="border-b border-rule">
            <Link href={item.href} className="group block py-3">
              {item.note && <span className="block text-xs text-muted">{item.note}</span>}
              <span className="font-serif text-sm font-bold leading-[1.35] group-hover:underline">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Danh sách "Thêm từ Flora Global" dưới bài: ngày | tiêu đề + mô tả | ảnh. */
export function MoreStories({
  id,
  title,
  href,
  items,
}: {
  id: string;
  title: string;
  href?: string;
  items: (Story & { date: string })[];
}) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={id} className="mt-12">
      <SectionHeader id={id} title={title} href={href} />
      {items.map(({ date, ...story }) => (
        <RowStory key={story.href} date={date} story={story} />
      ))}
    </section>
  );
}
