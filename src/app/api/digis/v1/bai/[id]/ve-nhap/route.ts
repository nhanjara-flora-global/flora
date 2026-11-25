import { kiemToken, lamMoiTrang, loi, ok, supa } from "@/lib/digis-api";
import { COT, docBai, xuatBai, type DongBai } from "@/lib/digis-bai";

export const dynamic = "force-dynamic";

/** Gỡ bài khỏi trang công khai, giữ nguyên dữ liệu (cổng không có lệnh xoá). */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const chan = kiemToken(req);
  if (chan) return chan;
  const sb = supa();
  if (sb instanceof Response) return sb;
  const cu = await docBai(sb, (await ctx.params).id);
  if (cu instanceof Response) return cu;
  const { data, error } = await sb
    .from("posts")
    .update({ status: "draft", updated_at: new Date().toISOString() })
    .eq("id", cu.id)
    .select(COT)
    .single();
  if (error || !data) return loi(500, "loi_csdl", error?.message ?? "Không lưu được.");
  lamMoiTrang();
  return ok(xuatBai(data as unknown as DongBai));
}
