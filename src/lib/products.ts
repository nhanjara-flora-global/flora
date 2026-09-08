// Hằng số + kiểu dùng chung cho quản lý sản phẩm.
// File thuần (không import server) để client component dùng được — action
// `src/app/actions/products.ts` là "use server" nên chỉ export được async function.

export const STOCK_STATUSES = [
  "instock",
  "outofstock",
  "onbackorder",
] as const;
export type StockStatus = (typeof STOCK_STATUSES)[number];

export const STOCK_STATUS_LABEL: Record<StockStatus, string> = {
  instock: "Còn hàng",
  outofstock: "Hết hàng",
  onbackorder: "Đặt trước",
};

export const PRODUCT_STATUSES = ["draft", "published", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type ProductInput = {
  id?: string;
  /** Chỉ dùng để revalidate đúng trang chi tiết khi sửa (slug không đổi lúc sửa). */
  slug?: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number | null;
  compareAtPrice: number | null;
  currency: string;
  sku: string;
  stockStatus: StockStatus;
  imageUrl: string;
  status: "draft" | "published";
  categoryIds: string[];
};

export type ProductResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string };
