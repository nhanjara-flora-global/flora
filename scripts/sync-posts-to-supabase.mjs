/**
 * Đẩy bài viết seed (src/lib/data/wp-content.json) lên bảng `posts` của Supabase,
 * kèm chuyên mục và bản dịch trong news-cache.json — đúng shape mà src/lib/news.ts
 * đọc ra (category, source_locale, translations).
 *
 * Upsert theo `slug`, chạy lại nhiều lần vô hại. Bài đã sửa trong /admin sẽ bị
 * ghi đè bằng nội dung trong file JSON, nên chỉ chạy khi muốn lấy file làm chuẩn.
 *
 * Yêu cầu: đã chạy supabase/schema.sql và supabase/migrations/0001_news_posts.sql.
 *
 * Chạy:      npm run posts:sync
 * Thử khô:   DRY_RUN=1 npm run posts:sync
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WP_PATH = path.join(ROOT, "src/lib/data/wp-content.json");
const CACHE_PATH = path.join(ROOT, "src/lib/i18n/content/news-cache.json");
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

/** Cùng quy tắc với detectSourceLocale trong src/lib/news.ts. */
const detectSourceLocale = (text) =>
  /[ăâêôơưđĂÂÊÔƠƯĐ]/.test(text) ? "vi" : "en";

function seoDescription(excerpt) {
  const text = (excerpt ?? "").replace(/\s+/g, " ").trim();
  return text.length > 160 ? `${text.slice(0, 157)}…` : text || null;
}

/** slug -> chuyên mục đầu tiên chứa nó. */
function categoryIndex(categories) {
  const index = new Map();
  for (const [category, slugs] of Object.entries(categories ?? {})) {
    for (const slug of slugs) if (!index.has(slug)) index.set(slug, category);
  }
  return index;
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const { posts, categories } = JSON.parse(fs.readFileSync(WP_PATH, "utf8"));
  const cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  const categoryOf = categoryIndex(categories);
  const now = new Date().toISOString();

  const rows = Object.entries(posts).map(([slug, post]) => {
    const sourceLocale = detectSourceLocale(`${post.title}\n${post.content ?? ""}`);
    const translations = Object.fromEntries(
      Object.entries(cache[slug] ?? {})
        .filter(([locale]) => locale !== sourceLocale)
        .map(([locale, entry]) => [
          locale,
          { title: entry.title, excerpt: entry.excerpt, content: entry.content },
        ]),
    );
    return {
      slug,
      title: post.title,
      excerpt: post.excerpt || null,
      content: post.content || null,
      cover_url: post.cover || null,
      category: categoryOf.get(slug) ?? null,
      status: "published",
      source_locale: sourceLocale,
      translations,
      seo_title: post.title,
      seo_description: seoDescription(post.excerpt),
      published_at: post.date ? new Date(post.date).toISOString() : now,
      updated_at: now,
    };
  });

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
  const noCategory = rows.filter((row) => !row.category);
  const noTranslation = rows.filter((row) => Object.keys(row.translations).length === 0);

  console.log(
    `${rows.length} bài trong wp-content.json — ${added.length} bài mới, ${rows.length - added.length} bài cập nhật.`,
  );
  for (const row of added) console.log(`  + ${row.slug}`);
  if (noCategory.length) console.log(`  ! ${noCategory.length} bài chưa có chuyên mục`);
  if (noTranslation.length) console.log(`  ! ${noTranslation.length} bài chưa có bản dịch`);

  if (DRY_RUN) {
    console.log("DRY_RUN=1 — không ghi gì lên Supabase.");
    return;
  }

  const { error } = await supabase.from("posts").upsert(rows, { onConflict: "slug" });
  if (error) {
    if (error.code === "42703") {
      console.error(
        "Bảng posts thiếu cột. Chạy supabase/migrations/0001_news_posts.sql trong Supabase SQL Editor rồi thử lại.",
      );
    }
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
