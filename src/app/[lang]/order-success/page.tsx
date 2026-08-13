import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ order?: string }>;
};

export default async function OrderSuccessPage({ params, searchParams }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const { order } = await searchParams;
  const vi = lang === "vi";

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
        {vi ? "Thành công" : "Success"}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--brand)]">
        {vi ? "Đặt hàng thành công" : "Order placed successfully"}
      </h1>
      {order && (
        <p className="mt-4 text-[var(--ink)]">
          {vi ? "Mã đơn" : "Order"}: <strong>{order}</strong>
        </p>
      )}
      <p className="mt-3 text-sm text-[var(--muted)]">
        {vi
          ? "Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất."
          : "We will contact you shortly to confirm your order."}
      </p>
      <Link
        href={withLocale(lang, "/products")}
        className="mt-8 inline-block bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white"
      >
        {vi ? "Tiếp tục mua hàng" : "Continue shopping"}
      </Link>
      <p className="mt-4 text-xs text-[var(--muted)]">{dict.meta.title}</p>
    </div>
  );
}
