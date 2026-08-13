"use server";

import { redirect } from "next/navigation";
import { defaultLocale, isLocale, withLocale } from "@/lib/i18n/config";

const INQUIRY_TYPES = [
  "Strategic Sourcing & Procurement",
  "Honey No. 9 Export & Supply",
  "Organic Certification Stewardship (Auditing/Consultancy)",
  "Japanese Agricultural Inputs (Distribution/Trials)",
  "Investor & Stakeholder Relations",
];

const TIMELINES = ["Immediate", "Next Season", "Research Phase"];

export async function submitContact(formData: FormData) {
  const field = (key: string) => String(formData.get(key) || "").trim();

  const localeRaw = field("locale");
  const locale = isLocale(localeRaw) ? localeRaw : defaultLocale;

  const name = field("name");
  const email = field("email");
  const phone = field("phone");
  const company = field("company");
  const location = field("location");
  const inquiry = field("inquiry");
  const timeline = field("timeline");
  const message = field("message");

  const contactPath = withLocale(locale, "/contact");

  if (!name || !email || !company || !location) {
    redirect(`${contactPath}?error=1#contact-form`);
  }
  if (!INQUIRY_TYPES.includes(inquiry) || !TIMELINES.includes(timeline)) {
    redirect(`${contactPath}?error=1#contact-form`);
  }

  const body = [
    `Company: ${company}`,
    `Headquarters: ${location}`,
    `Nature of inquiry: ${inquiry}`,
    `Timeline: ${timeline}`,
    message && `\n${message}`,
  ]
    .filter(Boolean)
    .join("\n");

  if ((process.env.DATA_SOURCE ?? "local") === "local") {
    console.info("[contact:local]", { name, email, phone, body, locale });
    redirect(`${contactPath}?sent=1#contact-form`);
  }

  const { createServiceClient } = await import("@/lib/supabase/service");
  const supabase = createServiceClient();
  await supabase.from("contact_submissions").insert({
    name,
    email,
    phone: phone || null,
    message: body,
    source: "contact",
  });

  redirect(`${contactPath}?sent=1#contact-form`);
}
