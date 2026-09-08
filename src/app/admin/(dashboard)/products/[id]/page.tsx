import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminProduct, listAdminCategories } from "@/lib/admin/data";
import { ProductForm } from "../product-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    listAdminCategories(),
  ]);
  if (!product) notFound();

  return (
    <>
      <header className="mb-6">
        <Link
          href="/admin/products"
          className="text-sm text-[var(--muted)] hover:text-[var(--brand)]"
        >
          ← Sản phẩm
        </Link>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-3xl">
            Sửa sản phẩm
          </h1>
          <a
            href={`/vi/products/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[var(--muted)] hover:text-[var(--brand)]"
          >
            Xem trên web ↗
          </a>
        </div>
      </header>

      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          shortDescription: product.short_description ?? "",
          description: product.description ?? "",
          price: product.price,
          compareAtPrice: product.compare_at_price,
          currency: product.currency,
          sku: product.sku ?? "",
          stockStatus: product.stock_status,
          imageUrl: product.image_url ?? "",
          categoryIds: product.category_ids,
        }}
      />
    </>
  );
}
