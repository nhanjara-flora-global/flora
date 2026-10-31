import Link from "next/link";
import { notFound } from "next/navigation";
import { SlotEditor, type SlotEditorProps } from "@/components/admin/slot-editor";
import { Badge, Notice, PageHeader, StatCard } from "@/components/admin/ui";
import { SLOT_STATE_LABEL, SLOT_STATE_TONE, viDateTime } from "@/lib/admin/site";
import { loadSlotsAdmin, type AdminLoad } from "@/lib/admin/site-data";
import { locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { SITE_URL } from "@/lib/seo";
import { mergeSlot, slotDef, SLOTS, slotState, type SlotKind } from "@/lib/site-slots";

/** Phần dùng chung của /admin/banners, /admin/ads (danh sách + trang sửa) và /admin/seo. */

export function SiteSetupNotice({ load }: { load: Pick<AdminLoad<unknown>, "setup" | "error"> }) {
  if (load.setup === "local") {
    return (
      <Notice tone="warn" title="Chưa bật Supabase.">
        Web đang hiện nội dung mặc định. Cần <code>DATA_SOURCE=supabase</code> để lưu thay đổi.
      </Notice>
    );
  }
  if (load.setup === "migration") {
    return (
      <Notice tone="warn" title="Chưa tạo bảng lưu trong database.">
        Mở Supabase → <b>SQL Editor</b>, dán toàn bộ file{" "}
        <code>supabase/migrations/0004_site_content.sql</code> rồi bấm Run. Trước khi chạy, web vẫn
        hiện nội dung mặc định nhưng chưa lưu được thay đổi.
      </Notice>
    );
  }
  if (load.setup === "config" || load.error) {
    return (
      <Notice tone="warn" title="Không đọc được dữ liệu.">
        {load.error}
      </Notice>
    );
  }
  return null;
}

const KIND_TEXT: Record<SlotKind, { title: string; base: string; intro: React.ReactNode }> = {
  banner: {
    title: "Banner",
    base: "/admin/banners",
    intro: (
      <>
        Ảnh và chữ ở các khối lớn trên trang chủ và trang Video. Mỗi ô có thể đổi <b>ảnh</b>,{" "}
        <b>chữ tiếng Việt / tiếng Anh</b> và <b>link</b>, hẹn <b>ngày bắt đầu / kết thúc</b> (hết hạn tự
        quay về mặc định). Ô nào để trống thì web giữ nội dung mặc định.
      </>
    ),
  },
  ad: {
    title: "Quảng cáo",
    base: "/admin/ads",
    intro: (
      <>
        Các ô giới thiệu sản phẩm / dịch vụ Flora chen giữa nội dung trên web (không kèm nhãn “Quảng cáo”). Một mẫu quảng cáo hiện ở nhiều trang — sửa một lần là đổi ở
        mọi chỗ (xem cột “Hiện ở”). <b>Tắt</b> một mẫu thì ô đó biến mất khỏi mọi trang. Hẹn ngày: ngoài
        khoảng ngày, ô hiện lại nội dung mặc định.
      </>
    ),
  },
};

export async function SlotListPage({ kind }: { kind: SlotKind }) {
  const load = await loadSlotsAdmin();
  const text = KIND_TEXT[kind];
  const defs = SLOTS.filter((s) => s.kind === kind);
  const items = defs.map((def) => {
    const row = load.rows.get(def.key);
    return { def, row, state: slotState(row), vi: mergeSlot(def, "vi", row) };
  });
  const edited = items.filter((i) => i.state !== "default").length;
  const live = items.filter((i) => i.state === "live").length;
  const off = items.filter((i) => i.state === "off").length;

  return (
    <>
      <PageHeader
        eyebrow="Nội dung"
        title={text.title}
        description={`${defs.length} ô sửa được · bấm Sửa để đổi ảnh, chữ, link và lịch hiện.`}
        action={
          <Link
            href="/vi"
            target="_blank"
            className="rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            Xem trang chủ ↗
          </Link>
        }
      />
      <SiteSetupNotice load={load} />
      <Notice title="Cách dùng">{text.intro}</Notice>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Ô sửa được" value={defs.length} />
        <StatCard label="Đã sửa · đang hiện" value={live} hint={`${edited} ô có thay đổi`} />
        <StatCard
          label={kind === "ad" ? "Đang tắt" : "Hẹn ngày / hết hạn"}
          value={kind === "ad" ? off : items.filter((i) => i.state === "pending" || i.state === "expired").length}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map(({ def, row, state, vi }) => (
          <article
            key={def.key}
            className="flex flex-col overflow-hidden rounded-md border border-[var(--line)] bg-white"
          >
            <div className="relative aspect-[16/9] bg-[var(--bg-soft)]">
              {vi.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- ảnh xem nhanh trong admin, có thể là link ngoài
                <img src={vi.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--brand)] p-5 text-center text-sm text-white">
                  {vi.copy.body || vi.copy.title}
                </div>
              )}
              <span className="absolute left-3 top-3">
                <Badge
                  label={SLOT_STATE_LABEL(kind, state)}
                  tone={SLOT_STATE_TONE[state]}
                />
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h2 className="font-semibold">{def.label}</h2>
              <p className="line-clamp-2 text-sm text-[var(--ink)]">{vi.copy.title || vi.copy.body}</p>
              <p className="text-xs text-[var(--muted)]">
                <b>Hiện ở:</b> {def.where}
              </p>
              {row && (
                <p className="text-xs text-[var(--muted)]">
                  Sửa lần cuối {viDateTime(row.updated_at)}
                  {row.starts_at && ` · từ ${viDateTime(row.starts_at)}`}
                  {row.ends_at && ` · đến ${viDateTime(row.ends_at)}`}
                </p>
              )}
              <div className="mt-auto pt-2">
                <Link
                  href={`${text.base}/${encodeURIComponent(def.key)}`}
                  className="inline-block rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-2)]"
                >
                  Sửa
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export async function SlotEditPage({ kind, slotKey }: { kind: SlotKind; slotKey: string }) {
  const def = slotDef(decodeURIComponent(slotKey));
  if (!def || def.kind !== kind) notFound();
  const load = await loadSlotsAdmin();
  const row = load.rows.get(def.key);

  const props: SlotEditorProps = {
    def: {
      key: def.key,
      kind: def.kind,
      label: def.label,
      where: def.where,
      fields: def.fields,
      imageHint: def.imageHint,
      placements: def.placements ?? [],
    },
    defaults: Object.fromEntries(
      locales.map((l) => [l, def.defaults(getDictionary(l), l)]),
    ) as SlotEditorProps["defaults"],
    initial: row
      ? {
          active: row.active,
          href: row.href ?? "",
          imageUrl: row.image_url ?? "",
          content: row.content ?? {},
          startsAt: row.starts_at,
          endsAt: row.ends_at,
          updatedAt: row.updated_at,
        }
      : null,
    canSave: !load.setup,
    backHref: KIND_TEXT[kind].base,
    siteUrl: SITE_URL,
  };

  return (
    <>
      <PageHeader
        eyebrow={KIND_TEXT[kind].title}
        title={def.label}
        description={`Hiện ở: ${def.where}`}
        action={
          <Link href={KIND_TEXT[kind].base} className="text-sm text-[var(--muted)] hover:text-[var(--brand)]">
            ← Tất cả {KIND_TEXT[kind].title.toLowerCase()}
          </Link>
        }
      />
      <SiteSetupNotice load={load} />
      <SlotEditor {...props} />
    </>
  );
}
