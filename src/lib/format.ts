export function formatPrice(
  price: number | null,
  currency = "VND",
  onRequestLabel = "Liên hệ",
): string {
  if (price == null) return onRequestLabel;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
