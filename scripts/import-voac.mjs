/**
 * Import nội dung từ voac.vn (WordPress + Elementor) vào flora.
 *
 * voac.vn là site khác cùng chủ — WP + Elementor, song ngữ VI/EN. Script lấy
 * TIẾNG VIỆT làm gốc:
 *   - 3 trang sản phẩm  -> bảng Supabase `products` (status: draft, slug voac-*)
 *   - 9 trang dịch vụ    -> src/lib/data/wp-content.json > services (slug voac-*)
 *
 * Nội dung mỗi trang là HTML Elementor lồng sâu; `cleanElementor()` bóc lấy
 * heading / text / ảnh -> HTML sạch khớp `.prose-legacy`.
 *
 * Luồng:
 *   npm run import:voac                 # staging: ghi scripts/data/voac-import.json
 *                                       # + tải ảnh về public/images/voac/
 *   node scripts/import-voac.mjs --apply       # đọc staging, ghi wp-content.json + Supabase
 *   node scripts/import-voac.mjs --translate   # dịch dịch-vụ mới -> manual-bundle.json
 *
 * Cờ: --force (ghi đè slug đã tồn tại), --only=<id,id> (chỉ vài trang).
 * Sau --apply: thêm slug voac-* vào SERVICE_ORDER / SERVICE_NAV_LABEL /
 * SERVICE_SOURCE_LOCALE trong src/lib/legacy.ts + nhãn vào 6 file dictionary.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";
import { slugify } from "../src/lib/slug.mjs";
import { gtText, gtHtml } from "../src/lib/gt-translate.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WP_PATH = path.join(ROOT, "src/lib/data/wp-content.json");
const BUNDLE_PATH = path.join(ROOT, "src/lib/i18n/content/manual-bundle.json");
const STAGING_PATH = path.join(ROOT, "scripts/data/voac-import.json");
const IMG_DIR = path.join(ROOT, "public/images/voac");
const API = "https://voac.vn/wp-json/wp/v2/pages";

const ARGS = process.argv.slice(2);
const APPLY = ARGS.includes("--apply");
const TRANSLATE = ARGS.includes("--translate");
const FORCE = ARGS.includes("--force");
const ONLY = (ARGS.find((a) => a.startsWith("--only=")) || "")
  .replace("--only=", "")
  .split(",")
  .filter(Boolean)
  .map(Number);

const SLUG_PREFIX = "voac-";
const TARGET_LOCALES = ["en", "zh", "ko", "hi", "si"];
const MAX_IMG_BYTES = 3 * 1024 * 1024;

/** Trang voac VI cần lấy. type: product | service | skip (mặc định không import). */
const PAGES = [
  { id: 1224, type: "product", slug: "phan-ga", label: "Phân gà" },
  {
    id: 1272,
    type: "product",
    slug: "vi-sinh-vat-phan-bon-thuoc-tru-sau-huu-co",
    label: "Vi sinh vật, phân bón & thuốc trừ sâu hữu cơ",
  },
  { id: 1208, type: "product", slug: "bio-soilz-technology", label: "Bio-SoilZ" },

  { id: 1348, type: "service", slug: "dich-vu-cot-loi-cua-voac", label: "Dịch vụ cốt lõi" },
  { id: 1294, type: "service", slug: "dich-vu-ho-tro-cua-voac", label: "Dịch vụ hỗ trợ" },
  { id: 1270, type: "service", slug: "dich-vu-chung-nhan-huu-co", label: "Dịch vụ chứng nhận" },
  { id: 1288, type: "service", slug: "dich-vu-tim-nguon-san-pham", label: "Tìm nguồn sản phẩm" },
  { id: 1353, type: "service", slug: "chung-nhan-huu-co-voac", label: "Chứng nhận hữu cơ" },
  {
    id: 1296,
    type: "service",
    slug: "chung-nhan-voac-khong-hoa-chat-chem-free",
    label: "Chứng nhận không hóa chất",
  },
  {
    id: 1298,
    type: "service",
    slug: "mo-hinh-nong-trai-khong-hoa-chat-voac",
    label: "Mô hình nông trại",
  },
  { id: 1355, type: "service", slug: "doi-tac-nong-trai-huu-co-voac", label: "Đối tác nông trại" },
  {
    id: 1351,
    type: "service",
    slug: "nguyen-lieu-nong-nghiep-huu-co-voac",
    label: "Nguyên liệu nông nghiệp",
  },

  { id: 1256, type: "skip", slug: "gioi-thieu", note: "About — flora đã có /about-us" },
  { id: 1283, type: "skip", slug: "doi-ngu-cua-chung-toi", note: "Đội ngũ" },
  { id: 1303, type: "skip", slug: "voac-consortium", note: "Consortium / Ecosystem" },
  { id: 1357, type: "skip", slug: "co-cau-to-chuc-voac", note: "Cơ cấu tổ chức" },
  { id: 1244, type: "skip", slug: "giao-duc-dao-tao", note: "Giáo dục & Đào tạo" },
  { id: 1285, type: "skip", slug: "san-xuat", note: "Sản xuất" },
];

// ── env ────────────────────────────────────────────────────────────
function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const readJson = (p, fallback) =>
  fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : fallback;
const writeJson = (p, data) =>
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");

// ── HTML helpers ───────────────────────────────────────────────────
function decodeEntities(s) {
  return String(s || "")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'");
}
const esc = (s) =>
  decodeEntities(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => esc(s).replace(/"/g, "&quot;");

const KEEP_INLINE = new Set(["strong", "b", "em", "i", "u", "sub", "sup", "mark", "br", "a"]);
const KEEP_BLOCK = new Set([
  "p", "h2", "h3", "h4", "ul", "ol", "li", "blockquote",
  "table", "thead", "tbody", "tr", "td", "th",
]);
const NORMALIZE = { b: "strong", i: "em", h1: "h2", h4: "h3" };

/** Một node node-html-parser -> HTML sạch (đệ quy, chỉ giữ thẻ ngữ nghĩa). */
function toClean(node) {
  if (node.nodeType === 3) return esc(node.rawText);
  const raw = (node.rawTagName || "").toLowerCase();
  if (!raw) return node.childNodes.map(toClean).join("");
  const tag = NORMALIZE[raw] || raw;
  const inner = node.childNodes.map(toClean).join("").replace(/\s+/g, " ");

  if (raw === "br") return "<br />";
  if (raw === "img") {
    const src = node.getAttribute("src") || "";
    // chỉ giữ ảnh sẽ tải về (voac uploads); bỏ ảnh ngoài / logo bên thứ ba.
    if (!/^https?:\/\/voac\.vn\/wp-content\/uploads\//.test(src)) return "";
    return `<img src="${escAttr(src)}" alt="${escAttr(node.getAttribute("alt") || "")}" />`;
  }
  if (tag === "a") {
    const href = node.getAttribute("href") || "";
    if (!inner.trim()) return "";
    if (/^#/.test(href) || !href) return inner; // bỏ anchor nội bộ (mục lục)
    return `<a href="${escAttr(href)}" rel="noopener nofollow" target="_blank">${inner}</a>`;
  }
  if (KEEP_INLINE.has(tag)) return inner.trim() ? `<${tag}>${inner}</${tag}>` : inner;
  if (KEEP_BLOCK.has(tag)) return inner.trim() ? `<${tag}>${inner}</${tag}>` : "";
  return inner; // thẻ lạ (div/span Elementor) -> chỉ lấy nội dung
}

/** Bỏ heading đầu trùng tiêu đề trang + gộp heading liền nhau trùng text. */
function trimHeadings(blocks, pageTitle) {
  const norm = (s) => decodeEntities(s).replace(/\s+/g, " ").trim().toLowerCase();
  const title = norm(pageTitle);
  const res = [];
  for (const b of blocks) {
    const m = b.match(/^<(h[234])>(.*)<\/\1>$/s);
    if (m) {
      const t = norm(m[2].replace(/<[^>]+>/g, ""));
      const prev = res[res.length - 1] || "";
      const pm = prev.match(/^<h[234]>(.*)<\/h[234]>$/s);
      if (t === title || (pm && norm(pm[1].replace(/<[^>]+>/g, "")) === t)) continue;
    }
    res.push(b);
  }
  return res;
}

/** HTML Elementor -> { html, images, text } sạch. */
function cleanElementor(rawHtml, pageTitle = "") {
  const root = parse(rawHtml || "", { comment: false });
  root
    .querySelectorAll(
      "script,style,svg,noscript,form,header,footer,nav,.elementor-widget-button,.elementor-nav-menu,.elementor-widget-breadcrumbs",
    )
    .forEach((n) => n.remove());

  const out = [];
  const images = [];
  const widgets = root.querySelectorAll(".elementor-widget");
  const pool = widgets.length ? widgets : [root];

  for (const w of pool) {
    const wtype = (w.getAttribute && w.getAttribute("data-widget_type")) || "";

    if (wtype.startsWith("heading")) {
      const h = w.querySelector(".elementor-heading-title") || w.querySelector("h1,h2,h3,h4");
      const txt = decodeEntities((h?.text || "").trim());
      if (txt) {
        // Elementor hay nhét cả đoạn văn dài vào widget heading -> hạ xuống <p>.
        if (txt.length > 140) {
          out.push(`<p>${esc(txt)}</p>`);
        } else {
          const lvl = (h?.rawTagName || "h2").toLowerCase();
          const tag = ["h2", "h3"].includes(lvl) ? lvl : lvl === "h1" ? "h2" : "h3";
          out.push(`<${tag}>${esc(txt)}</${tag}>`);
        }
      }
      continue;
    }

    if (wtype.startsWith("text-editor") || wtype.startsWith("theme-post-content")) {
      const c = w.querySelector(".elementor-widget-container") || w;
      const cleaned = c.childNodes.map(toClean).join("").trim();
      if (cleaned) out.push(cleaned);
      continue;
    }

    if (wtype.startsWith("image")) {
      const img = w.querySelector("img");
      const src = img?.getAttribute("src") || "";
      if (/^https?:\/\/voac\.vn\/wp-content\/uploads\//.test(src)) {
        images.push(src);
        out.push(`<img src="${escAttr(src)}" alt="${escAttr(img.getAttribute("alt") || "")}" />`);
      }
      continue;
    }

    if (wtype.startsWith("icon-list") || wtype.startsWith("list")) {
      const items = w
        .querySelectorAll(".elementor-icon-list-text,li")
        .map((li) => decodeEntities(li.text.trim()))
        .filter(Boolean);
      if (items.length) out.push(`<ul>${items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`);
      continue;
    }

    // widget khác (không có type, hoặc lạ): thử bóc heading/p/img bên trong
    if (!wtype && pool.length === 1) {
      out.push(w.childNodes.map(toClean).join("").trim());
      w.querySelectorAll("img").forEach((im) => {
        const s = im.getAttribute("src");
        if (s) images.push(s);
      });
    }
  }

  const blocks = trimHeadings(
    out.filter((s) => s && s.trim()),
    pageTitle,
  );
  const html = blocks
    .join("\n")
    .replace(/(<p>\s*<\/p>|<p>&nbsp;<\/p>)/g, "")
    .trim();

  const text = decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
  const firstP = (html.match(/<p>(.*?)<\/p>/s)?.[1] || "").replace(/<[^>]+>/g, "").trim();
  const excerpt = decodeEntities(firstP).replace(/\s+/g, " ").slice(0, 200);
  return { html, images: [...new Set(images)], text, excerpt };
}

// ── voac API + ảnh ─────────────────────────────────────────────────
async function fetchPage(id) {
  const res = await fetch(`${API}/${id}?_fields=id,slug,title,content,excerpt,link`, {
    headers: { "User-Agent": "flora-import/1.0" },
  });
  if (!res.ok) throw new Error(`voac page ${id}: HTTP ${res.status}`);
  return res.json();
}

function localImageName(url) {
  const base = decodeURIComponent(new URL(url).pathname.split("/").pop() || "img");
  return base.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").toLowerCase();
}

async function downloadImage(url) {
  if (!/^https?:\/\/voac\.vn\/wp-content\/uploads\//.test(url)) return null;
  const name = localImageName(url);
  const dest = path.join(IMG_DIR, name);
  const rel = `/images/voac/${name}`;
  if (fs.existsSync(dest)) return rel;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_IMG_BYTES) {
      console.warn(`  ! bỏ ảnh > 3MB: ${name}`);
      return null;
    }
    fs.mkdirSync(IMG_DIR, { recursive: true });
    fs.writeFileSync(dest, buf);
    return rel;
  } catch (e) {
    console.warn(`  ! tải ảnh lỗi ${name}: ${e.message}`);
    return null;
  }
}

// ── staging ────────────────────────────────────────────────────────
async function buildStaging() {
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const pages = [];
  let list = PAGES;
  if (ONLY.length) list = PAGES.filter((p) => ONLY.includes(p.id));

  for (const cfg of list) {
    process.stdout.write(`voac #${cfg.id} ${cfg.slug} … `);
    let page;
    try {
      page = await fetchPage(cfg.id);
    } catch (e) {
      console.log(`LỖI ${e.message}`);
      continue;
    }
    const pageTitle = decodeEntities(page.title?.rendered || "").trim();
    const { html, images, text, excerpt } = cleanElementor(
      page.content?.rendered || "",
      pageTitle,
    );

    // tải ảnh, đổi src
    let finalHtml = html;
    const localImages = [];
    for (const src of images) {
      const rel = await downloadImage(src);
      if (rel) {
        finalHtml = finalHtml.split(src).join(rel);
        localImages.push(rel);
      }
    }

    const words = text ? text.split(/\s+/).length : 0;
    const warnings = [];
    if (words < 40) warnings.push("nội dung rất ngắn (<40 từ)");
    if (!finalHtml) warnings.push("không bóc được nội dung");

    pages.push({
      id: cfg.id,
      voacSlug: page.slug,
      voacLink: page.link,
      type: cfg.type,
      include: cfg.type !== "skip",
      slug: SLUG_PREFIX + (cfg.slug || slugify(pageTitle)),
      title: pageTitle,
      label: cfg.label || "",
      note: cfg.note || "",
      category: cfg.category || null,
      excerpt: excerpt || pageTitle,
      wordCount: words,
      images: localImages,
      cleanHtml: finalHtml,
      warnings,
    });
    console.log(`ok — ${words} từ, ${localImages.length} ảnh${warnings.length ? " ⚠ " + warnings.join("; ") : ""}`);
  }

  writeJson(STAGING_PATH, { generatedAt: new Date().toISOString(), pages });
  const prod = pages.filter((p) => p.include && p.type === "product").length;
  const svc = pages.filter((p) => p.include && p.type === "service").length;
  console.log(`\nĐã ghi ${STAGING_PATH}`);
  console.log(`  ${prod} sản phẩm, ${svc} dịch vụ sẽ import (include:true).`);
  console.log(`  Mở file, chỉnh include / type / slug / category rồi:`);
  console.log(`  node scripts/import-voac.mjs --apply`);
}

// ── apply ──────────────────────────────────────────────────────────
async function apply() {
  const staging = readJson(STAGING_PATH, null);
  if (!staging) {
    console.error("Chưa có staging. Chạy `npm run import:voac` trước.");
    process.exit(1);
  }
  const pages = staging.pages.filter((p) => p.include);

  // --- services -> wp-content.json ---
  const svc = pages.filter((p) => p.type === "service");
  if (svc.length) {
    const wp = readJson(WP_PATH, { posts: {}, services: {}, categories: {} });
    wp.services = wp.services || {};
    for (const p of svc) {
      if (wp.services[p.slug] && !FORCE) {
        console.log(`  = giữ ${p.slug} (đã có, dùng --force để ghi đè)`);
        continue;
      }
      wp.services[p.slug] = {
        title: p.title,
        date: "",
        cover: p.images[0] || null,
        content: p.cleanHtml,
        excerpt: p.excerpt || p.title,
      };
      console.log(`  + service ${p.slug}`);
    }
    writeJson(WP_PATH, wp);
  }

  // --- products -> Supabase ---
  const prods = pages.filter((p) => p.type === "product");
  if (prods.length) {
    loadEnv();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.warn(
        `\n  ! ${prods.length} sản phẩm CHƯA import — thiếu NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.`,
      );
      console.warn(`    Đặt key trong .env.local rồi chạy lại: node scripts/import-voac.mjs --apply`);
    } else {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: existing } = await supabase.from("products").select("slug");
      const known = new Set((existing ?? []).map((r) => r.slug));
      const now = new Date().toISOString();
      const rows = [];
      for (const p of prods) {
        if (known.has(p.slug) && !FORCE) {
          console.log(`  = giữ product ${p.slug} (đã có)`);
          continue;
        }
        const plain = p.cleanHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        rows.push({
          slug: p.slug,
          name: p.title,
          description: plain || null,
          short_description: (plain.split(/(?<=[.!?])\s/)[0] || "").slice(0, 200) || null,
          image_url: p.images[0] || null,
          currency: "VND",
          stock_status: "instock",
          status: "draft",
          updated_at: now,
        });
      }
      if (rows.length) {
        const { error } = await supabase.from("products").upsert(rows, { onConflict: "slug" });
        if (error) {
          console.error("  ! upsert products lỗi:", error.message);
        } else {
          rows.forEach((r) => console.log(`  + product ${r.slug} (draft)`));
        }
      }
    }
  }

  // --- nhắc bước tay ---
  if (svc.length) {
    console.log(`\n▶ Thêm tay vào src/lib/legacy.ts:`);
    console.log(`  SERVICE_ORDER: ${svc.map((p) => `"${p.slug}"`).join(", ")}`);
    console.log(`  SERVICE_NAV_LABEL / SERVICE_SOURCE_LOCALE ("${"vi"}") + nhãn vào 6 file dictionaries/*.json:`);
    svc.forEach((p) => console.log(`    "${p.slug}": "${p.label || p.title}"`));
    console.log(`\n  Rồi: node scripts/import-voac.mjs --translate`);
  }
}

// ── translate services ─────────────────────────────────────────────
async function translate() {
  const wp = readJson(WP_PATH, null);
  if (!wp?.services) {
    console.error("Không đọc được wp-content.json services.");
    process.exit(1);
  }
  const bundle = readJson(BUNDLE_PATH, {});
  const voacSlugs = Object.keys(wp.services).filter((s) => s.startsWith(SLUG_PREFIX));
  const slugs = ONLY.length
    ? voacSlugs.filter((s) => ONLY.some((id) => s.includes(String(id))))
    : voacSlugs;

  for (const slug of slugs) {
    const src = wp.services[slug];
    bundle[slug] = bundle[slug] || {};
    const missing = TARGET_LOCALES.filter((l) => !bundle[slug][l]);
    if (!missing.length) {
      console.log(`= ${slug} (đủ bản dịch)`);
      continue;
    }
    console.log(`\n${slug}`);
    for (const loc of missing) {
      console.log(`  -> ${loc}`);
      bundle[slug][loc] = {
        title: await gtText(src.title, "vi", loc),
        excerpt: await gtText(src.excerpt || src.title, "vi", loc),
        content: await gtHtml(src.content, "vi", loc),
        sourceLocale: "vi",
      };
      writeJson(BUNDLE_PATH, bundle);
    }
  }
  console.log(`\nXong. Bản dịch trong ${path.relative(ROOT, BUNDLE_PATH)}`);
}

// ── main ───────────────────────────────────────────────────────────
async function main() {
  if (TRANSLATE) return translate();
  if (APPLY) return apply();
  return buildStaging();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
