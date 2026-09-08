import Link from "next/link";
import { listAdminCategories } from "@/lib/admin/data";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const categories = await listAdminCategories();

  return (
    <>
      <header className="mb-6">
        <Link
          href="/admin/products"
          className="text-sm text-[var(--muted)] hover:text-[var(--brand)]"
        >
          ← Sản phẩm
        </Link>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">
          Thêm sản phẩm
        </h1>
      </header>
      <ProductForm categories={categories} />
    </>
  );
}
