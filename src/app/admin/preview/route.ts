import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin/auth";
import { getServiceClient } from "@/lib/admin/data";

/** Nút "Xem trước" của trình soạn: bật Draft Mode rồi mở bài trên web, kể cả bài nháp / lên lịch. */
export async function GET(request: Request) {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Thiếu mã bài", { status: 400 });

  const supabase = await getServiceClient();
  const { data } = supabase
    ? await supabase.from("posts").select("slug").eq("id", id).maybeSingle()
    : { data: null };
  if (!data) return new Response("Không tìm thấy bài", { status: 404 });

  (await draftMode()).enable();
  redirect(`/vi/knowledge/${data.slug}`);
}
