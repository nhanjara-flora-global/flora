import type { Metadata } from "next";
import Link from "next/link";
import { CategoryManager } from "@/components/admin/category-manager";
import { Notice, PageHeader } from "@/components/admin/ui";
import { MIGRATION_FILE } from "@/lib/admin/post-categories";
import { loadCategoriesAdmin } from "@/lib/admin/post-categories-data";

export const metadata: Metadata = { title: "Chuyên mục bài viết" };

export default async function AdminPostCategoriesPage() {
  const load = await loadCategoriesAdmin();

  return (
    <>
      <PageHeader
        eyebrow="Nội dung"
        title="Chuyên mục bài viết"
        description="Các mục của trang Kiến thức: hiện trên menu, trang chủ, ô chọn chuyên mục khi viết bài và sitemap."
        action={
          <Link
            href="/admin/posts"
            className="rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            ← Bài viết
          </Link>
        }
      />

      {load.setup === "local" && (
        <Notice tone="warn" title="Chưa bật Supabase.">
          Web đang dùng 5 chuyên mục mặc định. Cần <code>DATA_SOURCE=supabase</code> để sửa.
        </Notice>
      )}
      {load.setup === "migration" && (
        <Notice tone="warn" title="Chưa tạo bảng chuyên mục trong database.">
          Mở Supabase → <b>SQL Editor</b>, dán toàn bộ file <code>{MIGRATION_FILE}</code> rồi bấm Run. Trước khi
          chạy, web vẫn dùng 5 chuyên mục mặc định nhưng chưa sửa được.
        </Notice>
      )}
      {(load.setup === "config" || (load.setup === null && load.error)) && (
        <Notice tone="warn" title="Không đọc được dữ liệu.">
          {load.error}
        </Notice>
      )}
      {load.orphanPosts > 0 && (
        <Notice tone="warn" title={`${load.orphanPosts} bài chưa thuộc chuyên mục nào.`}>
          Các bài này không hiện ở trang chuyên mục nào. Mở bài ở mục Bài viết, chọn chuyên mục rồi lưu.
        </Notice>
      )}

      <CategoryManager categories={load.categories} products={load.products} canSave={load.setup === null} />
    </>
  );
}
