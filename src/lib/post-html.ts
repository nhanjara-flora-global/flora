/**
 * HTML → khối bài viết. Dùng khi mở bài trong trình soạn, khi dán từ Word /
 * Google Docs / web khác, và khi chuyển bài cũ (WordPress) sang dạng mới.
 *
 * Giữ cấu trúc (tiêu đề, đoạn, danh sách, bảng, ảnh + chú thích, video YouTube,
 * trích dẫn) và chữ đậm / nghiêng / link; màu, phông, cỡ chữ, canh lề của nơi
 * chép bỏ đi để bài theo đúng giao diện web.
 *
 * Cần DOM (DOMParser) — chạy ở trình duyệt. Chỉ dùng API DOM chuẩn để chạy được
 * cả với jsdom khi chuyển dữ liệu hàng loạt.
 */
import {
  isImageSrc,
  parseInline,
  parseYoutubeId,
  plainText,
  PRODUCTS_TITLE,
  safeHref,
  MAX_BLOCKS,
  MAX_TABLE_COLS,
  type PostBlock,
} from "./post-blocks";

type Seg = { v: string; b: boolean; i: boolean; href: string | null };

const BLOCK_TAGS = new Set([
  "P", "DIV", "SECTION", "ARTICLE", "MAIN", "HEADER", "FOOTER", "ASIDE", "BLOCKQUOTE", "FIGURE",
  "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "TABLE", "PRE", "HR", "IMG", "IFRAME", "LI", "DL", "DT", "DD", "CENTER",
]);
const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "SVG", "NAV", "FORM", "META", "LINK", "TITLE",
]);

const TEXT = 3;
const ELEMENT = 1;
const isEl = (n: Node): n is Element => n.nodeType === ELEMENT;
const styleOf = (el: Element, prop: string) =>
  new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, "i").exec(el.getAttribute("style") ?? "")?.[1].trim().toLowerCase();

function isBold(el: Element, parent: boolean) {
  const w = styleOf(el, "font-weight");
  if (w) return w === "bold" || w === "bolder" || +w >= 600;
  // Google Docs bọc cả đoạn trong <b style="font-weight:normal">, nên chỉ tin thẻ khi không ghi kiểu chữ.
  return el.tagName === "B" || el.tagName === "STRONG" || parent;
}

function isItalic(el: Element, parent: boolean) {
  const s = styleOf(el, "font-style");
  if (s) return s === "italic" || s === "oblique";
  return el.tagName === "I" || el.tagName === "EM" || parent;
}

function segments(node: Node, b: boolean, i: boolean, href: string | null, out: Seg[]) {
  if (node.nodeType === TEXT) {
    const v = (node.nodeValue ?? "").replace(/[\s ]+/g, " ");
    if (v) out.push({ v, b, i, href });
    return;
  }
  if (!isEl(node) || SKIP_TAGS.has(node.tagName)) return;
  if (node.tagName === "BR") {
    out.push({ v: "\n", b: false, i: false, href: null });
    return;
  }
  const block = BLOCK_TAGS.has(node.tagName);
  if (block) out.push({ v: " ", b: false, i: false, href: null });
  const h = node.tagName === "A" ? (safeHref(node.getAttribute("href") ?? "") ?? href) : href;
  const nb = isBold(node, b);
  const ni = isItalic(node, i);
  node.childNodes.forEach((c) => segments(c, nb, ni, h, out));
  if (block) out.push({ v: " ", b: false, i: false, href: null });
}

/** Đoạn chữ → "**đậm**", "*nghiêng*", "[chữ](link)" như ô soạn. */
function inlineText(nodes: Node[], bold = false): string {
  const segs: Seg[] = [];
  nodes.forEach((n) => segments(n, bold, false, null, segs));
  const merged: Seg[] = [];
  for (const s of segs) {
    // Dấu * trong chữ thường đổi thành ∗ để không lẫn với ký hiệu in đậm / nghiêng.
    const v = s.v.replace(/\*/g, "∗");
    const last = merged[merged.length - 1];
    const blank = !v.trim() && v !== "\n";
    if (last && (blank || (last.b === s.b && last.i === s.i && last.href === s.href))) last.v += v;
    else merged.push({ ...s, v });
  }
  const out = merged
    .map(({ v, b, i, href }) => {
      const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(v)!;
      const core = m[2];
      if (!core || core === "\n") return v;
      if (href) return `${m[1]}[${core.replace(/\s*\n\s*/g, " ")}](${href})${m[3]}`;
      const mark = b && i ? "***" : b ? "**" : i ? "*" : "";
      // Ký hiệu đậm / nghiêng không vắt qua dòng: bọc từng dòng.
      const wrapped = core
        .split("\n")
        .map((line) => (mark && line.trim() ? `${mark}${line.trim()}${mark}` : line))
        .join("\n");
      return m[1] + wrapped + m[3];
    })
    .join("");
  return out
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const flat = (s: string) => plainText(s).replace(/\s+/g, " ").trim();

/** Cả đoạn in đậm (không link) → chữ bên trong, ngược lại null. */
function wholeBold(text: string): string | null {
  const t = parseInline(text.trim());
  return t.length === 1 && (t[0].t === "b" || t[0].t === "bi") ? t[0].v.trim() : null;
}

const TOC_TITLE = /^(mục lục|nội dung( chính)?|table of contents|contents)$/i;
const NOT_HEADING = /^(bảng|hình|biểu đồ|sơ đồ|nguồn|ảnh|theo|\(|https?:\/\/|www\.)/i;
const isCaps = (s: string) => /\p{L}/u.test(s) && s === s.toLocaleUpperCase("vi");

/**
 * Bài cũ / dán từ Word hay dùng đoạn in đậm thay tiêu đề. Đoạn ngắn in đậm toàn
 * bộ, có nội dung theo sau → tiêu đề. Bài đã có H2 thì thành H3; bài trộn chữ IN
 * HOA và chữ thường thì IN HOA là H2, còn lại H3.
 */
function promoteHeadings(blocks: PostBlock[]): PostBlock[] {
  const hasH2 = blocks.some((b) => b.type === "h2");
  const found = new Map<number, string>();
  blocks.forEach((b, i) => {
    if (b.type !== "p" || b.text.includes("\n")) return;
    const t = wholeBold(b.text);
    if (!t || t.length < 3 || t.length > 150 || /[.,;:…]$/.test(t) || NOT_HEADING.test(t)) return;
    const next = blocks[i + 1];
    if (!next) return;
    // Tên tác giả / nguồn cuối bài: dòng đậm + một dòng ngắn rồi hết.
    if (i >= blocks.length - 2 && next.type === "p" && plainText(next.text).length < 160) return;
    found.set(i, t);
  });
  if (!found.size) return blocks;
  const caps = [...found.values()].map(isCaps);
  const mixed = caps.some(Boolean) && !caps.every(Boolean);
  return blocks.map((b, i) => {
    const t = found.get(i);
    if (t === undefined) return b;
    const level = hasH2 ? "h3" : mixed && !isCaps(t) ? "h3" : "h2";
    return { type: level, text: t };
  });
}

export function htmlToBlocks(html: string, opts: { headings?: boolean } = {}): PostBlock[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const out: PostBlock[] = [];
  const push = (b: PostBlock) => {
    if (out.length < MAX_BLOCKS) out.push(b);
  };

  const para = (nodes: Node[]) => {
    const text = inlineText(nodes);
    // Thiếu thẻ <p> (Word, vài web): xuống 2 dòng là sang đoạn mới.
    for (const t of text.split(/\n\n+/)) if (t.trim()) push({ type: "p", text: t.trim() });
  };

  const image = (img: Element, caption = "") => {
    const src = (img.getAttribute("src") ?? "").trim();
    if (isImageSrc(src)) push({ type: "image", src, caption: (caption || img.getAttribute("alt") || "").trim() });
  };

  const own = (li: Element) =>
    [...li.childNodes].filter((c) => !(isEl(c) && (c.tagName === "UL" || c.tagName === "OL")));

  const list = (el: Element) => {
    const lis = [...el.querySelectorAll("li")];
    // Mục lục tự sinh (link #neo tới tiêu đề) — neo không còn, bỏ cả mục lục.
    const toc =
      lis.length > 0 &&
      lis.every((li) => {
        const a = own(li).find((c): c is Element => isEl(c) && c.tagName === "A");
        return !!a && (a.getAttribute("href") ?? "").startsWith("#") && flat(inlineText(own(li))) === flat(a.textContent ?? "");
      });
    if (toc) {
      const prev = out[out.length - 1];
      if (prev && (prev.type === "h2" || prev.type === "h3") && TOC_TITLE.test(prev.text.trim())) out.pop();
      return;
    }
    const items = lis.map((li) => inlineText(own(li)).replace(/\s*\n\s*/g, " ")).filter(Boolean);
    if (items.length) push({ type: "list", items, ordered: el.tagName === "OL" });
  };

  const table = (el: Element) => {
    const trs = [...el.querySelectorAll("tr")];
    let rows = trs.map((tr) =>
      [...tr.children]
        .filter((c) => c.tagName === "TD" || c.tagName === "TH")
        .slice(0, MAX_TABLE_COLS)
        .map((c) => {
          const cell = (bold: boolean) => inlineText([...c.childNodes], bold).replace(/\s*\n\s*/g, " ");
          // Ô tiêu đề hàng (<th> ngoài hàng đầu) → chữ đậm.
          return { th: c.tagName === "TH", text: cell(false), bold: c.tagName === "TH" ? cell(true) : "" };
        }),
    );
    rows = rows.filter((r) => r.some((c) => c.text));
    if (!rows.length) return;
    const cols = Math.max(...rows.map((r) => r.length));
    // Hàng đầu là tiêu đề cột khi toàn ô <th> hoặc mọi ô có chữ đều in đậm.
    const first = rows[0];
    const head =
      first.every((c) => c.th || !c.text) ||
      first.filter((c) => c.text).every((c) => wholeBold(c.text) !== null);
    const cells = rows.map((r, i) =>
      Array.from({ length: cols }, (_, j) => {
        const c = r[j];
        if (!c?.text) return "";
        if (i === 0 && head) return wholeBold(c.text) ?? c.text;
        return c.th ? c.bold : c.text;
      }),
    );
    push({ type: "table", rows: cells, head });
  };

  const walk = (parent: Node) => {
    let run: Node[] = [];
    const flush = () => {
      if (run.length) para(run);
      run = [];
    };
    parent.childNodes.forEach((n) => {
      if (!isEl(n)) {
        run.push(n);
        return;
      }
      const tag = n.tagName;
      if (SKIP_TAGS.has(tag)) return;
      if (!BLOCK_TAGS.has(tag)) {
        // Thẻ chữ (span, b, a…) có thể chứa ảnh hoặc khối bên trong.
        if (n.querySelector("img, iframe, p, div, ul, ol, table, h1, h2, h3, h4, h5, h6")) {
          flush();
          walk(n);
        } else run.push(n);
        return;
      }
      flush();
      if (/^H[1-6]$/.test(tag)) {
        const text = flat(inlineText([n]));
        // Tiêu đề quá dài là đoạn văn bị gắn nhầm thẻ.
        if (text.length > 150) push({ type: "p", text: `**${text}**` });
        else if (text) push({ type: tag <= "H2" ? "h2" : "h3", text });
        n.querySelectorAll("img").forEach((img) => image(img));
      } else if (tag === "UL" || tag === "OL") list(n);
      else if (tag === "TABLE") table(n);
      else if (tag === "IMG") image(n);
      else if (tag === "IFRAME") {
        const id = parseYoutubeId(n.getAttribute("src") ?? "");
        if (id) push({ type: "video", youtubeId: id, caption: "" });
      } else if (tag === "FIGURE") {
        const cap = inlineText([...n.querySelectorAll("figcaption")]).replace(/\s*\n\s*/g, " ");
        const frame = n.querySelector("iframe");
        const yt = n.getAttribute("data-youtube") || parseYoutubeId(frame?.getAttribute("src") ?? "");
        const imgs = n.querySelectorAll("img");
        if (yt && /^[\w-]{11}$/.test(yt)) push({ type: "video", youtubeId: yt, caption: cap });
        else if (imgs.length) imgs.forEach((img) => image(img, cap));
        else walk(n);
      } else if (tag === "ASIDE" && n.classList.contains("post-note")) {
        const title = n.querySelector(".post-note__title");
        const text = [...n.children]
          .filter((c) => c !== title)
          .map((c) => inlineText([c]))
          .filter(Boolean)
          .join("\n\n");
        push({ type: "note", title: (title?.textContent ?? "").trim(), text });
      } else if (n.classList.contains("post-products")) {
        const slugs = (n.getAttribute("data-products") ?? "").split(",").filter((s) => /^[a-z0-9-]+$/.test(s));
        const title = (n.querySelector(".post-products__title")?.textContent ?? "").trim();
        if (slugs.length) push({ type: "products", title: title || PRODUCTS_TITLE, slugs });
      } else if (tag === "BLOCKQUOTE") {
        const ps = [...n.children].filter((c) => c.tagName === "P");
        const text = (ps.length ? ps.map((p) => inlineText([p])) : [inlineText([n])]).filter(Boolean).join("\n\n");
        if (text) push({ type: "quote", text });
      } else if (tag === "HR") {
        /* bỏ */
      } else walk(n);
    });
    flush();
  };

  walk(doc.body);
  return opts.headings ? promoteHeadings(out) : out;
}
