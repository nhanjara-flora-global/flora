import { CartView } from "@/components/cart-view";
import { resolveLocale } from "@/lib/i18n/config";
import { getProducts } from "@/lib/catalog";
import { localizeProducts } from "@/lib/i18n/localized-catalog";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

export default async function CartPage({ params }: Props) {
  const { lang } = await params;
  const locale = resolveLocale(lang);

  // Tên sản phẩm theo ngôn ngữ hiện tại — ghi đè snapshot lưu trong giỏ (localStorage).
  const names = Object.fromEntries(
    localizeProducts(await getProducts(), locale).map((p) => [p.slug, p.name]),
  );

  return <CartView locale={locale} names={names} />;
}
