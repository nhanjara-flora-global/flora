import { kiemToken, loi, ok, PHIEN_BAN, supa } from "@/lib/digis-api";

export const dynamic = "force-dynamic";

/** DIGIS gọi mỗi ngày để biết cổng còn chạy và đọc được Supabase. */
export async function GET(req: Request) {
  const chan = kiemToken(req);
  if (chan) return chan;
  const sb = supa();
  if (sb instanceof Response) return sb;
  const { count, error } = await sb
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());
  if (error) return loi(500, "loi_csdl", error.message);
  return ok({ ok: true, phien_ban: PHIEN_BAN, thoi_gian: new Date().toISOString(), so_bai_da_dang: count ?? 0 });
}
