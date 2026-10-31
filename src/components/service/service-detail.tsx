import Image from "next/image";
import type { CSSProperties } from "react";
import { ContentLocaleBadge } from "@/components/content-locale-badge";
import { ArticleShell, CtaBox, LinkList } from "@/components/news/shells";
import { ServiceBlocks, SpecRows } from "@/components/service/service-blocks";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { withLocale, type Locale } from "@/lib/i18n/config";
import type { LocalizedArticle } from "@/lib/i18n/localized-content";
import type { ServiceModel } from "@/lib/services/parse-service";
import { getServiceStrings } from "@/lib/services/service-i18n";
import { getServiceTagline } from "@/lib/services/service-tagline";
import { getVoacImageByStep, getVoacImages } from "@/lib/services/voac-media";
import { serviceIndex, type ServiceTheme } from "@/lib/services/service-theme";

type Props = {
  service: LocalizedArticle;
  model: ServiceModel;
  theme: ServiceTheme;
  label: string;
  lang: Locale;
  dict: Dictionary;
  others: { slug: string; title: string; label: string }[];
  /** Base path of the section this detail page lives under — "/solutions" or "/ecosystem". */
  sectionPath: string;
  /** Breadcrumb label for that section (e.g. dict.solutionsPage.title). */
  sectionLabel: string;
  /** Full-width block under the article (related knowledge posts). */
  after?: React.ReactNode;
};

const nn = (n: number) => String(n).padStart(2, "0");

function Metrics({ theme }: { theme: ServiceTheme }) {
  if (!theme.metrics?.length) return null;
  return (
    <dl
      className={`mt-6 grid grid-cols-2 gap-x-6 gap-y-5 ${
        theme.metrics.length === 3 ? "sm:grid-cols-3" : ""
      }`}
    >
      {theme.metrics.map((m) => (
        <div key={m.label} className="border-t border-[var(--line)] pt-3">
          <dt className="font-serif text-lg font-bold leading-snug text-[var(--ink)]">{m.value}</dt>
          <dd className="meta mt-1 text-[var(--muted)]">{m.label}</dd>
        </div>
      ))}
    </dl>
  );
}

function SectionHeading({ index, title }: { index: number; title: string }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="meta font-semibold text-[var(--sv)]">{nn(index)}</span>
        <span className="h-px flex-1 bg-[var(--sv-line)]" />
      </div>
      <h2 className="display-md mt-3 text-[var(--sv-deep)]">{title}</h2>
    </div>
  );
}

function Body({ model, lang, service, theme }: Props) {
  const s = getServiceStrings(lang);

  const allOf = (sec: (typeof model.sections)[number], kind: string) =>
    sec.blocks.length > 0 && sec.blocks.every((b) => b.kind === kind);

  const nonStepImages = getVoacImages(service.slug).filter((m) => m.step === null);
  const stepImageFor = (step: number | null) =>
    step == null ? null : getVoacImageByStep(service.slug, step);

  const secs = model.sections;
  const isSpecSecs = secs.length >= 2 && secs.every((sec) => allOf(sec, "specs"));
  const isParaSecs = secs.length >= 2 && secs.every((sec) => allOf(sec, "paragraph"));
  const hasStepImages = secs.some((sec) => stepImageFor(sec.step));
  // Có đúng một ảnh (không gắn số thứ tự) cho mỗi mục → trình bày kiểu hàng ngang.
  const oneToOneImages = secs.length >= 2 && nonStepImages.length >= secs.length;

  // Mỗi loại trang trên voac.vn có một kiểu trình bày riêng:
  //   lead         — trang chỉ có đoạn mở đầu (+ logo / trích dẫn)
  //   number-cards — lưới thẻ nhạt, ảnh trên đầu ("Dịch vụ cốt lõi")
  //   dark-cards   — lưới thẻ nền đậm, ảnh nền mờ ("Dịch vụ hỗ trợ")
  //   media-rows   — mỗi mục một hàng: nội dung + ảnh ("Tìm nguồn sản phẩm",
  //                  "Mô hình nông trại", "Đầu vào nông nghiệp hữu cơ")
  //   spec-grid    — lưới bảng thông số (dự phòng khi không có ảnh)
  //   prose        — mục dọc + dải logo chứng nhận, và các dịch vụ Flora
  const mode: "lead" | "number-cards" | "dark-cards" | "media-rows" | "spec-grid" | "prose" =
    secs.length === 0
      ? "lead"
      : isParaSecs && model.numbered
        ? "number-cards"
        : (model.numbered && hasStepImages) ||
            (isSpecSecs && oneToOneImages) ||
            (isParaSecs && oneToOneImages)
          ? "media-rows"
          : isParaSecs
            ? "dark-cards"
            : isSpecSecs
              ? "spec-grid"
              : "prose";

  // Các mode này đã dùng hết ảnh của voac.vn, bỏ lưới ảnh chú thích ở cuối để khỏi lặp.
  // "lead" chỉ có đoạn mở đầu + danh sách cây trồng → vẫn cần lưới ảnh có chú thích
  // ("Đối tác Nông trại": Gạo · Cà phê · Hạt điều).
  const imagesConsumed =
    mode !== "prose" && mode !== "spec-grid" && mode !== "lead";

  const captionSlugs = new Set(
    getVoacImages(service.slug)
      .map((m) => m.caption?.trim().toLowerCase())
      .filter(Boolean),
  );
  const tagsNotShownAsImages = model.tags.filter(
    (t) => !captionSlugs.has(t.trim().toLowerCase()),
  );

  // Ở chế độ prose, mục nào trùng tên với chú thích ảnh voac.vn thì ảnh đã
  // hiện ngay trong mục — bỏ khỏi lưới ảnh cuối trang để khỏi lặp.
  const proseSectionTitles =
    mode === "prose"
      ? new Set(secs.map((sec) => sec.title.trim().toLowerCase()))
      : undefined;

  return (
    <div className="mt-6">
      <div>
        <ContentLocaleBadge article={service} uiLocale={lang} />
        {model.lead.length > 0 && mode !== "lead" && (
          <div className="border-l-2 border-[var(--sv)] pl-5 text-[1.15rem] leading-relaxed text-[var(--ink)] [&_.svc-rich]:text-[1.15rem]">
            <ServiceBlocks blocks={model.lead} />
          </div>
        )}
      </div>

      {mode === "lead" &&
        (() => {
          // Trang chỉ có đoạn mở đầu. Nếu kết thúc bằng dải logo thì xếp
          // logo sang cột phải ("Chứng nhận hữu cơ VOAC"); nếu không thì để
          // dọc, logo & trích dẫn căn giữa ("Chứng nhận VOAC không hoá chất").
          const last = model.lead[model.lead.length - 1];
          const logos = last?.kind === "logos" ? last.images : null;
          const rest = logos ? model.lead.slice(0, -1) : model.lead;
          return logos ? (
            <div className="mt-4 grid gap-8 sm:grid-cols-[1fr_12rem] sm:items-start">
              <div className="leading-relaxed [&_.svc-rich]:text-[1.1rem]">
                <ServiceBlocks blocks={rest} />
              </div>
              <div className="flex flex-row flex-wrap justify-center gap-8 md:flex-col md:items-center">
                {logos.map((im, i) => (
                  <div key={i} className="relative h-36 w-36">
                    <Image
                      src={im.src}
                      alt={im.alt || "Certification mark"}
                      fill
                      sizes="144px"
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 leading-relaxed [&_.svc-rich]:text-[1.1rem]">
              <ServiceBlocks blocks={model.lead} />
            </div>
          );
        })()}

      {mode === "spec-grid" && (
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {model.sections.map((sec) => (
            <div key={sec.id} className="card flex flex-col p-6">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--sv-ink)]">
                {sec.title}
              </h3>
              <div className="mt-4">
                {sec.blocks.map((b, i) =>
                  b.kind === "specs" ? <SpecRows key={i} rows={b.rows} /> : null,
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {mode === "number-cards" && (
        // Lưới 2 cột như trang "Dịch vụ cốt lõi" trên voac.vn: mỗi mục là một
        // thẻ nền nhạt, ảnh trên đầu (mục nào không có ảnh thì chừa đúng khoảng
        // đó để tiêu đề các thẻ cùng hàng thẳng nhau), rồi "N. Tiêu đề" + mô tả.
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {model.sections.map((sec) => {
            const img = getVoacImageByStep(service.slug, sec.step);
            return (
              <article
                key={sec.id}
                className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--sv-line)] bg-[var(--sv-soft)]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--sv-softer)]">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.src}
                      alt={img.caption ?? sec.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="svc-watermark absolute inset-0 grid place-items-center text-[7rem]"
                    >
                      {nn(sec.step ?? 0)}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-snug text-[var(--sv-deep)]">
                    {sec.step}. {sec.title}
                  </h2>
                  <div className="mt-3 [&_.svc-rich]:text-[0.95rem] [&_.svc-rich]:leading-relaxed [&_.svc-rich]:text-[var(--muted)]">
                    <ServiceBlocks blocks={sec.blocks} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {mode === "dark-cards" && (
        // Lưới thẻ nền đậm, ảnh nền mờ như trang "Dịch vụ hỗ trợ" trên voac.vn.
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {model.sections.map((sec, i) => {
            const img = nonStepImages[i] ?? null;
            return (
              <article
                key={sec.id}
                className="relative isolate flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-[var(--sv-deep)] p-6 text-white"
              >
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.src}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="absolute inset-0 -z-10 h-full w-full object-cover opacity-15"
                  />
                )}
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight">
                  {sec.title}
                </h2>
                <div className="svc-on-dark mt-4">
                  <ServiceBlocks blocks={sec.blocks} />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {mode === "media-rows" && (
        // Mỗi mục một hàng ngang: nội dung một bên, ảnh một bên. Mục có đánh
        // số thì ảnh xen kẽ trái/phải ("Tìm nguồn sản phẩm"); còn lại ảnh nằm
        // bên phải ("Mô hình nông trại", "Đầu vào nông nghiệp hữu cơ").
        <div className="mt-10 space-y-6">
          {model.sections.map((sec, i) => {
            const img = stepImageFor(sec.step) ?? nonStepImages[i] ?? null;
            const imageRight = model.numbered ? (sec.step ?? i + 1) % 2 === 1 : true;
            const specRows = sec.blocks.flatMap((b) => (b.kind === "specs" ? b.rows : []));
            // Ảnh chụp sản phẩm (đoạn văn thường, không đánh số) hiện trọn khung
            // như voac.vn; ảnh cảnh đồng / logistics thì phủ kín ô cho đầy đặn.
            const contain = !model.numbered && specRows.length === 0;
            return (
              <div
                key={sec.id}
                className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--sv-line)] bg-[var(--sv-softer)]"
              >
                <div className={img ? "grid md:grid-cols-2" : ""}>
                  <div className="p-6">
                    <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--sv-deep)]">
                      {sec.step != null ? `${sec.step}. ` : ""}
                      {sec.title}
                    </h2>
                    {specRows.length > 0 ? (
                      <ul className="mt-4 space-y-2">
                        {specRows.map((r, j) => (
                          <li key={j} className="body-sm flex gap-2 text-[var(--ink)]">
                            <span aria-hidden className="text-[var(--sv)]">
                              •
                            </span>
                            <span>
                              <span className="text-[var(--muted)]">{r.key}:</span>{" "}
                              <span className="font-medium">{r.value}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-4">
                        <ServiceBlocks blocks={sec.blocks} />
                      </div>
                    )}
                  </div>
                  {img &&
                    (contain ? (
                      <div
                        className={`flex items-center justify-center bg-white p-5 md:p-6 ${
                          imageRight ? "" : "md:order-first"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.src}
                          alt={img.caption ?? sec.title}
                          loading="lazy"
                          className="max-h-[22rem] w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div
                        className={`relative min-h-[15rem] ${imageRight ? "" : "md:order-first"}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.src}
                          alt={img.caption ?? sec.title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mode === "prose" && (
        <div className="mt-10 space-y-12">
          {model.sections.map((sec, i) =>
            theme.group === "flora" ? (
              <section key={sec.id}>
                <SectionHeading index={i + 1} title={sec.title} />
                <div className="mt-5">
                  <ServiceBlocks blocks={sec.blocks} />
                </div>
              </section>
            ) : (
              <section
                key={sec.id}
                className={
                  i > 0 ? "border-t border-[var(--sv-line)] pt-12" : undefined
                }
              >
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--sv-deep)]">
                  {sec.step != null ? `${sec.step}. ` : ""}
                  {sec.title}
                </h2>
                {(() => {
                  const img = getVoacImages(service.slug).find(
                    (m) =>
                      m.caption?.trim().toLowerCase() === sec.title.trim().toLowerCase(),
                  );
                  return img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.src}
                      alt={img.caption ?? sec.title}
                      loading="lazy"
                      className="mt-4 aspect-[16/10] w-full rounded-[var(--radius-card)] border border-[var(--sv-line)] object-cover"
                    />
                  ) : null;
                })()}
                <div className="mt-4">
                  <ServiceBlocks blocks={sec.blocks} />
                </div>
              </section>
            ),
          )}
        </div>
      )}

      {!imagesConsumed && (
        <VoacCaptionGrid slug={service.slug} exclude={proseSectionTitles} />
      )}

      {/* Bỏ chip trùng với chú thích ảnh — nếu không, "Gạo · Cà phê · Hạt điều"
          hiện hai lần liền nhau: một lần dưới ảnh, một lần dưới dạng chip. */}
      {tagsNotShownAsImages.length > 0 && (
        <div className="mt-12 rounded-[var(--radius-card)] border border-[var(--sv-line)] bg-[var(--sv-softer)] p-6">
          <p className="eyebrow text-[var(--sv-ink)]">{s.network}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tagsNotShownAsImages.map((t) => (
              <span
                key={t}
                className="body-sm rounded-full border border-[var(--sv-line)] bg-[var(--surface)] px-4 py-1.5 text-[var(--ink)]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ServiceDetail(props: Props) {
  const { service, model, theme, label, lang, dict, others, sectionPath, sectionLabel, after } = props;
  const s = getServiceStrings(lang);
  return (
    <div className="svc" style={{ ["--sv" as string]: theme.accent } as CSSProperties}>
      <ArticleShell
        breadcrumbLabel={dict.news.breadcrumb}
        breadcrumb={[
          { href: withLocale(lang, sectionPath), label: sectionLabel },
          { href: withLocale(lang, `${sectionPath}/${service.slug}`), label },
        ]}
        kicker={`${s.service} ${nn(serviceIndex(service.slug))}`}
        title={service.title}
        standfirst={getServiceTagline(lang, service.slug) ?? model.tagline ?? null}
        meta={<Metrics theme={theme} />}
        figure={service.cover ? { src: service.cover, alt: service.title } : null}
        sidebarLabel={dict.news.sidebar}
        sidebar={
          <>
            <CtaBox
              title={dict.common.readyPartner}
              href={withLocale(lang, "/contact")}
              cta={dict.common.initiatePartnership}
            />
            <LinkList
              title={dict.common.otherServices}
              href={withLocale(lang, sectionPath)}
              items={others.map((o) => ({
                href: withLocale(lang, `${sectionPath}/${o.slug}`),
                label: o.title,
                note: o.label,
              }))}
            />
          </>
        }
        after={after}
      >
        <Body {...props} />
      </ArticleShell>
    </div>
  );
}

/**
 * Lưới ảnh có chú thích, giữ nguyên cách bố trí của voac.vn. Dùng flex thay
 * grid để hàng cuối tự căn giữa — số ảnh là 3, 4 hay 5 đều không bị lẻ hàng.
 */
function VoacCaptionGrid({ slug, exclude }: { slug: string; exclude?: Set<string> }) {
  const items = getVoacImages(slug).filter(
    (m) =>
      m.step === null &&
      !(exclude && m.caption && exclude.has(m.caption.trim().toLowerCase())),
  );
  if (items.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex flex-wrap justify-center gap-5">
        {items.map((m) => (
          <figure key={m.src} className="w-full max-w-[15rem] flex-1 basis-48">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.src}
              alt={m.caption ?? ""}
              loading="lazy"
              className="aspect-square w-full rounded-[var(--radius-card)] border border-[var(--sv-line)] object-cover"
            />
            {m.caption && (
              <figcaption className="mt-3 text-center font-semibold text-[var(--ink)]">
                {m.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}
