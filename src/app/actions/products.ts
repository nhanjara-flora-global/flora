"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isAdminAuthed } from "@/app/actions/admin";
import { getServiceClientResult } from "@/lib/admin/data";
import { locales } from "@/lib/i18n/config";
import {
  PRODUCT_STATUSES,
  STOCK_STATUSES,
  type ProductInput,
  type ProductResult,
  type ProductStatus,
} from "@/lib/products";
import { slugify } from "@/lib/slug.mjs";

/** Trả lỗi cho UI thay vì ném ra ngoài — giống supabaseFor() trong actions/posts.ts. */
async function supabaseFor(): Promise<
  { ok: true; client: SupabaseClient } | { ok: false; error: string }
> {
  const service = await getServiceClientResult();
  if (service.reason === "local") {
    return {
      ok: false,
      error: "Cần DATA_SOURCE=supabase để quản lý sản phẩm. Xem README.",
    };
  }
  if (service.reason === "config") {
    return { ok: false, error: `Supabase chưa cấu hình: ${service.message}` };
  }
  return { ok: true, client: service.client };
}

export async function saveProduct(input: ProductInput): Promise<ProductResult> {
  if (!(await isAdminAuthed())) return { ok: false, error: "Chưa đăng nhập." };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Thiếu tên sản phẩm." };
  if (!(STOCK_STATUSES as readonly string[]).includes(input.stockStatus)) {
    return { ok: false, error: "Tình trạng kho không hợp lệ." };
  }

  const service = await supabaseFor();
  if (!service.ok) return { ok: false, error: service.error };
  const supabase = service.client;

  const slug = input.id ? undefined : slugify(name);
  if (slug !== undefined) {
    const { data: clash } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (clash) {
      return { ok: false, error: `Slug "${slug}" đã tồn tại — đổi tên sản phẩm.` };
    }
  }

  const row: Record<string, unknown> = {
    name,
    short_description: input.shortDescription.trim() || null,
    description: input.description.trim() || null,
    price: input.price,
    compare_at_price: input.compareAtPrice,
    currency: input.currency.trim() || "VND",
    sku: input.sku.trim() || null,
    stock_status: input.stockStatus,
    image_url: input.imageUrl.trim() || null,
    status: input.status,
    updated_at: new Date().toISOString(),
  };

  let savedId = input.id;
  if (input.id) {
    const { error } = await supabase
      .from("products")
      .update(row)
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
  } else {
    row.slug = slug;
    const { data, error } = await supabase
      .from("products")
      .insert(row)
      .select("id")
      .single();
    if (error || !data) {
      return { ok: false, error: error?.message ?? "Không lưu được." };
    }
    savedId = data.id;
  }

  // Đồng bộ chuyên mục: xoá hết link cũ rồi chèn lại.
  const wantIds = [...new Set(input.categoryIds)].filter(Boolean);
  await supabase.from("product_categories").delete().eq("product_id", savedId!);
  if (wantIds.length > 0) {
    const { error: linkErr } = await supabase
      .from("product_categories")
      .insert(
        wantIds.map((category_id) => ({ product_id: savedId, category_id })),
      );
    if (linkErr) {
      return {
        ok: false,
        error: `Đã lưu sản phẩm nhưng gán chuyên mục lỗi: ${linkErr.message}`,
      };
    }
  }

  revalidateProduct(slug ?? input.slug);
  return { ok: true, id: savedId!, slug: slug ?? input.slug ?? "" };
}

export async function setProductStatus(
  id: string,
  status: ProductStatus,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminAuthed())) return { ok: false, error: "Chưa đăng nhập." };
  if (!(PRODUCT_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: "Trạng thái không hợp lệ." };
  }
  const service = await supabaseFor();
  if (!service.ok) return { ok: false, error: service.error };

  const { data: row } = await service.client
    .from("products")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await service.client
    .from("products")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidateProduct(row?.slug as string | undefined);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteProduct(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdminAuthed())) return { ok: false, error: "Chưa đăng nhập." };
  const service = await supabaseFor();
  if (!service.ok) return { ok: false, error: service.error };

  const { data: row } = await service.client
    .from("products")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  // product_categories có ON DELETE CASCADE trong schema.
  const { error } = await service.client.from("products").delete().eq("id", id);
  revalidateProduct(row?.slug as string | undefined);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * Xoá cache trang bán hàng sau khi đổi sản phẩm. Revalidate cả path chính xác
 * `/vi/products/<slug>` (bắt được trang render on-demand) lẫn pattern `[slug]`.
 */
function revalidateProduct(slug?: string | null) {
  for (const lang of locales) {
    revalidatePath(`/${lang}/products`);
    revalidatePath(`/${lang}/products/[slug]`, "page");
    if (slug) revalidatePath(`/${lang}/products/${slug}`);
    revalidatePath(`/${lang}`);
  }
}
