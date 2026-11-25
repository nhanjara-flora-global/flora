import { kiemToken, ok } from "@/lib/digis-api";
import { getProducts } from "@/lib/catalog";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

/** Chỉ đọc sản phẩm đang bán: để bài viết dẫn link và nêu đúng tên, mô tả. */
export async function GET(req: Request) {
  const chan = kiemToken(req);
  if (chan) return chan;
  const ds = await getProducts().catch(() => []);
  return ok({
    san_pham: ds.map((p) => ({
      slug: p.slug,
      ten: p.name,
      mo_ta_ngan: p.short_description ?? "",
      anh: p.image_url,
      link: { vi: `${SITE_URL}/vi/products/${p.slug}`, en: `${SITE_URL}/en/products/${p.slug}` },
    })),
  });
}
