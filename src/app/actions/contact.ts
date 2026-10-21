"use server";

import { redirect } from "next/navigation";
import { defaultLocale, isLocale, withLocale } from "@/lib/i18n/config";

export async function submitContact(formData: FormData) {
  const field = (key: string) => String(formData.get(key) || "").trim();

  const localeRaw = field("locale");
  const locale = isLocale(localeRaw) ? localeRaw : defaultLocale;

  const name = field("name");
  const email = field("email");
  const phone = field("phone");
  const message = field("message");
  const product = field("product");

  const contactPath = withLocale(locale, "/contact");

  if (!name || !phone || !message) {
    redirect(`${contactPath}?error=1#contact-form`);
  }

  const body = [
    product && `Wholesale inquiry — product: ${product.slice(0, 200)}`,
    message,
  ]
    .filter(Boolean)
    .join("\n\n");

  if ((process.env.DATA_SOURCE ?? "local") === "local") {
    console.info("[contact:local]", { name, email, phone, body, locale });
    redirect(`${contactPath}?sent=1#contact-form`);
  }

  const { createServiceClient } = await import("@/lib/supabase/service");
  const supabase = createServiceClient();
  await supabase.from("contact_submissions").insert({
    name,
    // contact_submissions.email is NOT NULL; email is optional on the form.
    email,
    phone,
    message: body,
    source: "contact",
  });

  redirect(`${contactPath}?sent=1#contact-form`);
}
