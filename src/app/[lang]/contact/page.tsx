import type { Metadata } from "next";
import { submitContact } from "@/app/actions/contact";
import { PageHero } from "@/components/page-hero";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { resolveLocale, withLocale } from "@/lib/i18n/config";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
};

const EN_INQUIRIES = [
  "Strategic Sourcing & Procurement",
  "Honey No. 9 Export & Supply",
  "Organic Certification Stewardship (Auditing/Consultancy)",
  "Japanese Agricultural Inputs (Distribution/Trials)",
  "Investor & Stakeholder Relations",
];

const EN_TIMELINES = ["Immediate", "Next Season", "Research Phase"];

const MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.705716053586!2d106.70960757355158!3d10.757148459552042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f655d851335%3A0xbe41f3b0e056fb87!2zNjkyLzMxIMSQb8OgbiBWxINuIELGoSwgUGjGsOG7nW5nIDE2LCBRdeG6rW4gNCwgSOG7kyBDaMOtIE1pbmggMDcwMDAsIFZp4buHdCBOYW0!5e0!3m2!1svi!2sus!4v1757321932129!5m2!1svi!2sus";

const inputClass =
  "w-full border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return { title: dict.contact.title, description: dict.contact.intro1 };
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { lang: raw } = await params;
  const lang = resolveLocale(raw);
  const dict = getDictionary(lang);
  const c = dict.contact;
  const { sent, error } = await searchParams;

  return (
    <>
      <PageHero
        eyebrow={c.eyebrow}
        title={c.title}
        image="/images/contact-banner.jpg"
        homeHref={withLocale(lang, "/")}
        crumbs={[{ href: withLocale(lang, "/contact"), label: c.title }]}
      />

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-2 md:px-6">
        <div id="contact-form" className="scroll-mt-28">
          {sent === "1" && (
            <p className="mb-6 border border-[var(--brand)]/30 bg-[var(--brand)]/5 px-4 py-3 text-sm text-[var(--brand)]">
              {c.sent}
            </p>
          )}
          {error === "1" && (
            <p className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {c.error}
            </p>
          )}

          <form action={submitContact} className="space-y-4">
            <input type="hidden" name="locale" value={lang} />
            <input name="name" required placeholder={c.name} className={inputClass} />
            <input
              name="email"
              type="email"
              required
              placeholder={c.email}
              className={inputClass}
            />
            <input name="company" required placeholder={c.company} className={inputClass} />
            <input name="location" required placeholder={c.location} className={inputClass} />
            <input name="phone" placeholder={c.phone} className={inputClass} />

            <label className="block">
              <span className="mb-1.5 block text-sm text-[var(--muted)]">{c.inquiry}</span>
              <select
                name="inquiry"
                required
                defaultValue={EN_INQUIRIES[0]}
                className={inputClass}
              >
                {EN_INQUIRIES.map((value, i) => (
                  <option key={value} value={value}>
                    {c.inquiries[i] ?? value}
                  </option>
                ))}
              </select>
            </label>

            <textarea
              name="message"
              rows={6}
              maxLength={2000}
              placeholder={c.message}
              className={inputClass}
            />

            <label className="block">
              <span className="mb-1.5 block text-sm text-[var(--muted)]">{c.timeline}</span>
              <select
                name="timeline"
                required
                defaultValue={EN_TIMELINES[0]}
                className={inputClass}
              >
                {EN_TIMELINES.map((value, i) => (
                  <option key={value} value={value}>
                    {c.timelines[i] ?? value}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="bg-[var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[var(--brand-2)]"
            >
              {c.submit}
            </button>
          </form>
        </div>

        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            {c.companyName}
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--muted)]">{c.intro1}</p>
          <p className="mt-4 leading-relaxed text-[var(--muted)]">{c.intro2}</p>

          <dl className="mt-8 space-y-3 text-sm">
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-semibold uppercase tracking-wide">
                {c.emailLabel}
              </dt>
              <dd>
                <a href="mailto:info@flora-global.vn" className="text-[var(--accent)] underline">
                  info@flora-global.vn
                </a>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-semibold uppercase tracking-wide">
                {c.phoneLabel}
              </dt>
              <dd>
                <a href="tel:0932108990" className="text-[var(--accent)] underline">
                  0932.108.990
                </a>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-semibold uppercase tracking-wide">
                {c.addressLabel}
              </dt>
              <dd className="text-[var(--muted)]">{dict.footer.address}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 shrink-0 font-semibold uppercase tracking-wide">
                {c.hoursLabel}
              </dt>
              <dd className="text-[var(--muted)]">
                {c.hours}
                <br />
                <em>{c.hoursNote}</em>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <iframe
        title="Flora Global head office map"
        src={MAP_SRC}
        width="100%"
        height={450}
        loading="lazy"
        className="block w-full border-0"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </>
  );
}
