"use server";

export type NewsletterState = { status: "idle" | "ok" | "error" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Đăng ký bản tin. Chưa có dịch vụ gửi email, nên lưu vào contact_submissions
 * (source = "newsletter") để xem trong /admin/contacts; khi nối Mailchimp,
 * Brevo... thì gửi thêm từ đây.
 */
export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get("email") || "").trim().slice(0, 254);
  const locale = String(formData.get("locale") || "").slice(0, 8);
  if (!EMAIL.test(email)) return { status: "error" };

  if ((process.env.DATA_SOURCE ?? "local") === "local") {
    console.info("[newsletter:local]", { email, locale });
    return { status: "ok" };
  }

  const { createServiceClient } = await import("@/lib/supabase/service");
  const supabase = createServiceClient();
  const { error } = await supabase.from("contact_submissions").insert({
    // name là NOT NULL; form bản tin chỉ hỏi email.
    name: "Newsletter",
    email,
    message: `Đăng ký bản tin (${locale})`,
    source: "newsletter",
  });
  return { status: error ? "error" : "ok" };
}
