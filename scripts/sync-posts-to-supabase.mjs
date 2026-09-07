/**
 * Đồng bộ bài viết từ src/lib/data/wp-content.json lên bảng `posts` của Supabase.
 *
 * Upsert theo `slug`: bài đã có thì cập nhật nội dung, bài mới (ví dụ bài do
 * GitHub Action `daily-news` sinh ra) thì thêm mới. Chạy lại nhiều lần vô hại.
 *
 * Chạy:      node scripts/sync-posts-to-supabase.mjs
 * Thử khô:   DRY_RUN=1 node scripts/sync-posts-to-supabase.mjs
 *
 * Env (đọc sẵn từ .env.local nếu có):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WP_PATH = path.join(ROOT, "src/lib/data/wp-content.json");
const DRY_RUN = process.env.DRY_RUN === "1";

/** Nạp .env.local / .env để chạy tay không cần export biến môi trường. */
function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const value = match[2].replace(/^["']|["']$/g, "");
      if (!process.env[match[1]]) process.env[match[1]] = value;
    }
  }
}

/** Cắt mô tả SEO về độ dài Google thường hiển thị. */
function seoDescription(excerpt) {
  const text = (excerpt ?? "").replace(/\s+/g, " ").trim();
  return text.length > 160 ? `${text.slice(0, 157)}…` : text || null;
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const { posts } = JSON.parse(fs.readFileSync(WP_PATH, "utf8"));
  const now = new Date().toISOString();

  const rows = Object.entries(posts).map(([slug, post]) => ({
    slug,
    title: post.title,
    excerpt: post.excerpt || null,
    content: post.content || null,
    cover_url: post.cover || null,
    status: "published",
    seo_title: post.title,
    seo_description: seoDescription(post.excerpt),
    published_at: post.date ? new Date(post.date).toISOString() : now,
    updated_at: now,
  }));

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: existing, error: readError } = await supabase.from("posts").select("slug");
  if (readError) {
    console.error("Không đọc được bảng posts:", readError.message);
    process.exit(1);
  }
  const known = new Set((existing ?? []).map((row) => row.slug));
  const added = rows.filter((row) => !known.has(row.slug));

  console.log(`${rows.length} bài trong wp-content.json — ${added.length} bài mới, ${rows.length - added.length} bài cập nhật.`);
  for (const row of added) console.log(`  + ${row.slug}`);

  if (DRY_RUN) {
    console.log("DRY_RUN=1 — không ghi gì lên Supabase.");
    return;
  }

  const { error } = await supabase.from("posts").upsert(rows, { onConflict: "slug" });
  if (error) {
    console.error("Upsert thất bại:", error.message);
    process.exit(1);
  }

  const { count } = await supabase.from("posts").select("id", { count: "exact", head: true });
  console.log(`Xong. Bảng posts hiện có ${count} bài.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
