// Chỉ chạy ở trình duyệt: nén ảnh trước khi gửi lên (Vercel giới hạn thân request 4,5MB).

/**
 * Thu ảnh về cạnh dài tối đa `max` px. JPEG → JPEG ~82%; PNG / WebP → WebP để giữ nền trong suốt.
 * GIF (có thể là ảnh động) và ảnh đã nhỏ hơn bản nén thì giữ nguyên file gốc.
 */
export async function compressImage(file: File, max = 1600): Promise<File> {
  if (file.type === "image/gif") return file;
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    return file; // trình duyệt không đọc được (vd AVIF trên máy cũ) → để server kiểm
  }
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  const g = canvas.getContext("2d")!;
  const alpha = file.type !== "image/jpeg";
  // JPEG không có nền trong suốt: đổ trắng trước để khỏi thành nền đen.
  if (!alpha) {
    g.fillStyle = "#fff";
    g.fillRect(0, 0, canvas.width, canvas.height);
  }
  g.imageSmoothingQuality = "high";
  g.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) =>
    canvas.toBlob(r, alpha ? "image/webp" : "image/jpeg", alpha ? 0.85 : 0.82),
  );
  if (!blob || (scale === 1 && blob.size >= file.size)) return file;
  const ext = { "image/webp": "webp", "image/png": "png" }[blob.type] ?? "jpg";
  const name = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${name}.${ext}`, { type: blob.type });
}
