import type { ProductPick } from "@/app/admin/(dashboard)/posts/post-editor";
import { getProducts } from "@/lib/catalog";
import { PRODUCT_FALLBACK_IMAGE } from "@/lib/media";

/** Sản phẩm đang bán, cho khối "Sản phẩm" trong trình soạn bài. Lỗi đọc → danh sách rỗng. */
export async function productPicks(): Promise<ProductPick[]> {
  const list = await getProducts().catch(() => []);
  return list.map((p) => ({
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    image: p.image_url ?? PRODUCT_FALLBACK_IMAGE[p.slug]?.src ?? null,
  }));
}
