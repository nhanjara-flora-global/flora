/**
 * Nội dung bài viết dạng khối (trình soạn admin) ↔ HTML lưu ở `posts.content`.
 *
 * HTML vẫn là dữ liệu gốc: trang web, bản dịch máy (gtHtml), chèn quảng cáo giữa
 * bài đều đọc HTML như trước. Trình soạn đọc HTML thành khối (post-html.ts), lưu
 * thì dựng lại HTML bằng `blocksToHtml` — luôn cùng một dạng, đọc lại ra đúng khối cũ.
 *
 * Chữ trong đoạn: **đậm**, *nghiêng*, [chữ](đường dẫn).
 */

export type PostBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "list"; items: string[]; ordered: boolean }
  | { type: "quote"; text: string }
  | { type: "image"; src: string; caption: string }
  | { type: "video"; youtubeId: string; caption: string }
  | { type: "table"; rows: string[][]; head: boolean }
  | { type: "note"; title: string; text: string }
  | { type: "products"; title: string; slugs: string[] };

export type BlockType = PostBlock["type"];

export const BLOCK_NAMES: Record<BlockType, string> = {
  h2: "Tiêu đề mục",
  h3: "Tiêu đề nhỏ",
  p: "Đoạn văn",
  list: "Danh sách",
  quote: "Trích dẫn",
  image: "Ảnh",
  video: "Video YouTube",
  table: "Bảng",
  note: "Hộp lưu ý",
  products: "Khối sản phẩm",
};

export const NOTE_TITLE = "Lưu ý";
export const PRODUCTS_TITLE = "Sản phẩm dùng trong bài";
export const MAX_BLOCKS = 300;
export const MAX_BLOCK_PRODUCTS = 6;
export const MAX_LIST_ITEMS = 50;
export const MAX_TABLE_ROWS = 40;
export const MAX_TABLE_COLS = 8;

export const BLANK: Record<BlockType, () => PostBlock> = {
  h2: () => ({ type: "h2", text: "" }),
  h3: () => ({ type: "h3", text: "" }),
  p: () => ({ type: "p", text: "" }),
  list: () => ({ type: "list", items: [""], ordered: false }),
  quote: () => ({ type: "quote", text: "" }),
  image: () => ({ type: "image", src: "", caption: "" }),
  video: () => ({ type: "video", youtubeId: "", caption: "" }),
  table: () => ({ type: "table", rows: [["", ""], ["", ""], ["", ""]], head: true }),
  note: () => ({ type: "note", title: NOTE_TITLE, text: "" }),
  products: () => ({ type: "products", title: PRODUCTS_TITLE, slugs: [] }),
};

/** Khối chỉ có chữ — đổi qua lại được giữa các loại này. */
export const TEXT_TYPES = ["p", "h2", "h3", "quote", "list", "note"] as const;
export type TextType = (typeof TEXT_TYPES)[number];
export const isTextBlock = (b: PostBlock): b is Extract<PostBlock, { type: TextType }> =>
  (TEXT_TYPES as readonly string[]).includes(b.type);

/** Chữ của khối chữ, nhiều ý thì mỗi ý một dòng. */
function textOf(b: Extract<PostBlock, { type: TextType }>): string {
  if (b.type === "list") return b.items.filter((s) => s.trim()).join("\n");
  return b.text;
}

/** Đổi khối chữ sang loại khác, giữ nội dung. Tiêu đề là một dòng chữ trơn. */
export function convertBlock(b: Extract<PostBlock, { type: TextType }>, to: TextType): PostBlock {
  const text = textOf(b);
  switch (to) {
    case "h2":
    case "h3":
      return { type: to, text: plainText(text).replace(/\s+/g, " ").trim().slice(0, 150) };
    case "list":
      return {
        type: "list",
        ordered: b.type === "list" ? b.ordered : false,
        items: text.split(/\n+/).map((s) => s.trim()).filter(Boolean).slice(0, MAX_LIST_ITEMS),
      };
    case "note":
      return { type: "note", title: b.type === "note" ? b.title : NOTE_TITLE, text };
    default:
      return { type: to, text };
  }
}

// ── Chữ trong đoạn ─────────────────────────────────────────────────

export type Inline =
  | { t: "text"; v: string }
  | { t: "b" | "i" | "bi"; v: string }
  | { t: "a"; v: string; href: string };

/** Chỉ nhận link trong trang ("/…"), http(s), tel:, mailto: — chặn javascript: và các kiểu lạ. */
export const safeHref = (href: string) => {
  const h = href.trim();
  return /^(\/(?!\/)|https?:\/\/|tel:|mailto:)\S*$/i.test(h) ? h : null;
};

const INLINE_RE = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*([^*\n]+?)\*|\[([^\]\n]+)\]\(([^)\s]+)\)/g;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  INLINE_RE.lastIndex = 0;
  for (let m = INLINE_RE.exec(text); m; m = INLINE_RE.exec(text)) {
    if (m.index > last) out.push({ t: "text", v: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ t: "bi", v: m[1] });
    else if (m[2] !== undefined) out.push({ t: "b", v: m[2] });
    else if (m[3] !== undefined) out.push({ t: "i", v: m[3] });
    else {
      const href = safeHref(m[5]);
      out.push(href ? { t: "a", v: m[4], href } : { t: "text", v: m[0] });
    }
    last = INLINE_RE.lastIndex;
  }
  if (last < text.length) out.push({ t: "text", v: text.slice(last) });
  return out;
}

/** Bỏ ký hiệu **, *, [](…) — để đếm chữ, làm alt ảnh. */
export const plainText = (text: string) => parseInline(text).map((x) => x.v).join("");

// ── Video ──────────────────────────────────────────────────────────

/** Mã video YouTube trong mọi dạng link (watch, youtu.be, shorts, embed) hoặc mã trần. */
export function parseYoutubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/i,
  );
  return m ? m[1] : null;
}

export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const youtubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?rel=0`;

// ── Ảnh ────────────────────────────────────────────────────────────

/** Ảnh tải lên (https://…supabase…) hoặc ảnh trong web (/images/…). */
export const isImageSrc = (s: string) => s.length <= 1000 && /^(https:\/\/|\/(?!\/))[^\s"'<>()\\]+$/i.test(s);

// ── Khối → HTML ────────────────────────────────────────────────────

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s: string) => esc(s).replace(/"/g, "&quot;");

function inlineHtml(text: string): string {
  return parseInline(text)
    .map((x) => {
      const v = esc(x.v).replace(/\n/g, "<br />");
      switch (x.t) {
        case "b":
          return `<strong>${v}</strong>`;
        case "i":
          return `<em>${v}</em>`;
        case "bi":
          return `<strong><em>${v}</em></strong>`;
        case "a":
          return x.href.startsWith("/")
            ? `<a href="${attr(x.href)}">${v}</a>`
            : `<a href="${attr(x.href)}" target="_blank" rel="noopener nofollow">${v}</a>`;
        default:
          return v;
      }
    })
    .join("");
}

/** Đoạn có dòng trống ở giữa = nhiều đoạn; xuống dòng đơn = <br />. */
function paragraphs(text: string, cls = ""): string {
  return text
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => `<p${cls}>${inlineHtml(t)}</p>`)
    .join("");
}

function blockHtml(b: PostBlock): string {
  switch (b.type) {
    case "h2":
    case "h3":
      return b.text.trim() ? `<${b.type}>${esc(b.text.trim())}</${b.type}>` : "";
    case "p":
      return paragraphs(b.text);
    case "quote": {
      const inner = paragraphs(b.text);
      return inner ? `<blockquote>${inner}</blockquote>` : "";
    }
    case "list": {
      const items = b.items.map((s) => s.trim()).filter(Boolean);
      if (!items.length) return "";
      const tag = b.ordered ? "ol" : "ul";
      return `<${tag}>${items.map((s) => `<li>${inlineHtml(s)}</li>`).join("")}</${tag}>`;
    }
    case "image": {
      if (!isImageSrc(b.src)) return "";
      const cap = b.caption.trim();
      const img = `<img src="${attr(b.src)}" alt="${attr(plainText(cap))}" loading="lazy" />`;
      return `<figure>${img}${cap ? `<figcaption>${inlineHtml(cap)}</figcaption>` : ""}</figure>`;
    }
    case "video": {
      if (!/^[\w-]{11}$/.test(b.youtubeId)) return "";
      const cap = b.caption.trim();
      return (
        `<figure class="post-video" data-youtube="${b.youtubeId}"><div class="post-video__frame">` +
        `<iframe src="${youtubeEmbed(b.youtubeId)}" title="${attr(plainText(cap) || "Video YouTube")}" loading="lazy" ` +
        `allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>` +
        `</div>${cap ? `<figcaption>${inlineHtml(cap)}</figcaption>` : ""}</figure>`
      );
    }
    case "table": {
      const rows = b.rows.filter((r) => r.some((c) => c.trim()));
      if (!rows.length) return "";
      const tr = (r: string[], tag: "td" | "th") =>
        `<tr>${r.map((c) => `<${tag}>${inlineHtml(c.trim())}</${tag}>`).join("")}</tr>`;
      const [first, ...rest] = rows;
      return b.head
        ? `<table><thead>${tr(first, "th")}</thead>${rest.length ? `<tbody>${rest.map((r) => tr(r, "td")).join("")}</tbody>` : ""}</table>`
        : `<table><tbody>${rows.map((r) => tr(r, "td")).join("")}</tbody></table>`;
    }
    case "note": {
      const inner = paragraphs(b.text);
      if (!inner) return "";
      const title = b.title.trim();
      return `<aside class="post-note">${title ? `<p class="post-note__title">${esc(title)}</p>` : ""}${inner}</aside>`;
    }
    case "products": {
      const slugs = b.slugs.filter((s) => /^[a-z0-9-]+$/.test(s));
      if (!slugs.length) return "";
      return `<div class="post-products" data-products="${slugs.join(",")}"><p class="post-products__title">${esc(b.title.trim() || PRODUCTS_TITLE)}</p></div>`;
    }
  }
}

/** Mỗi khối một dòng để HTML trong database dễ đọc. */
export function blocksToHtml(blocks: PostBlock[]): string {
  return blocks.map(blockHtml).filter(Boolean).join("\n");
}

// ── Kiểm tra dữ liệu gửi lên máy chủ ───────────────────────────────

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\r\n?/g, "\n").slice(0, max) : "");

/** Dữ liệu khối từ trình duyệt → khối hợp lệ (bỏ khối lạ, cắt chữ quá dài). */
export function cleanBlocks(input: unknown): PostBlock[] {
  if (!Array.isArray(input)) return [];
  const out: PostBlock[] = [];
  for (const raw of input.slice(0, MAX_BLOCKS)) {
    if (!raw || typeof raw !== "object") continue;
    const b = raw as Record<string, unknown>;
    switch (b.type) {
      case "h2":
      case "h3":
        out.push({ type: b.type, text: str(b.text, 150).replace(/\n/g, " ") });
        break;
      case "p":
      case "quote":
        out.push({ type: b.type, text: str(b.text, 10000) });
        break;
      case "list":
        out.push({
          type: "list",
          ordered: b.ordered === true,
          items: (Array.isArray(b.items) ? b.items : []).slice(0, MAX_LIST_ITEMS).map((s) => str(s, 1000).replace(/\n/g, " ")),
        });
        break;
      case "image": {
        const src = str(b.src, 1000).trim();
        if (isImageSrc(src)) out.push({ type: "image", src, caption: str(b.caption, 300).replace(/\n/g, " ") });
        break;
      }
      case "video": {
        const id = str(b.youtubeId, 11);
        if (/^[\w-]{11}$/.test(id)) out.push({ type: "video", youtubeId: id, caption: str(b.caption, 300).replace(/\n/g, " ") });
        break;
      }
      case "table": {
        const rows = (Array.isArray(b.rows) ? b.rows : []).slice(0, MAX_TABLE_ROWS).map((r) =>
          (Array.isArray(r) ? r : []).slice(0, MAX_TABLE_COLS).map((c) => str(c, 500).replace(/\n/g, " ")),
        );
        if (rows.length) out.push({ type: "table", rows, head: b.head !== false });
        break;
      }
      case "note":
        out.push({ type: "note", title: str(b.title, 80).replace(/\n/g, " "), text: str(b.text, 3000) });
        break;
      case "products":
        out.push({
          type: "products",
          title: str(b.title, 80).replace(/\n/g, " "),
          slugs: (Array.isArray(b.slugs) ? b.slugs : [])
            .filter((s): s is string => typeof s === "string" && /^[a-z0-9-]{1,120}$/.test(s))
            .slice(0, MAX_BLOCK_PRODUCTS),
        });
        break;
    }
  }
  return out;
}
