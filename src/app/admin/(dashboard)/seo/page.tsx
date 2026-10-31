import type { Metadata } from "next";
import Link from "next/link";
import { SiteSetupNotice } from "@/components/admin/site-admin";
import {
  Badge,
  Cell,
  EmptyState,
  FilterTabs,
  Notice,
  PageHeader,
  Panel,
  Row,
  SearchForm,
  StatCard,
  Table,
} from "@/components/admin/ui";
import { ADMIN_LOCALES } from "@/lib/admin/site";
import { loadSeoAdmin, seoIssues, seoPageRows } from "@/lib/admin/site-data";
import { locales, localeLabels, withLocale } from "@/lib/i18n/config";
import type { SeoOverride } from "@/lib/seo-overrides";

export const metadata: Metadata = { title: "SEO" };

type Props = { searchParams: Promise<{ status?: string; q?: string }> };

const editHref = (path: string) => `/admin/seo/edit?path=${encodeURIComponent(path)}`;

function OverrideCell({ path, own }: { path: string; own?: SeoOverride }) {
  const tags = own
    ? [own.title && "Tiêu đề", own.description && "Mô tả", own.image_url && "Ảnh"].filter(Boolean)
    : [];
  return (
    <div className="flex flex-col items-start gap-1">
      {own?.noindex ? (
        <Badge label="Ẩn khỏi Google" tone="red" />
      ) : tags.length ? (
        <Badge label={`Đặt tay: ${tags.join(" · ")}`} tone="green" />
      ) : (
        <span className="text-xs text-[var(--muted)]">Tự tạo</span>
      )}
      <Link href={editHref(path)} className="text-xs font-medium text-[var(--brand)] hover:underline">
        Sửa SEO
      </Link>
    </div>
  );
}

/**
 * SEO toàn web (theo mẫu /admin/seo của Cây Cảnh Miền Tây): mọi trang công khai + SEO đặt tay
 * từng ngôn ngữ, và cảnh báo đọc thẳng từ dữ liệu (thiếu ảnh, mô tả, tiêu đề trùng…).
 */
export default async function AdminSeoPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tab = sp.status === "canh-bao" ? "canh-bao" : undefined;
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 80);

  const load = await loadSeoAdmin();
  const [pages, issues] = await Promise.all([seoPageRows(load.rows), seoIssues(load.rows)]);
  const overrides = [...load.rows.values()];
  const noindex = overrides.filter((o) => o.noindex).length;
  const inSitemap = pages.filter((p) => p.inSitemap).length * locales.length - noindex;
  const errors = issues.filter((i) => i.level === "error").length;

  const rows = q
    ? pages.filter((p) => `${p.path} ${p.kind}`.toLowerCase().includes(q))
    : pages;

  return (
    <>
      <PageHeader
        eyebrow="Hệ thống"
        title="SEO"
        description="Tiêu đề, mô tả, ảnh chia sẻ và ẩn / hiện trên Google cho từng trang, từng ngôn ngữ."
        action={
          <a
            href="/sitemap.xml"
            target="_blank"
            className="rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            Sitemap ↗
          </a>
        }
      />
      <SiteSetupNotice load={load} />
      <Notice title="Cách dùng">
        Mặc định web <b>tự tạo</b> tiêu đề, mô tả và ảnh chia sẻ cho mọi trang. Bấm <b>Sửa SEO</b> để đặt
        tay cho một trang — ô nào để trống thì vẫn dùng bản tự tạo. <b>Ẩn khỏi Google</b> thì trang rời
        sitemap và báo Google không đưa vào kết quả tìm kiếm. Bài viết còn có ô SEO riêng trong trình soạn;
        SEO đặt tay ở đây được ưu tiên hơn.
      </Notice>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Trang trong sitemap" value={inSitemap} hint={`${pages.length} đường dẫn × ${locales.length} ngôn ngữ`} />
        <StatCard label="SEO đặt tay" value={overrides.length} hint="Trang có tiêu đề / mô tả / ảnh riêng" />
        <StatCard label="Ẩn khỏi Google" value={noindex} />
        <StatCard
          label="Cảnh báo"
          value={issues.length}
          hint={errors ? `${errors} lỗi cần sửa` : "Không có lỗi nặng"}
          href="/admin/seo?status=canh-bao"
        />
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          basePath="/admin/seo"
          active={tab}
          options={[
            { label: "Trang", count: pages.length },
            { value: "canh-bao", label: "Cảnh báo", count: issues.length },
          ]}
        />
        {!tab && <SearchForm action="/admin/seo" placeholder="Tìm đường dẫn, loại trang" defaultValue={sp.q} />}
      </div>

      {!tab ? (
        <Panel bleed>
          {rows.length ? (
            <Table head={["Trang", "Loại", ...ADMIN_LOCALES.map((l) => localeLabels[l])]}>
              {rows.map((p) => (
                <Row key={p.path}>
                  <Cell>
                    <a
                      href={withLocale("vi", p.path)}
                      target="_blank"
                      className="break-all font-medium hover:text-[var(--brand)]"
                    >
                      {p.path}
                    </a>
                    {!p.inSitemap && (
                      <span className="block text-xs text-amber-700">Không còn trong sitemap</span>
                    )}
                  </Cell>
                  <Cell muted>{p.kind}</Cell>
                  {ADMIN_LOCALES.map((l) => (
                    <Cell key={l}>
                      <OverrideCell path={withLocale(l, p.path)} own={p.overrides[l]} />
                    </Cell>
                  ))}
                </Row>
              ))}
            </Table>
          ) : (
            <EmptyState title="Không có trang nào khớp" description="Thử từ khoá khác." />
          )}
        </Panel>
      ) : (
        <Panel bleed>
          {issues.length ? (
            <Table head={["Trang", "Loại", "Cảnh báo", ""]}>
              {issues.map((i, n) => (
                <Row key={`${i.path}-${n}`}>
                  <Cell>
                    <span className="break-all font-medium">{i.path}</span>
                  </Cell>
                  <Cell muted>{i.kind}</Cell>
                  <Cell>
                    <span className="mr-2">
                      <Badge label={i.level === "error" ? "Lỗi" : "Nên sửa"} tone={i.level === "error" ? "red" : "amber"} />
                    </span>
                    {i.text}
                  </Cell>
                  <Cell align="right">
                    {i.edit && (
                      <Link href={i.edit} className="text-sm font-medium text-[var(--brand)] hover:underline">
                        Sửa
                      </Link>
                    )}
                  </Cell>
                </Row>
              ))}
            </Table>
          ) : (
            <EmptyState title="Không có cảnh báo nào" />
          )}
        </Panel>
      )}
    </>
  );
}
