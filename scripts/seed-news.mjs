/**
 * Trộn các bài viết trong scripts/data/seed-articles.mjs vào
 * src/lib/data/wp-content.json (posts + categories).
 *
 * - Tự tạo slug (bỏ dấu tiếng Việt), bỏ qua bài đã tồn tại.
 * - Rải ngày đăng lùi về quá khứ (cách nhau 2 ngày) và xen kẽ các category
 *   để feed /news trông tự nhiên. Tất cả ngày đều <= hôm nay -> đăng liền.
 * - cover để null; bổ sung ảnh sau bằng cách sửa "cover" trong wp-content.json.
 *
 * Chạy:  node scripts/seed-news.mjs        (ghi file)
 *        DRY_RUN=1 node scripts/seed-news.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEED_ARTICLES } from "./data/seed-articles.mjs";
import { slugify } from "../src/lib/slug.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WP_PATH = path.join(ROOT, "src/lib/data/wp-content.json");
const DRY_RUN = process.env.DRY_RUN === "1";

const VALID_CATEGORIES = [
  "canh-tac-huu-co",
  "chung-nhan-tieu-chuan",
  "xuat-khau-logistics",
  "thi-truong-xu-huong",
  "goc-nhin-flora",
];

const RESERVED_SLUGS = new Set([
  "", "news", "products", "product", "services", "service", "about-us", "about",
  "contact", "cart", "checkout", "admin", "order-success", "api", "images",
  "en", "vi", "zh", "ko", "hi", "si", "blog", "dich-vu", "gioi-thieu", "category",
]);

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T08:30:00+07:00`;
}

/** Xen kẽ các bài theo category để không dồn 6 bài cùng nhóm liền nhau. */
function interleave(articles) {
  const byCat = new Map();
  for (const a of articles) {
    if (!byCat.has(a.category)) byCat.set(a.category, []);
    byCat.get(a.category).push(a);
  }
  const queues = [...byCat.values()];
  const out = [];
  let added = true;
  while (added) {
    added = false;
    for (const q of queues) {
      if (q.length) {
        out.push(q.shift());
        added = true;
      }
    }
  }
  return out;
}

function main() {
  const wp = JSON.parse(fs.readFileSync(WP_PATH, "utf8"));

  const ordered = interleave(SEED_ARTICLES);
  const n = ordered.length;

  // Bài mới nhất = hôm nay; mỗi bài cũ hơn lùi đúng SPACING_DAYS ngày.
  const SPACING_DAYS = 2;
  const today = new Date();
  today.setHours(8, 30, 0, 0);

  let addedCount = 0;
  const usedSlugs = new Set(Object.keys(wp.posts));

  ordered.forEach((article, idx) => {
    if (!VALID_CATEGORIES.includes(article.category)) {
      throw new Error(`Category không hợp lệ: ${article.category} (${article.title})`);
    }

    let slug = slugify(article.title);
    if (!slug || RESERVED_SLUGS.has(slug)) {
      throw new Error(`Slug không dùng được từ tiêu đề: ${article.title}`);
    }
    if (usedSlugs.has(slug)) {
      console.log(`  bỏ qua (đã có): ${slug}`);
      return;
    }
    usedSlugs.add(slug);

    // idx 0 -> cũ nhất, idx n-1 -> mới nhất
    const stepsFromToday = n - 1 - idx;
    const d = new Date(today);
    d.setDate(d.getDate() - stepsFromToday * SPACING_DAYS);

    wp.posts[slug] = {
      title: article.title,
      date: isoDate(d),
      cover: article.cover ?? null, // ảnh bổ sung sau; null -> hiện placeholder
      content: article.content.trim(),
      excerpt: article.excerpt.trim(),
    };
    if (!Array.isArray(wp.categories[article.category])) {
      wp.categories[article.category] = [];
    }
    if (!wp.categories[article.category].includes(slug)) {
      wp.categories[article.category].push(slug);
    }
    addedCount++;
    console.log(`  + ${isoDate(d).slice(0, 10)}  [${article.category}]  ${slug}`);
  });

  console.log(`\n${addedCount}/${n} bài được thêm.`);

  if (DRY_RUN) {
    console.log("DRY_RUN — không ghi file.");
    return;
  }
  fs.writeFileSync(WP_PATH, JSON.stringify(wp, null, 2) + "\n", "utf8");
  console.log(`Đã ghi ${WP_PATH}`);
}

main();
