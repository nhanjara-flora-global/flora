/**
 * Điền bản dịch cho các bài news CHƯA có trong news-cache.json,
 * dùng endpoint Google Translate miễn phí. Không cần API key.
 *
 * - Nguồn: tiếng Việt (vi). Đích: en, zh, ko, hi, si.
 * - Idempotent: chạy lại chỉ dịch bài mới / ngôn ngữ còn thiếu.
 * - Ghi tăng dần nên an toàn nếu bị ngắt giữa chừng.
 *
 * Chạy:  node scripts/translate-news.mjs
 *        ONLY=slug-abc node scripts/translate-news.mjs   (chỉ 1 bài)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gtText, gtHtml } from "../src/lib/gt-translate.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WP_PATH = path.join(ROOT, "src/lib/data/wp-content.json");
const CACHE_PATH = path.join(ROOT, "src/lib/i18n/content/news-cache.json");

const SOURCE = "vi";
const TARGETS = ["en", "zh", "ko", "hi", "si"];
const ONLY = process.env.ONLY || null;

async function main() {
  const wp = JSON.parse(fs.readFileSync(WP_PATH, "utf8"));
  const cache = fs.existsSync(CACHE_PATH)
    ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"))
    : {};

  const slugs = ONLY ? [ONLY] : Object.keys(wp.posts);
  let touched = 0;

  for (const slug of slugs) {
    const post = wp.posts[slug];
    if (!post) {
      console.warn(`bỏ qua (không có post): ${slug}`);
      continue;
    }
    const existing = cache[slug] || {};
    const missing = TARGETS.filter((l) => !existing[l]);
    if (!missing.length) continue;

    console.log(`\n${slug}`);
    cache[slug] = existing;
    for (const loc of missing) {
      console.log(`  -> ${loc}`);
      cache[slug][loc] = {
        title: await gtText(post.title, SOURCE, loc),
        excerpt: await gtText(post.excerpt || post.title, SOURCE, loc),
        content: await gtHtml(post.content, SOURCE, loc),
        sourceLocale: SOURCE,
      };
      touched++;
    }
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n", "utf8");
  }

  console.log(`\nXong. ${touched} (bài × ngôn ngữ) được dịch.`);
}

main().catch((err) => {
  console.error("LỖI:", err);
  process.exit(1);
});
