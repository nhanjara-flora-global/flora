"use server";

export type CreateOrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  note?: string;
  paymentMethod: string;
  address: {
    province: string;
    district: string;
    ward: string;
    line1: string;
  };
  items: Array<{
    productId: string;
    name: string;
    slug: string;
    price: number | null;
    quantity: number;
  }>;
};

export type CreateOrderResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string };

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  if (!input.customerName?.trim()) {
    return { ok: false, error: "Vui lòng nhập họ tên." };
  }
  if (!input.customerPhone?.trim()) {
    return { ok: false, error: "Vui lòng nhập điện thoại." };
  }
  if (!input.customerEmail?.trim()) {
    return { ok: false, error: "Vui lòng nhập email." };
  }
  if (!input.items?.length) {
    return { ok: false, error: "Giỏ hàng trống." };
  }
  if (input.items.some((i) => i.price == null)) {
    return { ok: false, error: "Có sản phẩm chỉ nhận báo giá — vui lòng liên hệ." };
  }

  const orderNumber = `FG${Date.now().toString().slice(-8)}`;
  const subtotal = input.items.reduce(
    (n, i) => n + (i.price ?? 0) * i.quantity,
    0,
  );

  // Local mode: accept order without Supabase (dev)
  if ((process.env.DATA_SOURCE ?? "local") === "local") {
    console.info("[order:local]", { orderNumber, subtotal, input });
    return { ok: true, orderNumber };
  }

  const { createServiceClient } = await import("@/lib/supabase/service");
  const supabase = createServiceClient();

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      status: "pending",
      payment_method: input.paymentMethod,
      payment_status: "unpaid",
      currency: "VND",
      subtotal,
      shipping_fee: 0,
      total: subtotal,
      customer_name: input.customerName.trim(),
      customer_email: input.customerEmail.trim(),
      customer_phone: input.customerPhone.trim(),
      shipping_address: input.address,
      note: input.note ?? null,
    })
    .select("id")
    .single();

  if (error || !order) {
    console.error(error);
    return { ok: false, error: "Không tạo được đơn hàng. Thử lại sau." };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.items.map((i) => ({
      order_id: order.id,
      product_id: i.productId,
      product_name: i.name,
      product_slug: i.slug,
      unit_price: i.price,
      quantity: i.quantity,
      line_total: (i.price ?? 0) * i.quantity,
    })),
  );

  if (itemsError) {
    console.error(itemsError);
    return { ok: false, error: "Đơn tạo nhưng lỗi dòng hàng. Liên hệ hỗ trợ." };
  }

  return { ok: true, orderNumber };
}
