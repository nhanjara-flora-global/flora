import { kiemToken, loi, ok, supa } from "@/lib/digis-api";

export const dynamic = "force-dynamic";

const BUCKET = "post-images";
/** Vercel giới hạn body hàm ~4,5MB — DIGIS nén ảnh (WebP, cạnh dài ≤ 1600px) trước khi gửi. */
const MAX_BYTES = 4 * 1024 * 1024;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

/** multipart/form-data: file (JPG/PNG/WebP/AVIF ≤ 4MB). Trả { url } công khai trong bucket post-images. */
export async function POST(req: Request) {
  const chan = kiemToken(req);
  if (chan) return chan;
  const sb = supa();
  if (sb instanceof Response) return sb;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return loi(400, "form_sai", "Cần multipart/form-data có trường file.");
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return loi(400, "thieu_truong", "Không nhận được file ảnh.", "file");
  if (!EXT[file.type]) return loi(422, "sai_dinh_dang", "Chỉ nhận JPG, PNG, WebP, AVIF.", "file");
  if (file.size > MAX_BYTES) return loi(413, "anh_qua_lon", "Ảnh vượt quá 4MB.", "file");

  const path = `${new Date().getFullYear()}/digis-${crypto.randomUUID()}.${EXT[file.type]}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) return loi(500, "loi_luu_anh", error.message);
  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return ok({ url: data.publicUrl, duong_dan: path }, 201);
}
