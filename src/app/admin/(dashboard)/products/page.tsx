import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Badge,
  Cell,
  EmptyState,
  FilterTabs,
  PRODUCT_STATUS_TONE,
  PageHeader,
  Panel,
  Row,
  STOCK_TONE,
  SearchForm,
  Table,
} from "@/components/admin/ui";
import { listAdminProducts } from "@/lib/admin/data";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Sản phẩm" };

const STATUS_LABEL: Record<string, string> = {
  published: "Đang bán",
  draft: "Nháp",
  archived: "Lưu trữ",
};

const STOCK_LABEL: Record<string, string> = {
  instock: "Còn hàng",
  outofstock: "Hết hàng",
  onbackorder: "Đặt trước",
};

/** Remote images are not in `next.config` yet, so only local paths get optimised. */
function Thumb({ src, name }: { src: string | null; name: string }) {
  if (src?.startsWith("/")) {
    return (
      <Image
        src={src}
        alt=""
        width={44}
        height={44}
        className="size-11 shrink-0 rounded-md object-cover"
      />
    );
  }
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[var(--bg-soft)] text-sm font-semibold text-[var(--brand)]">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const all = await listAdminProducts();

  const term = (q ?? "").trim().toLowerCase();
  const rows = all.filter((product) => {
    if (status && product.status !== status) return false;
    if (!term) return true;
    return (
      product.name.toLowerCase().includes(term) ||
      product.slug.toLowerCase().includes(term) ||
      (product.sku ?? "").toLowerCase().includes(term)
    );
  });

  const counts = {
    published: all.filter((p) => p.status === "published").length,
    draft: all.filter((p) => p.status === "draft").length,
    archived: all.filter((p) => p.status === "archived").length,
  };

  return (
    <>
      <PageHeader
        eyebrow="Danh mục"
        title="Sản phẩm"
        description="Toàn bộ sản phẩm, gồm cả bản nháp chưa hiện trên website."
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          basePath="/admin/products"
          active={status}
          params={{ q }}
          options={[
            { label: "Tất cả", count: all.length },
            { value: "published", label: STATUS_LABEL.published, count: counts.published },
            { value: "draft", label: STATUS_LABEL.draft, count: counts.draft },
            { value: "archived", label: STATUS_LABEL.archived, count: counts.archived },
          ]}
        />
        <SearchForm
          action="/admin/products"
          placeholder="Tên, slug hoặc SKU…"
          defaultValue={q}
          hidden={{ status }}
        />
      </div>

      <Panel bleed>
        {rows.length === 0 ? (
          <EmptyState
            title="Không tìm thấy sản phẩm"
            description="Thử đổi từ khoá hoặc bỏ bộ lọc trạng thái."
          />
        ) : (
          <>
            <Table head={["Sản phẩm", "SKU", "Giá", "Kho", "Trạng thái", ""]}>
              {rows.map((product) => (
                <Row key={product.id}>
                  <Cell>
                    <div className="flex items-center gap-3">
                      <Thumb src={product.image_url} name={product.name} />
                      <div className="min-w-0">
                        <span className="block truncate font-medium">{product.name}</span>
                        <span className="block truncate text-xs text-[var(--muted)]">
                          /{product.slug}
                        </span>
                      </div>
                    </div>
                  </Cell>
                  <Cell muted>{product.sku || "—"}</Cell>
                  <Cell>{formatPrice(product.price, product.currency)}</Cell>
                  <Cell>
                    <Badge
                      label={STOCK_LABEL[product.stock_status] ?? product.stock_status}
                      tone={STOCK_TONE[product.stock_status] ?? "neutral"}
                    />
                  </Cell>
                  <Cell>
                    <Badge
                      label={STATUS_LABEL[product.status] ?? product.status}
                      tone={PRODUCT_STATUS_TONE[product.status] ?? "neutral"}
                    />
                  </Cell>
                  <Cell align="right">
                    <Link
                      href={`/vi/products/${product.slug}`}
                      target="_blank"
                      className="text-sm text-[var(--muted)] transition hover:text-[var(--brand)]"
                    >
                      Xem ↗
                    </Link>
                  </Cell>
                </Row>
              ))}
            </Table>
            <p className="border-t border-[var(--line)] px-5 py-3 text-sm text-[var(--muted)]">
              {rows.length} sản phẩm
            </p>
          </>
        )}
      </Panel>
    </>
  );
}
