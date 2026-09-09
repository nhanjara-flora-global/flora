import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ContentLocaleBadge } from "@/components/content-locale-badge";
import { ServiceBlocks, SpecRows } from "@/components/service/service-blocks";
import { ServiceIcon } from "@/components/service/service-icon";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { withLocale, type Locale } from "@/lib/i18n/config";
import type { LocalizedArticle } from "@/lib/i18n/localized-content";
import type { ServiceModel } from "@/lib/services/parse-service";
import { getServiceStrings } from "@/lib/services/service-i18n";
import { getServiceTagline } from "@/lib/services/service-tagline";
import { getVoacImageByStep, getVoacImages } from "@/lib/services/voac-media";
import {
  getServiceTheme,
  serviceIndex,
  type ServiceTheme,
} from "@/lib/services/service-theme";

type Props = {
  service: LocalizedArticle;
  model: ServiceModel;
  theme: ServiceTheme;
  label: string;
  lang: Locale;
  dict: Dictionary;
  others: { slug: string; title: string; label: string }[];
};

const nn = (n: number) => String(n).padStart(2, "0");

function Crumbs({ lang, dict, label, dark }: { lang: Locale; dict: Dictionary; label: string; dark?: boolean }) {
  const base = dark ? "text-white/70" : "text-[var(--muted)]";
  const hov = dark ? "hover:text-white" : "hover:text-[var(--sv-ink)]";
  return (
    <nav className={`meta flex flex-wrap items-center gap-2 ${base}`}>
      <Link href={withLocale(lang, "/")} className={hov}>
        Flora Global
      </Link>
      <span aria-hidden>→</span>
      <Link href={withLocale(lang, "/services")} className={hov}>
        {dict.servicesPage.title}
      </Link>
      <span aria-hidden>→</span>
      <span className={dark ? "text-white" : "font-semibold text-[var(--ink)]"}>{label}</span>
    </nav>
  );
}

function Metrics({ theme, dark }: { theme: ServiceTheme; dark?: boolean }) {
  if (!theme.metrics?.length) return null;
  return (
    <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
      {theme.metrics.map((m) => (
        <div key={m.label} className="max-w-[13rem]">
          <dt
            className={`font-[family-name:var(--font-display)] text-2xl font-semibold ${
              dark ? "text-white" : "text-[var(--sv)]"
            }`}
          >
            {m.value}
          </dt>
          <dd className={`meta mt-1 uppercase ${dark ? "text-white/70" : "text-[var(--muted)]"}`}>
            {m.label}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function CtaButton({ lang, dict, dark }: { lang: Locale; dict: Dictionary; dark?: boolean }) {
  return (
    <Link
      href={withLocale(lang, "/contact")}
      className={`body-sm mt-8 inline-flex items-center gap-2 rounded-[var(--radius-control)] px-6 py-3 font-semibold uppercase tracking-wide shadow-[var(--shadow-soft)] transition ${
        dark
          ? "bg-white text-[var(--sv-deep)] hover:bg-white/90"
          : "bg-[var(--sv)] text-white hover:bg-[var(--sv-deep)]"
      }`}
    >
      {dict.common.initiatePartnership}
      <span aria-hidden>→</span>
    </Link>
  );
}

function HeroSpotlight({ service, theme, label, lang, dict }: Props) {
  return (
    <header className="relative isolate overflow-hidden bg-[var(--sv-deep)] text-white">
      {service.cover && (
        <Image
          src={service.cover}
          alt={service.title}
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
      <div className="container-page flex min-h-[30rem] flex-col justify-between gap-12 pb-14 pt-6 md:min-h-[68vh]">
        <Crumbs lang={lang} dict={dict} label={label} dark />
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <ServiceIcon name={theme.icon} className="h-5 w-5" />
            </span>
            <span className="eyebrow text-white/80">
              {getServiceStrings(lang).service} {nn(serviceIndex(service.slug))} · {label}
            </span>
          </div>
          <h1 className="display-lg mt-5 text-white">{service.title}</h1>
          {getServiceTagline(lang, service.slug) && (
            <p className="lead mt-4 max-w-2xl text-white/85">
              {getServiceTagline(lang, service.slug)}
            </p>
          )}
          <Metrics theme={theme} dark />
          <CtaButton lang={lang} dict={dict} dark />
        </div>
      </div>
    </header>
  );
}

function HeroEditorial({ service, model, theme, label, lang, dict }: Props) {
  const idx = serviceIndex(service.slug);
  const showImage = Boolean(service.cover);
  const tagline = getServiceTagline(lang, service.slug) ?? model.tagline ?? service.excerpt;

  return (
    <header className="relative overflow-hidden border-b border-[var(--sv-line)] bg-[var(--sv-soft)]">
      <span
        aria-hidden
        className="svc-watermark pointer-events-none absolute -right-6 -top-16 hidden text-[16rem] sm:block md:text-[22rem]"
      >
        {nn(idx)}
      </span>
      <div className="container-page relative py-6">
        <Crumbs lang={lang} dict={dict} label={label} />
      </div>
      <div className="container-page relative grid gap-10 pb-[var(--section-y-sm)] md:grid-cols-[1.25fr_1fr] md:items-center md:pb-[var(--section-y)]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--sv)] text-white">
              <ServiceIcon name={theme.icon} className="h-5 w-5" />
            </span>
            <span className="eyebrow text-[var(--sv-ink)]">
              {getServiceStrings(lang).service} {nn(idx)} · {label}
            </span>
          </div>
          <h1 className="display-lg mt-5 text-[var(--sv-deep)]">{service.title}</h1>
          {tagline && <p className="lead mt-4 max-w-xl text-[var(--muted)]">{tagline}</p>}
          <Metrics theme={theme} />
          <CtaButton lang={lang} dict={dict} />
        </div>

        {showImage ? (
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-card)] border border-[var(--sv-line)] shadow-[var(--shadow-lift)]">
            <Image
              src={service.cover!}
              alt={service.title}
              fill
              priority
              sizes="(max-width:768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="relative mx-auto grid aspect-square w-full max-w-xs place-items-center rounded-full border border-[var(--sv-line)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
            <div className="grid h-2/3 w-2/3 place-items-center rounded-full bg-[var(--sv-soft)]">
              <ServiceIcon name={theme.icon} className="h-1/2 w-1/2 text-[var(--sv)]" strokeWidth={1.2} />
            </div>
          </div>
        )}
      </div>
    </header>
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
    <div className="container-page section-y">
      <div className="mx-auto max-w-3xl">
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
            <div className="mx-auto mt-4 grid max-w-4xl gap-10 md:grid-cols-[1fr_18rem] md:items-start">
              <div className="leading-relaxed [&_.svc-rich]:text-[1.1rem]">
                <ServiceBlocks blocks={rest} />
              </div>
              <div className="flex flex-row flex-wrap justify-center gap-8 md:flex-col md:items-center">
                {logos.map((im, i) => (
                  <div key={i} className="relative h-40 w-40 sm:h-44 sm:w-44">
                    <Image
                      src={im.src}
                      alt={im.alt || "Certification mark"}
                      fill
                      sizes="176px"
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto mt-4 max-w-3xl leading-relaxed [&_.svc-rich]:text-[1.1rem]">
              <ServiceBlocks blocks={model.lead} />
            </div>
          );
        })()}

      {mode === "spec-grid" && (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="mt-12 grid gap-6 md:grid-cols-2">
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
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {model.sections.map((sec, i) => {
            const img = nonStepImages[i] ?? null;
            return (
              <article
                key={sec.id}
                className="relative isolate flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-[var(--sv-deep)] p-7 text-white md:p-8"
              >
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.src}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
                  />
                )}
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight">
                  {sec.title}
                </h2>
                <div className="mt-4 [&_.svc-rich]:text-[0.95rem] [&_.svc-rich]:leading-relaxed [&_.svc-rich]:text-white/80 [&_.svc-rich_a]:text-white [&_.svc-rich_strong]:text-white">
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
        <div className="mt-12 space-y-6">
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
                  <div className="p-7 md:p-9">
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
        <div className="mx-auto mt-12 max-w-3xl space-y-14">
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
                  i > 0 ? "border-t border-[var(--sv-line)] pt-14" : undefined
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
        <div className="mx-auto mt-12 max-w-3xl rounded-[var(--radius-card)] border border-[var(--sv-line)] bg-[var(--sv-softer)] p-6">
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

function CtaPanel({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="bg-[var(--sv)] text-white">
      <div className="container-page flex flex-col items-start gap-6 py-[var(--section-y-sm)] md:flex-row md:items-center md:justify-between">
        <p className="font-[family-name:var(--font-display)] text-2xl md:max-w-2xl md:text-[1.75rem]">
          {dict.common.readyPartner}
        </p>
        <Link
          href={withLocale(lang, "/contact")}
          className="body-sm shrink-0 rounded-[var(--radius-control)] bg-white px-7 py-3 font-semibold uppercase tracking-wide text-[var(--sv-deep)] transition hover:bg-white/90"
        >
          {dict.common.initiatePartnership}
        </Link>
      </div>
    </section>
  );
}

function Explore({ lang, others }: { lang: Locale; others: Props["others"] }) {
  const s = getServiceStrings(lang);
  return (
    <section className="bg-[var(--bg-soft)]">
      <div className="container-page section-y">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="display-md text-[var(--ink)]">{s.explore}</h2>
          <Link
            href={withLocale(lang, "/services")}
            className="body-sm shrink-0 font-semibold text-[var(--brand)] hover:underline"
          >
            {s.viewAll} →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((o) => {
            const t = getServiceTheme(o.slug);
            return (
              <Link
                key={o.slug}
                href={withLocale(lang, `/services/${o.slug}`)}
                className="card card-interactive group flex items-start gap-4 p-5"
                style={{ ["--sv" as string]: t.accent } as CSSProperties}
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sv-soft)] text-[var(--sv)]">
                  <ServiceIcon name={t.icon} className="h-5 w-5" />
                </span>
                <span>
                  <span className="meta uppercase text-[var(--muted)]">{o.label}</span>
                  <span className="mt-1 block font-[family-name:var(--font-display)] font-semibold text-[var(--ink)] transition-colors group-hover:text-[var(--sv)]">
                    {o.title}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ServiceDetail(props: Props) {
  const { theme } = props;
  return (
    <div className="svc" style={{ ["--sv" as string]: theme.accent } as CSSProperties}>
      {theme.hero === "spotlight" ? <HeroSpotlight {...props} /> : <HeroEditorial {...props} />}
      <Body {...props} />
      <CtaPanel lang={props.lang} dict={props.dict} />
      <Explore lang={props.lang} others={props.others} />
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
    <div className="mx-auto mt-14 max-w-4xl">
      <div className="flex flex-wrap justify-center gap-6">
        {items.map((m) => (
          <figure key={m.src} className="w-full max-w-[19rem] flex-1 basis-64">
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
