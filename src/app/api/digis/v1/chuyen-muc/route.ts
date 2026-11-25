import { kiemToken, ok } from "@/lib/digis-api";
import { getNewsCategories } from "@/lib/news-categories";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const chan = kiemToken(req);
  if (chan) return chan;
  const ds = await getNewsCategories();
  return ok({
    chuyen_muc: ds.map((c) => ({
      slug: c.slug,
      ten_vi: c.names.vi ?? "",
      ten_en: c.names.en ?? "",
      mo_ta_vi: c.descriptions?.vi ?? "",
      mo_ta_en: c.descriptions?.en ?? "",
    })),
  });
}
