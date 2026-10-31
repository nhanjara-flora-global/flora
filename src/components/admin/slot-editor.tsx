"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { resetSlot, saveSlot } from "@/app/actions/site";
import { uploadPostImage } from "@/app/actions/upload";
import { AdBand, AdCreativeView, adWidth } from "@/components/news/ad-creative";
import { FieldStoryBanner, HomeStrip } from "@/components/news/banners";
import { LeadStory, StoryCard, type Story } from "@/components/news/cards";
import { ADMIN_LOCALES, viDateTime } from "@/lib/admin/site";
import { compressImage } from "@/lib/compress-image";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";
import { localHref } from "@/lib/news-format";
import type { AdPlacement, ResolvedSlot, SlotCopy, SlotField, SlotKind } from "@/lib/site-slots";

export type SlotEditorProps = {
  def: {
    key: string;
    kind: SlotKind;
    label: string;
    where: string;
    fields: Partial<Record<SlotField, string>>;
    imageHint: string | null;
    placements: AdPlacement[];
  };
  defaults: Record<Locale, { href: string; image: string | null; copy: SlotCopy }>;
  initial: {
    active: boolean;
    href: string;
    imageUrl: string;
    content: Partial<Record<Locale, Partial<SlotCopy>>>;
    startsAt: string | null;
    endsAt: string | null;
    updatedAt: string;
  } | null;
  /** false khi chưa chạy migration / chưa bật Supabase. */
  canSave: boolean;
  backHref: string;
  siteUrl: string;
};

const IMG_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";
const MAX_LEN: Record<SlotField, number> = { eyebrow: 60, title: 160, body: 320, cta: 40 };

const field =
  "w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]";
const labelCls = "mb-1 block text-sm font-medium";
const hint = "mt-1 block text-xs text-[var(--muted)]";
const btn =
  "rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-60";
const btnSm =
  "rounded-md border border-[var(--line)] bg-white px-2.5 py-1 text-xs font-medium hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-60";
const btnPrimary =
  "rounded-md bg-[var(--brand)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--brand-2)] disabled:opacity-60";

const pad = (n: number) => String(n).padStart(2, "0");
/** ISO → giá trị ô datetime-local theo giờ máy (người dùng ở VN). */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Card({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-md border border-[var(--line)] bg-white">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {right}
      </header>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

function LangTabs({ value, onChange }: { value: Locale; onChange: (l: Locale) => void }) {
  return (
    <div className="flex gap-1" role="tablist">
      {ADMIN_LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          role="tab"
          aria-selected={value === l}
          onClick={() => onChange(l)}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            value === l
              ? "border-[var(--brand)] bg-[var(--brand)] text-white"
              : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--brand)]"
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}

const emptyContent = () =>
  Object.fromEntries(locales.map((l) => [l, {}])) as Record<Locale, Partial<SlotCopy>>;

export function SlotEditor({ def, defaults, initial, canSave, backHref, siteUrl }: SlotEditorProps) {
  const router = useRouter();
  const [lang, setLang] = useState<Locale>("vi");
  const [active, setActive] = useState(initial?.active ?? true);
  const [href, setHref] = useState(initial?.href ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [content, setContent] = useState<Record<Locale, Partial<SlotCopy>>>(() => ({
    ...emptyContent(),
    ...Object.fromEntries(locales.map((l) => [l, { ...initial?.content?.[l] }])),
  }));
  const [startsAt, setStartsAt] = useState(toLocalInput(initial?.startsAt ?? null));
  const [endsAt, setEndsAt] = useState(toLocalInput(initial?.endsAt ?? null));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  // Mốc giờ lúc mở trang — đủ để báo "chờ tới ngày / đã hết hạn".
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const touch = () => {
    setDirty(true);
    setNotice("");
  };
  const setText = (l: Locale, f: SlotField, v: string) => {
    setContent((c) => ({ ...c, [l]: { ...c[l], [f]: v } }));
    touch();
  };

  const fields = Object.entries(def.fields) as [SlotField, string][];
  const d = defaults[lang];
  const preview = (l: Locale): ResolvedSlot => {
    const base = defaults[l];
    const own = content[l] ?? {};
    const pick = (f: SlotField) => own[f]?.trim() || base.copy[f];
    return {
      visible: true,
      href: href.trim() || base.href,
      image: imageUrl.trim() || base.image,
      copy: { eyebrow: pick("eyebrow"), title: pick("title"), body: pick("body"), cta: pick("cta") },
    };
  };
  const slot = preview(lang);
  const story = (s: ResolvedSlot): Story => ({
    href: localHref(lang, s.href),
    title: s.copy.title,
    excerpt: s.copy.body,
    image: s.image,
    meta: [s.copy.eyebrow],
  });

  async function save() {
    setError("");
    setNotice("");
    setBusy("Đang lưu…");
    const res = await saveSlot({
      key: def.key,
      active,
      href,
      imageUrl,
      content,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
    }).catch(() => ({ ok: false as const, error: "Mất kết nối — thử lại." }));
    setBusy("");
    if (!res.ok) return setError(res.error);
    setDirty(false);
    setNotice("Đã lưu — web cập nhật ngay.");
    router.refresh();
  }

  async function reset() {
    if (!confirm("Bỏ mọi thay đổi của ô này và quay về nội dung mặc định?")) return;
    setError("");
    setBusy("Đang khôi phục…");
    const res = await resetSlot(def.key).catch(() => ({ ok: false as const, error: "Mất kết nối — thử lại." }));
    setBusy("");
    if (!res.ok) return setError(res.error);
    setActive(true);
    setHref("");
    setImageUrl("");
    setContent(emptyContent());
    setStartsAt("");
    setEndsAt("");
    setDirty(false);
    setNotice("Đã quay về nội dung mặc định.");
    router.refresh();
  }

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setBusy("Đang tải ảnh…");
    try {
      const fd = new FormData();
      fd.append("file", await compressImage(file, 1920));
      const res = await uploadPostImage(fd);
      if (!res.ok) setError(res.error);
      else {
        setImageUrl(res.url);
        touch();
      }
    } catch {
      setError("Không đọc được ảnh này, vui lòng chọn ảnh khác (JPG, PNG, WebP).");
    } finally {
      setBusy("");
    }
  }

  function pasteImageLink() {
    const url = prompt("Dán link ảnh trực tiếp (https://…) hoặc đường dẫn trong web (/images/…)");
    if (url === null || !url.trim()) return;
    if (!/^(https:\/\/|\/)\S+$/.test(url.trim())) {
      setError("Link ảnh phải bắt đầu bằng https:// hoặc / và không có dấu cách.");
      return;
    }
    setError("");
    setImageUrl(url.trim());
    touch();
  }

  const schedule =
    startsAt && new Date(startsAt).getTime() > now
      ? `Nội dung này chờ tới ${viDateTime(new Date(startsAt).toISOString())} mới hiện.`
      : endsAt && new Date(endsAt).getTime() <= now
        ? "Đã quá ngày kết thúc — web đang dùng nội dung mặc định."
        : null;

  // Mỗi cỡ / màu chỉ xem trước một lần.
  const placements = def.placements.filter(
    (p, i, all) => all.findIndex((q) => q.size === p.size && q.tone === p.tone && !!q.reverse === !!p.reverse) === i,
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        <Card title="Chữ trên ô" right={<LangTabs value={lang} onChange={setLang} />}>
          {fields.map(([f, name]) => {
            const value = content[lang]?.[f] ?? "";
            const long = f === "body";
            const props = {
              value,
              maxLength: MAX_LEN[f],
              placeholder: d.copy[f] || "(mặc định để trống)",
              onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setText(lang, f, e.target.value),
              className: field,
            };
            return (
              <label key={f} className="block">
                <span className={labelCls}>
                  {name} <span className="font-normal text-[var(--muted)]">({localeLabels[lang]})</span>
                </span>
                {long ? <textarea rows={3} {...props} /> : <input {...props} />}
                <span className={hint}>
                  {value.trim() ? `${value.trim().length}/${MAX_LEN[f]} ký tự` : "Để trống = dùng chữ mặc định (chữ mờ trong ô)."}
                </span>
              </label>
            );
          })}
          {lang !== "vi" && (
            <p className="text-xs text-[var(--muted)]">
              Ô tiếng Anh để trống thì dùng chữ tiếng Anh mặc định — không tự dịch từ tiếng Việt.
            </p>
          )}
        </Card>

        <Card title="Xem trước" right={<LangTabs value={lang} onChange={setLang} />}>
          {!active && def.kind === "ad" && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
              Đang tắt — ô này không hiện ở trang nào. Khung dưới chỉ để xem trước.
            </p>
          )}
          {schedule && <p className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-900">{schedule}</p>}
          {/* Bấm vào khung xem trước không chuyển trang. */}
          <div className="site-news space-y-5" onClickCapture={(e) => e.preventDefault()}>
            {def.kind === "ad" &&
              placements.map((p) => (
                <div key={`${p.size}-${p.tone}-${p.reverse}`}>
                  <p className="mb-1.5 text-xs text-[var(--muted)]">{p.page}</p>
                  <AdBand
                    innerClassName={`${adWidth(p.size)} ${p.size === "mpu" || p.size === "halfpage" ? "flex flex-col items-center" : ""}`}
                  >
                    <AdCreativeView slot={slot} size={p.size} tone={p.tone} reverse={p.reverse} lang={lang} />
                  </AdBand>
                </div>
              ))}
            {def.key === "home-strip" && <HomeStrip slot={slot} lang={lang} />}
            {def.key === "home-lead" && (
              <div className="max-w-[640px]">
                <LeadStory story={story(slot)} />
              </div>
            )}
            {def.key.startsWith("home-side") && (
              <div className="max-w-[340px]">
                <StoryCard story={story(slot)} size="lg" />
              </div>
            )}
            {def.key === "field-story" && <FieldStoryBanner slot={slot} lang={lang} />}
          </div>
        </Card>
      </div>

      <aside className="space-y-5">
        <Card title="Lưu">
          <p className="text-sm text-[var(--muted)]">
            {initial
              ? `Đã sửa lần cuối ${viDateTime(initial.updatedAt)}.`
              : "Đang dùng nội dung mặc định."}
            {dirty && <b className="text-amber-700"> Có thay đổi chưa lưu.</b>}
          </p>
          {!canSave && (
            <p className="text-sm text-amber-800">Chưa lưu được — xem hướng dẫn ở đầu trang.</p>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={save} disabled={!!busy || !canSave} className={btnPrimary}>
              Lưu
            </button>
            {initial && (
              <button type="button" onClick={reset} disabled={!!busy || !canSave} className={btn}>
                Khôi phục mặc định
              </button>
            )}
            <a
              href={`${siteUrl}/vi${def.key === "field-story" ? "/video" : ""}`}
              target="_blank"
              rel="noreferrer"
              className={btn}
            >
              Xem trên web ↗
            </a>
          </div>
          {busy && <p className="text-sm text-[var(--muted)]">{busy}</p>}
          {error && <p className="text-sm text-rose-700">{error}</p>}
          {notice && <p className="text-sm text-emerald-700">{notice}</p>}
          <a href={backHref} className="block text-xs text-[var(--muted)] hover:text-[var(--brand)]">
            ← Quay lại danh sách
          </a>
        </Card>

        <Card title="Hiển thị">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => {
                setActive(e.target.checked);
                touch();
              }}
              className="mt-0.5"
            />
            <span>
              {def.kind === "ad" ? (
                <>
                  <b>Hiện quảng cáo này</b>
                  <span className={hint}>Bỏ chọn = ô biến mất khỏi mọi trang.</span>
                </>
              ) : (
                <>
                  <b>Dùng nội dung đã sửa</b>
                  <span className={hint}>Bỏ chọn = tạm dùng lại mặc định, nội dung đã nhập vẫn được giữ.</span>
                </>
              )}
            </span>
          </label>
          <label className="block">
            <span className={labelCls}>Hiện từ</span>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => {
                setStartsAt(e.target.value);
                touch();
              }}
              className={field}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Đến</span>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => {
                setEndsAt(e.target.value);
                touch();
              }}
              className={field}
            />
            <span className={hint}>
              Để trống = hiện ngay, không hết hạn. Ngoài khoảng ngày, web dùng nội dung mặc định (trễ tối
              đa ~5 phút).
            </span>
          </label>
        </Card>

        <Card title="Ảnh">
          {slot.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- xem nhanh, có thể là link ngoài
            <img src={slot.image} alt="" className="aspect-[16/9] w-full rounded-md object-cover" />
          ) : (
            <p className="text-sm text-[var(--muted)]">Ô này không có ảnh.</p>
          )}
          <p className="text-xs text-[var(--muted)]">
            {imageUrl ? "Ảnh đã tải / dán." : "Đang dùng ảnh mặc định."}
            {def.imageHint && <> Nên dùng ảnh {def.imageHint}.</>}
          </p>
          <div className="flex flex-wrap gap-2">
            <label className={`${btnSm} cursor-pointer`}>
              Tải ảnh lên
              <input type="file" accept={IMG_ACCEPT} onChange={onPickImage} className="sr-only" disabled={!!busy || !canSave} />
            </label>
            <button type="button" onClick={pasteImageLink} className={btnSm}>
              Dán link ảnh
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={() => {
                  setImageUrl("");
                  touch();
                }}
                className={btnSm}
              >
                Dùng ảnh mặc định
              </button>
            )}
          </div>
        </Card>

        <Card title="Link khi bấm">
          <label className="block">
            <input
              value={href}
              onChange={(e) => {
                setHref(e.target.value);
                touch();
              }}
              placeholder={defaults.vi.href}
              className={field}
            />
            <span className={hint}>
              Trang trong web: <code>/products/…</code> (web tự thêm /vi, /en). Hoặc <code>https://…</code>,{" "}
              <code>tel:0932108990</code>. Để trống = <code className="break-all">{defaults.vi.href}</code>.
            </span>
          </label>
        </Card>
      </aside>
    </div>
  );
}
