/**
 * Điền bản dịch cho các bài news CHƯA có trong news-cache.json,
 * dùng endpoint Google Translate miễn phí (client=gtx). Không cần API key.
 *
 * - Nguồn: tiếng Việt (vi). Đích: en, zh, ko, hi, si.
 * - Giữ nguyên cấu trúc thẻ HTML, chỉ dịch phần chữ.
 * - Idempotent: chạy lại chỉ dịch bài mới / ngôn ngữ còn thiếu.
 *
 * Chạy:  node scripts/translate-news.mjs
 *        ONLY=slug-abc node scripts/translate-news.mjs   (chỉ 1 bài)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WP_PATH = path.join(ROOT, "src/lib/data/wp-content.json");
const CACHE_PATH = path.join(ROOT, "src/lib/i18n/content/news-cache.json");

const SOURCE = "vi";
const TARGETS = ["en", "zh", "ko", "hi", "si"];
const GT_CODE = { en: "en", zh: "zh-CN", ko: "ko", hi: "hi", si: "si" };
const ONLY = process.env.ONLY || null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gtChunk(text, target) {
  const params = new URLSearchParams({
    client: "gtx",
    sl: GT_CODE[SOURCE] ?? SOURCE,
    tl: GT_CODE[target],
    dt: "t",
    q: text,
  });
  const url = `https://translate.googleapis.com/translate_a/single?${params}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return (data[0] || []).map((p) => (p && p[0]) || "").join("");
    } catch (err) {
      console.warn(`    ! gt lỗi (${attempt}): ${err.message}`);
      await sleep(1200 * (attempt + 1));
    }
  }
  return text; // bó tay -> giữ nguyên
}

async function gtText(text, target) {
  const t = text.trim();
  if (!t || !/[\p{L}\p{N}]/u.test(t)) return text;

  // Cắt thành đoạn < 3500 ký tự cho endpoint free
  const sentences = t.split(/(?<=[.!?。！？\n])\s*/);
  const chunks = [];
  let buf = "";
  for (const s of sentences) {
    if (!s) continue;
    if (buf.length + s.length + 1 > 3500 && buf) {
      chunks.push(buf);
      buf = s;
    } else {
      buf = buf ? `${buf} ${s}` : s;
    }
  }
  if (buf) chunks.push(buf);

  const out = [];
  for (const c of chunks) {
    out.push(await gtChunk(c, target));
    await sleep(200);
  }
  return out.join(" ");
}

async function gtHtml(html, target) {
  // Tách theo thẻ; chỉ dịch text node
  const parts = html.split(/(<[^>]+>)/);
  const result = [];
  for (const part of parts) {
    if (!part) continue;
    if (/^<[^>]+>$/.test(part) || !part.trim()) {
      result.push(part);
    } else {
      result.push(await gtText(part, target));
    }
  }
  return result.join("");
}

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
        title: await gtText(post.title, loc),
        excerpt: await gtText(post.excerpt || post.title, loc),
        content: await gtHtml(post.content, loc),
        sourceLocale: SOURCE,
      };
      touched++;
    }
    // Ghi tăng dần để không mất công nếu bị ngắt giữa chừng
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n", "utf8");
  }

  console.log(`\nXong. ${touched} (bài × ngôn ngữ) được dịch.`);
}

main().catch((err) => {
  console.error("LỖI:", err);
  process.exit(1);
});
