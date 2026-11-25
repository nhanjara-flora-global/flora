import { docJson, kiemToken, lamMoiTrang, loi, ok, supa, trangThai, linkBai } from "@/lib/digis-api";
import { COT, lapDong, xuatBai, type DongBai } from "@/lib/digis-bai";

export const dynamic = "force-dynamic";

const MOI_TRANG = 100;

/**
 * Danh sách bài (mọi nguồn). ?tu=&den= lọc published_at (ISO), ?trang_thai=nhap|hen_gio|da_dang|luu_tru,
 * ?trang=1… (100 bài/trang, mới nhất trước). ?day_du=1 trả cả nội dung 2 bản.
 */
export async function GET(req: Request) {
  const chan = kiemToken(req);
  if (chan) return chan;
  const sb = supa();
  if (sb instanceof Response) return sb;

  const u = new URL(req.url);
  const trang = Math.max(1, Number(u.searchParams.get("trang")) || 1);
  const tt = u.searchParams.get("trang_thai");
  const now = new Date().toISOString();
  const dayDu = u.searchParams.get("day_du") === "1";

  let q = sb
    .from("posts")
    .select(dayDu ? COT : "id, slug, title, status, category, cover_url, seo_title, published_at, updated_at, en_title:translations->en->>title", { count: "exact" })
    .order("published_at", { ascending: false, nullsFirst: true })
    .range((trang - 1) * MOI_TRANG, trang * MOI_TRANG - 1);
  const tu = u.searchParams.get("tu");
  const den = u.searchParams.get("den");
  if (tu) q = q.gte("published_at", tu);
  if (den) q = q.lte("published_at", den);
  if (tt === "nhap") q = q.eq("status", "draft");
  else if (tt === "luu_tru") q = q.eq("status", "archived");
  else if (tt === "hen_gio") q = q.eq("status", "published").gt("published_at", now);
  else if (tt === "da_dang") q = q.eq("status", "published").lte("published_at", now);
  else if (tt) return loi(400, "trang_thai_sai", "trang_thai: nhap | hen_gio | da_dang | luu_tru", "trang_thai");

  const { data, error, count } = await q;
  if (error) return loi(500, "loi_csdl", error.message);
  const bai = dayDu
    ? (data as unknown as DongBai[]).map(xuatBai)
    : (data as unknown as Array<Record<string, string | null>>).map((r) => ({
        id: r.id,
        slug: r.slug,
        trang_thai: trangThai(String(r.status), r.published_at),
        published_at: r.published_at,
        updated_at: r.updated_at,
        chuyen_muc: r.category,
        anh_bia: r.cover_url,
        tieu_de: { vi: r.title, en: r.en_title ?? null },
        co_seo_title: !!r.seo_title,
        link: { vi: linkBai("vi", String(r.slug)), en: linkBai("en", String(r.slug)) },
      }));
  return ok({ tong: count ?? 0, trang, moi_trang: MOI_TRANG, bai });
}

/** Tạo bài NHÁP. Lên lịch / đăng bằng POST /bai/{id}/len-lich. */
export async function POST(req: Request) {
  const chan = kiemToken(req);
  if (chan) return chan;
  const sb = supa();
  if (sb instanceof Response) return sb;
  const body = await docJson(req);
  if (body instanceof Response) return body;

  const dong = await lapDong(sb, body, null);
  if (dong instanceof Response) return dong;
  dong.status = "draft";
  dong.published_at = null;
  if (!dong.translations) dong.translations = {};

  const { data, error } = await sb.from("posts").insert(dong).select(COT).single();
  if (error || !data) return loi(500, "loi_csdl", error?.message ?? "Không lưu được.");
  lamMoiTrang();
  return ok(xuatBai(data as unknown as DongBai), 201);
}
