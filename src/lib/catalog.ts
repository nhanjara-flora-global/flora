import { LOCAL_CATEGORIES, LOCAL_PRODUCTS, type Category, type Product } from "./data/local";

function useLocal() {
  return (process.env.DATA_SOURCE ?? "local") === "local";
}

export async function getProducts(opts?: {
  category?: string;
}): Promise<Product[]> {
  if (useLocal()) {
    let list = LOCAL_PRODUCTS.filter((p) => p.status === "published");
    if (opts?.category) {
      list = list.filter((p) => p.category_slugs?.includes(opts.category!));
    }
    return list;
  }

  const { createPublicClient } = await import("@/lib/supabase/public");
  const supabase = createPublicClient();
  let query = supabase
    .from("products")
    .select("*")
    .eq("status", "published")
    .order("name");

  const { data, error } = await query;
  if (error) throw error;
  let products = (data ?? []) as Product[];

  if (opts?.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", opts.category)
      .maybeSingle();
    if (!cat) return [];
    const { data: links } = await supabase
      .from("product_categories")
      .select("product_id")
      .eq("category_id", cat.id);
    const ids = new Set((links ?? []).map((l) => l.product_id));
    products = products.filter((p) => ids.has(p.id));
  }

  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (useLocal()) {
    return LOCAL_PRODUCTS.find((p) => p.slug === slug && p.status === "published") ?? null;
  }

  const { createPublicClient } = await import("@/lib/supabase/public");
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function getCategories(): Promise<Category[]> {
  if (useLocal()) return LOCAL_CATEGORIES;

  const { createPublicClient } = await import("@/lib/supabase/public");
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as Category[];
}
