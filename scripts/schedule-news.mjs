/**
 * Lên lịch hàng loạt bài News (scripts/data/scheduled/<chuyên mục>.mjs) vào bảng `posts`
 * của Supabase: mỗi ngày một bài lúc 07:00 giờ VN, xen kẽ các chuyên mục.
 *
 * Bài lên lịch = status "published" + published_at ở tương lai — đúng cơ chế "Lên lịch
 * đăng" của /admin: web tự hiện bài khi tới giờ (dbArticles trong src/lib/news.ts, trễ tối
 * đa ~5 phút do revalidate), admin thấy ở tab "Lên lịch" và sửa / dời / gỡ như bài thường.
 *
 * Ảnh là link trực tiếp Wikimedia Commons (scripts/data/scheduled/media.json), video là
 * YouTube nhúng — không tải gì lên Storage. Chú thích ảnh tự kèm tác giả + giấy phép,
 * nguồn ảnh bìa ghi ở cuối bài. Trước khi ghi, script kiểm tra mọi link ảnh / video còn
 * sống và bài qua đủ "Kiểm tra trước khi đăng" (postChecks) như khi đăng từ admin.
 *
 * Chạy thử:  DRY_RUN=1 npm run news:schedule
 * Đăng:      npm run news:schedule            (hoặc START=YYYY-MM-DD để chọn ngày bài đầu)
 *
 * Chỉ thêm bài mới, không ghi đè: slug đã có trong DB thì bỏ qua (trùng bài mẫu trong
 * wp-content.json thì báo lỗi). Bài mới được xếp liên tiếp từ START; không có START thì từ
 * ngày sau bài đăng muộn nhất trong bảng posts — nên đợt bài sau, hay chạy lại sau khi lỗi
 * giữa chừng, tự nối tiếp lịch cũ. Kết quả ghi vào scripts/data/scheduled-posts-log.json
 * (id, slug, ngày) để tra cứu / gỡ lại khi cần.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { blocksToHtml, cleanBlocks } from "../src/lib/post-blocks.ts";
import { blockingChecks, plainText, postChecks } from "../src/lib/admin/posts.ts";
import { locales } from "../src/lib/i18n/config.ts";
import { translateArticle } from "../src/lib/gt-translate.mjs";
import { slugify } from "../src/lib/slug.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "scripts/data/scheduled");
const WP_PATH = path.join(ROOT, "src/lib/data/wp-content.json");
const LOG_PATH = path.join(ROOT, "scripts/data/scheduled-posts-log.json");
const DRY_RUN = process.env.DRY_RUN === "1";
const UA = "FloraGlobal/1.0 (+https://floraglobal.vn)";

/** Thứ tự xoay vòng chuyên mục khi xếp lịch — cũng là 5 chuyên mục mặc định của web. */
const CATEGORIES = [
  "canh-tac-huu-co",
  "chung-nhan-tieu-chuan",
  "xuat-khau-logistics",
  "thi-truong-xu-huong",
  "goc-nhin-flora",
];
const TARGET_LOCALES = locales.filter((l) => l !== "vi");

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

const vnDay = (date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(date);

/**
 * Ngày đăng bài mới đầu tiên (YYYY-MM-DD, giờ VN): START nếu có, không thì ngày sau bài
 * đăng muộn nhất trong bảng posts (hoặc hôm nay nếu bài đó đã qua) — đợt sau tự nối tiếp.
 */
function firstDay(latestPublishedAt) {
  if (process.env.START) return process.env.START;
  const today = vnDay(new Date());
  if (!latestPublishedAt) return today;
  const next = new Date(`${vnDay(new Date(latestPublishedAt))}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const nextDay = next.toISOString().slice(0, 10);
  return nextDay > today ? nextDay : today;
}

/** Bài mới thứ i đăng lúc 07:00 VN (= 00:00 UTC) ngày start + i. */
function scheduleFor(start, index) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) throw new Error(`START không hợp lệ: ${start}`);
  const d = new Date(`${start}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + index);
  return d.toISOString();
}

/** Xếp xen kẽ: lần lượt mỗi chuyên mục một bài cho tới khi hết. */
async function loadArticles() {
  const lists = [];
  for (const category of CATEGORIES) {
    const file = path.join(DATA_DIR, `${category}.mjs`);
    if (!fs.existsSync(file)) continue;
    const list = (await import(file)).default;
    for (const a of list) {
      if (a.category !== category) throw new Error(`Sai chuyên mục trong ${category}.mjs: ${a.title}`);
    }
    lists.push([...list]);
  }
  const out = [];
  while (lists.some((l) => l.length)) for (const l of lists) if (l.length) out.push(l.shift());
  return out;
}

/** Khối ảnh tham chiếu file Wikimedia → link trực tiếp + ghi nguồn; nguồn ảnh bìa ở cuối bài. */
function buildBlocks(article, media) {
  const problems = [];
  const blocks = article.blocks.map((b) => {
    if (b.type !== "image") return b;
    const m = media[b.file];
    if (!m) {
      problems.push(`thiếu ảnh trong media.json: ${b.file}`);
      return b;
    }
    const caption = `${b.caption.trim()} (Ảnh: ${m.credit})`;
    if (caption.length > 300) problems.push(`chú thích ảnh dài ${caption.length} ký tự (tối đa 300): ${b.file}`);
    return { type: "image", src: m.src, caption };
  });
  const cover = media[article.cover];
  if (!cover) problems.push(`thiếu ảnh bìa trong media.json: ${article.cover}`);
  else blocks.push({ type: "p", text: `*Ảnh bìa: ${cover.credit}.*` });
  return { blocks, coverUrl: cover?.src ?? null, problems };
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD", headers: { "User-Agent": UA } });
    const type = res.headers.get("content-type") ?? "";
    return res.ok && type.startsWith("image/") ? null : `HTTP ${res.status} ${type}`;
  } catch (error) {
    return error.message;
  }
}

async function checkYoutube(id) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
    );
    return res.ok ? null : `oEmbed ${res.status} (video bị xoá hoặc không cho nhúng)`;
  } catch (error) {
    return error.message;
  }
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const media = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "media.json"), "utf8"));
  const seedSlugs = new Set(Object.keys(JSON.parse(fs.readFileSync(WP_PATH, "utf8")).posts));
  const { data: existing, error: readError } = await supabase.from("posts").select("slug,published_at");
  if (readError) throw new Error(`Không đọc được bảng posts: ${readError.message}`);
  const dbSlugs = new Set(existing.map((r) => r.slug));
  const latest = existing.map((r) => r.published_at).filter(Boolean).sort().at(-1) ?? null;
  const start = firstDay(latest);
  const { data: productRows } = await supabase.from("products").select("slug").eq("status", "published");
  const productSlugs = new Set((productRows ?? []).map((r) => r.slug));

  const articles = await loadArticles();
  const errors = [];
  const seen = new Set();
  let newCount = 0;
  const posts = articles.map((a) => {
    const { blocks, coverUrl, problems } = buildBlocks(a, media);
    const clean = cleanBlocks(blocks);
    if (clean.length !== blocks.length) problems.push(`${blocks.length - clean.length} khối không hợp lệ bị bỏ`);
    for (const b of clean) {
      if (b.type === "products") {
        for (const s of b.slugs) if (!productSlugs.has(s)) problems.push(`sản phẩm chưa đăng / không có: ${s}`);
      }
    }
    const content = blocksToHtml(clean);
    const checks = postChecks({ title: a.title, excerpt: a.excerpt, content, coverUrl, seoDescription: a.seo });
    for (const c of blockingChecks(checks)) problems.push(c.label);
    const warnings = checks.filter((c) => !c.ok && !c.required).map((c) => c.label);

    const slug = slugify(a.title);
    if (seen.has(slug)) problems.push(`trùng slug trong danh sách: ${slug}`);
    seen.add(slug);
    if (seedSlugs.has(slug)) problems.push(`trùng slug bài mẫu trong wp-content.json: ${slug}`);
    if (problems.length) errors.push(`${a.title}\n    - ${problems.join("\n    - ")}`);

    const exists = dbSlugs.has(slug);
    return {
      article: a,
      slug,
      content,
      coverUrl,
      warnings,
      exists,
      publishedAt: exists ? null : scheduleFor(start, newCount++),
      words: plainText(content).split(/\s+/).length,
      images: clean.filter((b) => b.type === "image").map((b) => b.src),
      videos: clean.filter((b) => b.type === "video").map((b) => b.youtubeId),
    };
  });

  // Link ảnh / video phải còn sống trước khi lên lịch — kiểm cả ảnh bìa.
  const imageUrls = [...new Set(posts.flatMap((p) => [p.coverUrl, ...p.images]).filter(Boolean))];
  const videoIds = [...new Set(posts.flatMap((p) => p.videos))];
  for (const u of imageUrls) {
    const problem = await checkUrl(u);
    if (problem) errors.push(`Ảnh không tải được (${problem}): ${u}`);
  }
  for (const id of videoIds) {
    const problem = await checkYoutube(id);
    if (problem) errors.push(`Video ${id}: ${problem}`);
  }

  console.log(`${posts.length} bài, ${imageUrls.length} ảnh, ${videoIds.length} video. Lịch đăng (07:00 giờ VN):`);
  for (const p of posts) {
    const day = p.exists ? "đã có     " : p.publishedAt.slice(0, 10);
    const tag = p.exists ? "bỏ qua" : `${p.words} chữ, ${p.images.length + 1} ảnh, ${p.videos.length} video`;
    console.log(`  ${day}  ${p.article.category.padEnd(22)} ${p.article.title}  [${tag}]`);
    for (const w of p.warnings) console.log(`              · ${w}`);
  }
  if (errors.length) {
    console.error(`\n${errors.length} lỗi — chưa ghi gì:\n  ${errors.join("\n  ")}`);
    process.exit(1);
  }
  if (DRY_RUN) {
    console.log("\nDRY_RUN=1 — không ghi gì lên Supabase.");
    return;
  }

  const log = fs.existsSync(LOG_PATH) ? JSON.parse(fs.readFileSync(LOG_PATH, "utf8")) : [];
  for (const p of posts.filter((x) => !x.exists)) {
    const a = p.article;
    const translations = await translateArticle(
      { title: a.title, excerpt: a.excerpt, content: p.content },
      TARGET_LOCALES,
      "vi",
    );
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: a.title,
        slug: p.slug,
        excerpt: a.excerpt,
        content: p.content,
        category: a.category,
        cover_url: p.coverUrl,
        seo_title: null,
        seo_description: a.seo,
        status: "published",
        source_locale: "vi",
        translations,
        published_at: p.publishedAt,
        updated_at: now,
      })
      .select("id")
      .single();
    if (error) throw new Error(`Không ghi được "${a.title}": ${error.message}`);
    log.push({ id: data.id, slug: p.slug, category: a.category, publishedAt: p.publishedAt, createdAt: now });
    fs.writeFileSync(LOG_PATH, `${JSON.stringify(log, null, 2)}\n`);
    console.log(`  ✓ ${p.publishedAt.slice(0, 10)}  ${p.slug}`);
  }
  console.log(`Xong. Danh sách bài đã lên lịch: ${path.relative(ROOT, LOG_PATH)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
