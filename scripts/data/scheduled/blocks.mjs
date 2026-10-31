/**
 * Viết tắt cho khối bài viết (đúng shape PostBlock trong src/lib/post-blocks.ts).
 * Ảnh ghi theo tên file trên Wikimedia Commons (khoá trong media.json) —
 * scripts/schedule-news.mjs đổi thành link trực tiếp + ghi nguồn.
 */

export const h2 = (text) => ({ type: "h2", text });
export const h3 = (text) => ({ type: "h3", text });
export const p = (text) => ({ type: "p", text });
export const quote = (text) => ({ type: "quote", text });
export const ul = (items) => ({ type: "list", ordered: false, items });
export const ol = (items) => ({ type: "list", ordered: true, items });
export const note = (text, title = "Lưu ý") => ({ type: "note", title, text });
/** Hàng đầu là tiêu đề cột. */
export const table = (rows) => ({ type: "table", rows, head: true });
export const img = (file, caption) => ({ type: "image", file, caption });
export const video = (youtubeId, caption) => ({ type: "video", youtubeId, caption });
export const products = (slugs, title = "Sản phẩm dùng trong bài") => ({ type: "products", title, slugs });
