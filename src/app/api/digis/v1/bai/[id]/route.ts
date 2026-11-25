import { docJson, kiemToken, lamMoiTrang, loi, ok, supa } from "@/lib/digis-api";
import { COT, docBai, lapDong, xuatBai, type DongBai } from "@/lib/digis-bai";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const chan = kiemToken(req);
  if (chan) return chan;
  const sb = supa();
  if (sb instanceof Response) return sb;
  const bai = await docBai(sb, (await ctx.params).id);
  if (bai instanceof Response) return bai;
  return ok(xuatBai(bai));
}

/** Sửa một phần: chỉ gửi trường cần đổi (chuyen_muc, anh_bia, slug, vi, en). */
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const chan = kiemToken(req);
  if (chan) return chan;
  const sb = supa();
  if (sb instanceof Response) return sb;
  const cu = await docBai(sb, (await ctx.params).id);
  if (cu instanceof Response) return cu;
  const body = await docJson(req);
  if (body instanceof Response) return body;

  const dong = await lapDong(sb, body, cu);
  if (dong instanceof Response) return dong;
  const { data, error } = await sb.from("posts").update(dong).eq("id", cu.id).select(COT).single();
  if (error || !data) return loi(500, "loi_csdl", error?.message ?? "Không lưu được.");
  lamMoiTrang();
  return ok(xuatBai(data as unknown as DongBai));
}
