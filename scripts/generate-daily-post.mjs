/**
 * Sinh 1 bài viết "news" mới cho storefront Flora, chạy tự động mỗi ngày.
 *
 * Luồng:
 *   1. Đọc các bài đã có (để tránh trùng chủ đề) + log các bài từng auto-sinh.
 *   2. Gọi Claude viết 1 bài tiếng Việt (evergreen, kiến thức/phân tích — KHÔNG phải
 *      tin thời sự, không bịa số liệu/ngày tháng/nhân vật).
 *   3. Gọi Claude dịch bài đó sang en/zh/ko/hi/si.
 *   4. Ghi bài vào src/lib/data/wp-content.json (posts + categories)
 *      và bản dịch vào src/lib/i18n/content/news-cache.json.
 *   5. Ghi vào scripts/data/auto-post-log.json để lần sau không lặp lại.
 *
 * GitHub Action sẽ commit + push -> Vercel tự build lại -> bài lên sóng.
 *
 * Chạy tay:  ANTHROPIC_API_KEY=... node scripts/generate-daily-post.mjs
 * Đổi model: NEWS_MODEL=claude-sonnet-5 node scripts/generate-daily-post.mjs
 * Thử khô (không ghi file): DRY_RUN=1 node scripts/generate-daily-post.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WP_PATH = path.join(ROOT, "src/lib/data/wp-content.json");
const NEWS_CACHE_PATH = path.join(ROOT, "src/lib/i18n/content/news-cache.json");
const LOG_PATH = path.join(ROOT, "scripts/data/auto-post-log.json");

const MODEL = process.env.NEWS_MODEL || "claude-opus-5";
const DRY_RUN = process.env.DRY_RUN === "1";
const SOURCE_LOCALE = "vi";
const TARGET_LOCALES = ["en", "zh", "ko", "hi", "si"];
/** Đồng bộ với NEWS_CATEGORIES trong src/lib/legacy.ts (5 nhóm chủ đề). */
const CATEGORIES = [
  "canh-tac-huu-co",
  "chung-nhan-tieu-chuan",
  "xuat-khau-logistics",
  "thi-truong-xu-huong",
  "goc-nhin-flora",
];

/** Ảnh cover evergreen đã có sẵn trong /public — xoay vòng theo ngày. */
const COVERS = [
  "/images/wp/2025_09_banner1-1.jpg",
  "/images/wp/2025_09_nongnghiep22825_ded0b44486.png",
  "/images/wp/2025_09_thitruong.jpg",
  "/images/wp/2026_03_PRECISION-GROWING.jpg",
  "/images/wp/2026_03_ELITE.jpg",
  "/images/wp/2025_09_quanlyduan.jpg",
  "/images/wp/2025_09_tuvanthietke.jpg",
  "/images/wp/2018_07_sinnai-17135439179351860207736.jpg",
];

/** Slug không được trùng route thật (next.config.ts tạo redirect /:slug -> /news/:slug). */
const RESERVED_SLUGS = new Set([
  "", "news", "products", "product", "services", "service", "about-us", "about",
  "contact", "cart", "checkout", "admin", "order-success", "api", "images",
  "en", "vi", "zh", "ko", "hi", "si", "blog", "dich-vu", "gioi-thieu",
]);

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const writeJson = (p, data) =>
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");

/** Bỏ dấu tiếng Việt -> slug an toàn cho URL. */
function slugify(input) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

function todayISOInVN() {
  // GH Action chạy giờ UTC; quy về +07:00 để date bài đúng ngày VN.
  const now = new Date();
  const vn = new Date(now.getTime() + 7 * 3600 * 1000);
  const y = vn.getUTCFullYear();
  const m = String(vn.getUTCMonth() + 1).padStart(2, "0");
  const d = String(vn.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}T08:00:00+07:00`;
}

const SYSTEM = `Bạn là biên tập viên nội dung của Flora Global — công ty nông nghiệp hữu cơ Việt Nam.
Năm trụ cột của công ty: (1) chứng nhận hữu cơ & tuân thủ tiêu chuẩn quốc tế (USDA Organic, EU Organic, JAS);
(2) tư vấn nguồn hàng & thu mua nông sản từ Việt Nam; (3) chuỗi logistics xuất khẩu lạnh, kiểm soát nhiệt độ;
(4) vật tư nông nghiệp Nhật Bản; (5) canh tác chính xác (di sản "Mật ong số 9").

Bạn viết các bài KIẾN THỨC / PHÂN TÍCH mang tính lâu dài (evergreen) cho mục Tin tức của website — KHÔNG phải tin thời sự.

QUY TẮC BẮT BUỘC:
- Tiếng Việt, giọng chuyên nghiệp, khách quan, hữu ích. Không quảng cáo lộ liễu, không "chúng tôi cam kết".
- TUYỆT ĐỐI KHÔNG bịa: không nêu số liệu/tỷ lệ phần trăm cụ thể như sự thật, không bịa ngày/sự kiện,
  không bịa tên người kèm phát ngôn, không trích dẫn nghiên cứu cụ thể mà bạn không chắc.
  Nếu cần nói về xu hướng, hãy nói định tính ("nhiều thị trường", "xu hướng chung") thay vì con số.
- Không dùng cách nói thời sự ("mới đây", "tuần qua", "năm nay"). Nội dung phải đúng bất kể đọc lúc nào.
- Độ dài 600–900 từ.
- HTML thân bài: chỉ dùng <p>, <h2>, <h3>, <ul>, <ol>, <li>, <blockquote>, <strong>, <em>.
  KHÔNG <h1>, KHÔNG <img>, KHÔNG <script>, KHÔNG thuộc tính style/class, KHÔNG link ngoài.
- Chủ đề phải khác rõ rệt với danh sách bài đã có mà người dùng cung cấp.`;

const ARTICLE_TOOL = {
  name: "publish_article",
  description: "Nộp bài viết tiếng Việt đã hoàn chỉnh để đăng lên mục Tin tức.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["title", "excerpt", "content_html", "category"],
    properties: {
      title: { type: "string", description: "Tiêu đề, 8–16 từ, không dấu hai chấm dạng SEO nhồi nhét." },
      excerpt: { type: "string", description: "Tóm tắt 1–2 câu, 30–60 từ, không HTML." },
      content_html: {
        type: "string",
        description:
          "Thân bài HTML 600–900 từ. Bắt đầu bằng <p> mở bài, có ít nhất 2 thẻ <h2>. Không có <h1>, <img>, style, class.",
      },
      category: { type: "string", enum: CATEGORIES },
    },
  },
};

const localeEntrySchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "excerpt", "content"],
  properties: {
    title: { type: "string" },
    excerpt: { type: "string" },
    content: { type: "string", description: "HTML đã dịch, GIỮ NGUYÊN cấu trúc thẻ." },
  },
};

const TRANSLATE_TOOL = {
  name: "submit_translations",
  description: "Nộp bản dịch của bài viết sang các ngôn ngữ yêu cầu.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: TARGET_LOCALES,
    properties: Object.fromEntries(TARGET_LOCALES.map((l) => [l, localeEntrySchema])),
  },
};

function toolInput(message, toolName) {
  const block = message.content.find(
    (b) => b.type === "tool_use" && b.name === toolName,
  );
  if (!block) {
    throw new Error(`Model không gọi tool ${toolName}. stop_reason=${message.stop_reason}`);
  }
  return block.input;
}

async function generateArticle(client, existingTitles) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: SYSTEM,
    thinking: { type: "adaptive" },
    tools: [ARTICLE_TOOL],
    tool_choice: { type: "tool", name: "publish_article" },
    messages: [
      {
        role: "user",
        content:
          `Viết 1 bài mới cho hôm nay. Chọn một góc độ CHƯA có trong danh sách sau:\n\n` +
          existingTitles.map((t) => `- ${t}`).join("\n") +
          `\n\nGợi ý mảng chủ đề (tự chọn, không bắt buộc): quy trình đạt chứng nhận hữu cơ, ` +
          `kiểm soát chuỗi lạnh khi xuất khẩu, cải tạo đất, quản lý dịch hại sinh học, ` +
          `truy xuất nguồn gốc, tiêu chuẩn thị trường EU/Mỹ/Nhật, vật tư đầu vào hữu cơ, ` +
          `canh tác chính xác, kinh tế nông hộ hữu cơ.`,
      },
    ],
  });
  return toolInput(msg, "publish_article");
}

async function translateArticle(client, article) {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    tools: [TRANSLATE_TOOL],
    tool_choice: { type: "tool", name: "submit_translations" },
    messages: [
      {
        role: "user",
        content:
          `Dịch bài viết tiếng Việt sau sang: ${TARGET_LOCALES.join(", ")} ` +
          `(en=English, zh=中文 giản thể, ko=한국어, hi=हिन्दी, si=සිංහල).\n` +
          `Giữ nguyên toàn bộ cấu trúc thẻ HTML, chỉ dịch phần chữ. Giọng chuyên nghiệp, tự nhiên.\n\n` +
          `TIÊU ĐỀ: ${article.title}\n\nTÓM TẮT: ${article.excerpt}\n\nTHÂN BÀI:\n${article.content_html}`,
      },
    ],
  });
  return toolInput(msg, "submit_translations");
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Thiếu ANTHROPIC_API_KEY.");
  const client = new Anthropic({ apiKey });

  const wp = readJson(WP_PATH);
  const newsCache = readJson(NEWS_CACHE_PATH);
  const log = fs.existsSync(LOG_PATH) ? readJson(LOG_PATH) : [];

  const existingTitles = [
    ...Object.values(wp.posts).map((p) => p.title),
    ...log.map((e) => e.title),
  ];

  console.log(`[news] model=${MODEL} — đang viết bài...`);
  const article = await generateArticle(client, existingTitles);

  let slug = slugify(article.title);
  if (!slug) throw new Error(`Không tạo được slug từ tiêu đề: ${article.title}`);
  if (
    wp.posts[slug] ||
    wp.services?.[slug] ||
    wp.pages?.[slug] ||
    RESERVED_SLUGS.has(slug)
  ) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  const category = CATEGORIES.includes(article.category)
    ? article.category
    : "thi-truong-xu-huong";
  const date = todayISOInVN();
  const dayIndex = Math.floor(Date.parse(date) / 86400000);
  const cover = COVERS[dayIndex % COVERS.length];

  console.log(`[news] "${article.title}" -> /${slug} (${category})`);
  console.log(`[news] đang dịch ${TARGET_LOCALES.length} ngôn ngữ...`);
  const translations = await translateArticle(client, article);

  // --- ghi vào wp-content.json ---
  wp.posts[slug] = {
    title: article.title,
    date,
    cover,
    content: article.content_html,
    excerpt: article.excerpt,
  };
  if (!Array.isArray(wp.categories[category])) wp.categories[category] = [];
  if (!wp.categories[category].includes(slug)) wp.categories[category].push(slug);

  // --- ghi bản dịch vào news-cache.json ---
  newsCache[slug] = {};
  for (const loc of TARGET_LOCALES) {
    const t = translations[loc];
    newsCache[slug][loc] = {
      title: t.title,
      excerpt: t.excerpt,
      content: t.content,
      sourceLocale: SOURCE_LOCALE,
    };
  }

  log.push({ slug, title: article.title, category, date, model: MODEL });

  if (DRY_RUN) {
    console.log("[news] DRY_RUN — không ghi file. Bài:\n");
    console.log(JSON.stringify(wp.posts[slug], null, 2));
    return;
  }

  writeJson(WP_PATH, wp);
  writeJson(NEWS_CACHE_PATH, newsCache);
  writeJson(LOG_PATH, log);
  console.log("[news] xong. Đã cập nhật 3 file.");

  // Xuất cho GitHub Action dùng trong commit message
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `slug=${slug}\ntitle=${article.title.replace(/\n/g, " ")}\n`,
    );
  }
}

main().catch((err) => {
  console.error("[news] LỖI:", err?.message || err);
  process.exit(1);
});
