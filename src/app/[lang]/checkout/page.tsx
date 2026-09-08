import { CheckoutView } from "@/components/checkout-view";
import { resolveLocale } from "@/lib/i18n/config";
import { getProducts } from "@/lib/catalog";
import { localizeProducts } from "@/lib/i18n/localized-catalog";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { lang } = await params;
  const locale = resolveLocale(lang);

  const names = Object.fromEntries(
    localizeProducts(await getProducts(), locale).map((p) => [p.slug, p.name]),
  );

  return <CheckoutView locale={locale} names={names} />;
}
