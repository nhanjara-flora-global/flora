/**
 * Admin data access. Every read here uses the service-role client so the admin
 * sees drafts and orders that RLS hides from the public site. In `local` mode
 * there is no database, so order/contact reads come back empty and the UI shows
 * a "local mode" notice instead of pretending the shop has no orders.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { LOCAL_PRODUCTS, type Product } from "@/lib/data/local";
import { locales } from "@/lib/i18n/config";
import { allArticles } from "@/lib/news";

export const PAGE_SIZE = 20;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["unpaid", "paid", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã huỷ",
  refunded: "Đã hoàn tiền",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  failed: "Thất bại",
  refunded: "Đã hoàn tiền",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cod: "COD",
  bank_transfer: "Chuyển khoản",
  vnpay: "VNPay",
  momo: "MoMo",
  stripe: "Stripe",
};

/** Orders that never became revenue. */
const NON_REVENUE: OrderStatus[] = ["cancelled", "refunded"];

export type AdminOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: OrderStatus;
  payment_method: string;
  payment_status: PaymentStatus;
  subtotal: number;
  shipping_fee: number;
  total: number;
  note: string | null;
  shipping_address: Record<string, string> | null;
  created_at: string;
};

export type AdminOrderItem = {
  id: string;
  product_name: string;
  product_slug: string | null;
  unit_price: number | null;
  quantity: number;
  line_total: number | null;
};

export type AdminContact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  source: string | null;
  created_at: string;
};

export type Paged<T> = { rows: T[]; total: number; page: number; pageCount: number };

const ORDER_COLUMNS =
  "id, order_number, customer_name, customer_email, customer_phone, status, payment_method, payment_status, subtotal, shipping_fee, total, note, shipping_address, created_at";

export function isLocalMode(): boolean {
  return (process.env.DATA_SOURCE ?? "local") === "local";
}

export type ServiceClientResult =
  | { client: SupabaseClient; reason: "ok" }
  | { client: null; reason: "local" }
  | { client: null; reason: "config"; message: string };

/**
 * Thiếu SUPABASE_SERVICE_ROLE_KEY không được phép làm sập trang admin — trả về
 * lý do để trang hiện thông báo cấu hình thay vì ném lỗi 500.
 */
export async function getServiceClientResult(): Promise<ServiceClientResult> {
  if (isLocalMode()) return { client: null, reason: "local" };
  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    return { client: createServiceClient(), reason: "ok" };
  } catch (error) {
    console.error("[admin] Supabase service client unavailable:", error);
    return {
      client: null,
      reason: "config",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getServiceClient(): Promise<SupabaseClient | null> {
  return (await getServiceClientResult()).client;
}

/** PostgREST reads `,` and `%` as syntax inside `.or()`, so strip them out. */
function sanitizeQuery(value: string | undefined): string {
  return (value ?? "").replace(/[,%()*\\]/g, " ").trim().slice(0, 80);
}

export function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isFinite(page) && page > 1 ? Math.floor(page) : 1;
}

function emptyPage<T>(page = 1): Paged<T> {
  return { rows: [], total: 0, page, pageCount: 1 };
}

export async function listOrders(opts: {
  status?: string;
  q?: string;
  page?: number;
}): Promise<Paged<AdminOrder>> {
  const page = opts.page ?? 1;
  const supabase = await getServiceClient();
  if (!supabase) return emptyPage<AdminOrder>(page);

  let query = supabase
    .from("orders")
    .select(ORDER_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false });

  if (opts.status && (ORDER_STATUSES as readonly string[]).includes(opts.status)) {
    query = query.eq("status", opts.status);
  }

  const q = sanitizeQuery(opts.q);
  if (q) {
    query = query.or(
      `order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_email.ilike.%${q}%,customer_phone.ilike.%${q}%`,
    );
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) {
    console.error("[admin] listOrders:", error);
    return emptyPage<AdminOrder>(page);
  }

  const total = count ?? 0;
  return {
    rows: (data ?? []) as unknown as AdminOrder[],
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getOrder(
  id: string,
): Promise<{ order: AdminOrder; items: AdminOrderItem[] } | null> {
  const supabase = await getServiceClient();
  if (!supabase) return null;

  const { data: order, error } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error || !order) {
    if (error) console.error("[admin] getOrder:", error);
    return null;
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("id, product_name, product_slug, unit_price, quantity, line_total")
    .eq("order_id", id)
    .order("created_at");

  return {
    order: order as unknown as AdminOrder,
    items: (items ?? []) as unknown as AdminOrderItem[],
  };
}

export async function listContacts(opts: {
  q?: string;
  page?: number;
}): Promise<Paged<AdminContact>> {
  const page = opts.page ?? 1;
  const supabase = await getServiceClient();
  if (!supabase) return emptyPage<AdminContact>(page);

  let query = supabase
    .from("contact_submissions")
    .select("id, name, email, phone, message, source, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  const q = sanitizeQuery(opts.q);
  if (q) {
    query = query.or(
      `name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,message.ilike.%${q}%`,
    );
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) {
    console.error("[admin] listContacts:", error);
    return emptyPage<AdminContact>(page);
  }

  const total = count ?? 0;
  return {
    rows: (data ?? []) as unknown as AdminContact[],
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Unlike the storefront catalog, this includes drafts and archived products. */
export async function listAdminProducts(): Promise<Product[]> {
  const supabase = await getServiceClient();
  if (!supabase) return LOCAL_PRODUCTS;

  const { data, error } = await supabase.from("products").select("*").order("name");
  if (error) {
    console.error("[admin] listAdminProducts:", error);
    return [];
  }
  return (data ?? []) as Product[];
}

export type DashboardData = {
  products: { total: number; published: number; outOfStock: number };
  posts: { total: number; fullyTranslated: number };
  orders: {
    total: number;
    pending: number;
    revenue: number;
    revenue30d: number;
    count30d: number;
    byStatus: Array<{ status: OrderStatus; count: number }>;
    recent: AdminOrder[];
  };
  contacts: { total: number; recent: AdminContact[] };
};

export async function getDashboardData(): Promise<DashboardData> {
  const [products, posts] = await Promise.all([listAdminProducts(), allArticles()]);

  const productStats = {
    total: products.length,
    published: products.filter((p) => p.status === "published").length,
    outOfStock: products.filter((p) => p.stock_status !== "instock").length,
  };
  // "Dịch đủ" = có bản dịch cho mọi ngôn ngữ khác ngôn ngữ gốc của bài.
  const postStats = {
    total: posts.length,
    fullyTranslated: posts.filter((post) =>
      locales
        .filter((locale) => locale !== post.sourceLocale)
        .every((locale) => post.translations[locale]),
    ).length,
  };

  const supabase = await getServiceClient();
  if (!supabase) {
    return {
      products: productStats,
      posts: postStats,
      orders: {
        total: 0,
        pending: 0,
        revenue: 0,
        revenue30d: 0,
        count30d: 0,
        byStatus: [],
        recent: [],
      },
      contacts: { total: 0, recent: [] },
    };
  }

  // One pass over the order ledger feeds every KPI; the table is small enough
  // that a single capped read beats seven aggregate round-trips.
  const [ledger, recentOrders, recentContacts, contactCount] = await Promise.all([
    supabase
      .from("orders")
      .select("status, total, created_at")
      .order("created_at", { ascending: false })
      .limit(2000),
    supabase
      .from("orders")
      .select(ORDER_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("contact_submissions")
      .select("id, name, email, phone, message, source, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("contact_submissions")
      .select("id", { count: "exact", head: true }),
  ]);

  const rows = (ledger.data ?? []) as Array<{
    status: OrderStatus;
    total: number | string;
    created_at: string;
  }>;
  const since = Date.now() - 30 * 24 * 60 * 60 * 1000;

  let revenue = 0;
  let revenue30d = 0;
  let count30d = 0;
  const counts = new Map<OrderStatus, number>();

  for (const row of rows) {
    const amount = Number(row.total) || 0;
    const earns = !NON_REVENUE.includes(row.status);
    const isRecent = new Date(row.created_at).getTime() >= since;
    if (earns) revenue += amount;
    if (isRecent) {
      count30d += 1;
      if (earns) revenue30d += amount;
    }
    counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
  }

  return {
    products: productStats,
    posts: postStats,
    orders: {
      total: rows.length,
      pending: counts.get("pending") ?? 0,
      revenue,
      revenue30d,
      count30d,
      byStatus: ORDER_STATUSES.map((status) => ({
        status,
        count: counts.get(status) ?? 0,
      })).filter((entry) => entry.count > 0),
      recent: (recentOrders.data ?? []) as unknown as AdminOrder[],
    },
    contacts: {
      total: contactCount.count ?? 0,
      recent: (recentContacts.data ?? []) as unknown as AdminContact[],
    },
  };
}
