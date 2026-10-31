import type { Metadata } from "next";
import { submitContact } from "@/app/actions/contact";
import { ArticleShell } from "@/components/news/shells";
import { SectionHeader } from "@/components/news/ui";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";
import { pageSeo } from "@/lib/seo";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ sent?: string; error?: string; product?: string }>;
};

const MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.705716053586!2d106.70960757355158!3d10.757148459552042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f655d851335%3A0xbe41f3b0e056fb87!2zNjkyLzMxIMSQb8OgbiBWxINuIELGoSwgUGjGsOG7nW5nIDE2LCBRdeG6rW4gNCwgSOG7kyBDaMOtIE1pbmggMDcwMDAsIFZp4buHdCBOYW0!5e0!3m2!1svi!2sus!4v1757321932129!5m2!1svi!2sus";

const labelClass = "flex flex-col gap-1 text-xs text-ink-2";
const inputClass =
  "w-full border border-[#8a8a8a] bg-white px-3 text-sm text-ink outline-none transition focus:border-ink";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const dict = getDictionary(locale);
  return pageSeo({
    lang: locale,
    path: "/contact",
    title: dict.contact.title,
    description: dict.contact.intro2 || dict.contact.intro1,
    image: "/images/contact-tomato.jpg",
  });
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const c = dict.contact;
  const { sent, error, product } = await searchParams;
  const productName = product?.trim().slice(0, 200);

  const contactRows = [
    {
      label: c.emailLabel,
      value: (
        <a href="mailto:info@flora-global.vn" className="text-primary underline">
          info@flora-global.vn
        </a>
      ),
    },
    {
      label: c.phoneLabel,
      value: (
        <a href="tel:0932108990" className="text-primary underline">
          0932.108.990
        </a>
      ),
    },
    { label: c.addressLabel, value: dict.footer.address },
    {
      label: c.hoursLabel,
      value: (
        <>
          {c.hours}
          <br />
          <em>{c.hoursNote}</em>
        </>
      ),
    },
  ];

  return (
    <ArticleShell
      as="div"
      breadcrumbLabel={dict.news.breadcrumb}
      breadcrumb={[{ href: withLocale(lang, "/contact"), label: c.title }]}
      title={c.title}
      standfirst={c.intro2}
      sidebarLabel={dict.news.sidebar}
      sidebar={
        <section aria-labelledby="c-company">
          <SectionHeader id="c-company" title={c.companyName} />
          <p className="text-sm leading-relaxed text-ink-2">{c.intro1}</p>
          <dl className="mt-4 text-sm">
            {contactRows.map((row) => (
              <div key={row.label} className="border-b border-rule py-2.5">
                <dt className="text-xs font-bold uppercase tracking-[0.4px] text-muted">{row.label}</dt>
                <dd className="mt-0.5 text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      }
      after={
        <section className="mt-12">
          <iframe
            title="Flora Global head office map"
            src={MAP_SRC}
            width="100%"
            height={380}
            loading="lazy"
            className="block w-full border-0"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      }
    >
      <div id="contact-form" className="mt-8 scroll-mt-32">
        {sent === "1" && (
          <p role="status" className="mb-6 border-l-4 border-primary bg-[#eef4f0] px-4 py-3 text-sm text-primary">
            {c.sent}
          </p>
        )}
        {error === "1" && (
          <p role="alert" className="mb-6 border-l-4 border-[#b42318] bg-[#fdf0ef] px-4 py-3 text-sm text-[#b42318]">
            {c.error}
          </p>
        )}
        {productName && (
          <p className="mb-6 border-t-4 border-harvest bg-cream px-4 py-3 text-sm text-ink">
            {c.aboutProduct}: <strong>{productName}</strong>
          </p>
        )}

        <SectionHeader title={c.formTitle} />
        <p className="mb-5 text-sm text-ink-2">{c.formIntro}</p>

        <form action={submitContact} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="locale" value={lang} />
          {productName && <input type="hidden" name="product" value={productName} />}

          <label className={labelClass}>
            {c.name}
            <input name="name" required autoComplete="name" className={`${inputClass} h-11`} />
          </label>
          <label className={labelClass}>
            {c.phone}
            <input name="phone" type="tel" required autoComplete="tel" className={`${inputClass} h-11`} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            {c.email}
            <input name="email" type="email" autoComplete="email" className={`${inputClass} h-11`} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            {c.message}
            <textarea name="message" rows={6} required maxLength={2000} className={`${inputClass} py-2.5`} />
          </label>
          <div>
            <button type="submit" className="h-11 bg-ink px-5 text-sm font-bold text-white hover:bg-[#333]">
              {c.submit}
            </button>
          </div>
        </form>
      </div>
    </ArticleShell>
  );
}
