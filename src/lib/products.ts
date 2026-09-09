// Hằng số + kiểu dùng chung cho quản lý sản phẩm.
// File thuần (không import server) để client component dùng được — action
// `src/app/actions/products.ts` là "use server" nên chỉ export được async function.

export const PRODUCT_STATUSES = ["draft", "published", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type ProductInput = {
  id?: string;
  /** Chỉ dùng để revalidate đúng trang chi tiết khi sửa (slug không đổi lúc sửa). */
  slug?: string;
  name: string;
  shortDescription: string;
  description: string;
  sku: string;
  imageUrl: string;
  status: "draft" | "published";
  categoryIds: string[];
};

export type ProductResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string };
