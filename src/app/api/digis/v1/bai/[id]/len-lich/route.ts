import { docJson, kiemToken, lamMoiTrang, loi, ok, supa } from "@/lib/digis-api";
import { blockingChecks } from "@/lib/admin/posts";
import { COT, docBai, kiemTraBai, xuatBai, type DongBai } from "@/lib/digis-bai";

export const dynamic = "force-dynamic";

/**
 * Body { "published_at": "<ISO có múi giờ>" | "ngay" }. Giờ tương lai = lên lịch: web tự hiện
 * bài khi tới giờ (như "Lên lịch đăng" trong /admin). Cần đủ bản en và qua kiểm tra bắt buộc.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const chan = kiemToken(req);
  if (chan) return chan;
  const sb = supa();
  if (sb instanceof Response) return sb;
  const cu = await docBai(sb, (await ctx.params).id);
  if (cu instanceof Response) return cu;
  const body = await docJson(req);
  if (body instanceof Response) return body;

  const v = body.published_at;
  const luc = v === "ngay" ? new Date() : typeof v === "string" ? new Date(v) : null;
  if (!luc || Number.isNaN(luc.getTime())) {
    return loi(400, "ngay_sai", 'published_at phải là ISO 8601 hoặc "ngay".', "published_at");
  }
  if (!cu.translations?.en?.title || !cu.translations?.en?.content) {
    return loi(422, "thieu_ban_en", "Bài chưa có bản tiếng Anh.", "en");
  }
  const chanKt = blockingChecks(
    kiemTraBai({
      title: cu.title,
      excerpt: cu.excerpt ?? "",
      content: cu.content ?? "",
      cover_url: cu.cover_url,
      seo_description: cu.seo_description,
    }),
  );
  if (chanKt.length) return loi(422, "chua_dat_kiem_tra", chanKt.map((c) => c.label).join("; "));

  const { data, error } = await sb
    .from("posts")
    .update({ status: "published", published_at: luc.toISOString(), updated_at: new Date().toISOString() })
    .eq("id", cu.id)
    .select(COT)
    .single();
  if (error || !data) return loi(500, "loi_csdl", error?.message ?? "Không lưu được.");
  lamMoiTrang();
  return ok(xuatBai(data as unknown as DongBai));
}
