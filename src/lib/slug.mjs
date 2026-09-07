/** Bỏ dấu tiếng Việt → slug an toàn cho URL, cắt ở ranh giới từ. */
export function slugify(input) {
  const full = String(input || "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (full.length <= 80) return full;
  const cut = full.slice(0, 80);
  const lastDash = cut.lastIndexOf("-");
  return (lastDash > 40 ? cut.slice(0, lastDash) : cut).replace(/-+$/g, "");
}

/** Chuỗi nhiều dòng → HTML <p>. Nếu đã là HTML (bắt đầu bằng '<') thì giữ nguyên. */
export function textToHtml(text) {
  const t = String(text || "").trim();
  if (!t) return "";
  if (t.startsWith("<")) return t;
  return t
    .split(/\n{2,}/)
    .map((p) => `<p>${p.trim().replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}
