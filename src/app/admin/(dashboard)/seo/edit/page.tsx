import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeoEditor } from "@/components/admin/seo-editor";
import { SiteSetupNotice } from "@/components/admin/site-admin";
import { PageHeader } from "@/components/admin/ui";
import { isHomePath, pageKind, SEO_PATH_RE, stripLocale } from "@/lib/admin/site";
import { fetchLiveSeo, loadSeoAdmin } from "@/lib/admin/site-data";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = { title: "Sửa SEO" };

type Props = { searchParams: Promise<{ path?: string }> };

export default async function AdminSeoEditPage({ searchParams }: Props) {
  const path = ((await searchParams).path ?? "").trim();
  if (!SEO_PATH_RE.test(path)) notFound();

  // Mở lại trang trên chính máy chủ đang chạy admin (localhost khi chạy thử, tên miền thật trên Vercel).
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const [load, live] = await Promise.all([
    loadSeoAdmin(),
    host ? fetchLiveSeo(`${proto}://${host}`, path) : Promise.resolve(null),
  ]);
  const own = load.rows.get(path);
  const base = stripLocale(path);
  const postSlug = base.startsWith("/knowledge/") && !base.startsWith("/knowledge/category/")
    ? base.slice("/knowledge/".length)
    : null;

  return (
    <>
      <PageHeader
        eyebrow={`SEO · ${pageKind(path)}`}
        title="Sửa SEO"
        description={path}
        action={
          <Link href="/admin/seo" className="text-sm text-[var(--muted)] hover:text-[var(--brand)]">
            ← Tất cả trang
          </Link>
        }
      />
      <SiteSetupNotice load={load} />
      <SeoEditor
        path={path}
        isHome={isHomePath(path)}
        siteUrl={SITE_URL}
        canSave={!load.setup}
        live={live}
        postEditHref={postSlug ? `/admin/posts?q=${encodeURIComponent(postSlug)}` : null}
        initial={
          own
            ? {
                title: own.title ?? "",
                description: own.description ?? "",
                imageUrl: own.image_url ?? "",
                noindex: own.noindex,
                updatedAt: own.updated_at,
              }
            : null
        }
      />
    </>
  );
}
