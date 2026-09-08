/**
 * Slate (Plate) value → HTML, cho đúng schema editor bài viết đang dùng.
 * Chạy phía client, đồng bộ. Kết quả khớp `.prose-legacy` + đi qua `gtHtml` được.
 *
 * Không dùng `serializeHtml` của Plate vì nó thiên về server + cần "static
 * component" cho mọi node. Ở đây schema nhỏ và cố định nên tự map gọn hơn.
 */

type Leaf = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  code?: boolean;
  highlight?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontFamily?: string;
};

type Element = {
  type: string;
  children: Node[];
  align?: string;
  url?: string;
  [key: string]: unknown;
};

type Node = Leaf | Element;

const isElement = (n: Node): n is Element =>
  typeof (n as Element).type === "string" && Array.isArray((n as Element).children);

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escAttr(s: string): string {
  return esc(s).replace(/"/g, "&quot;");
}

/** Bọc text của một leaf bằng thẻ ngữ nghĩa + 1 <span style> nếu có màu/cỡ/font. */
function serializeLeaf(leaf: Leaf): string {
  let html = esc(leaf.text).replace(/\n/g, "<br />");
  if (html === "") return "";

  const styles: string[] = [];
  if (leaf.color) styles.push(`color:${leaf.color}`);
  if (leaf.backgroundColor) styles.push(`background-color:${leaf.backgroundColor}`);
  if (leaf.fontSize) styles.push(`font-size:${leaf.fontSize}`);
  if (leaf.fontFamily) styles.push(`font-family:${leaf.fontFamily}`);
  if (styles.length > 0) {
    html = `<span style="${escAttr(styles.join(";"))}">${html}</span>`;
  }

  if (leaf.code) html = `<code>${html}</code>`;
  if (leaf.highlight) html = `<mark>${html}</mark>`;
  if (leaf.subscript) html = `<sub>${html}</sub>`;
  if (leaf.superscript) html = `<sup>${html}</sup>`;
  if (leaf.strikethrough) html = `<s>${html}</s>`;
  if (leaf.underline) html = `<u>${html}</u>`;
  if (leaf.italic) html = `<em>${html}</em>`;
  if (leaf.bold) html = `<strong>${html}</strong>`;
  return html;
}

function serializeChildren(children: Node[]): string {
  return children
    .map((n) => (isElement(n) ? serializeElement(n) : serializeLeaf(n as Leaf)))
    .join("");
}

const HEADING = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

function serializeElement(node: Element): string {
  const inner = serializeChildren(node.children);
  const align = (node.align ?? (node.textAlign as string | undefined)) || "";
  const alignAttr =
    align && align !== "left"
      ? ` style="text-align:${escAttr(align)}"`
      : "";

  switch (node.type) {
    case "h1":
    case "h2":
      return `<h2${alignAttr}>${inner}</h2>`;
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return `<h3${alignAttr}>${inner}</h3>`;
    case "blockquote":
      return `<blockquote${alignAttr}>${inner}</blockquote>`;
    case "ul":
      return `<ul>${inner}</ul>`;
    case "ol":
      return `<ol>${inner}</ol>`;
    case "li":
      return `<li>${inner}</li>`;
    case "lic": // list item content — bỏ wrapper, giữ nội dung
      return inner;
    case "a": {
      const href = escAttr(String(node.url ?? "#"));
      return `<a href="${href}" rel="noopener nofollow" target="_blank">${inner}</a>`;
    }
    case "img": {
      const src = escAttr(String(node.url ?? ""));
      const alt = escAttr(String((node.alt as string) ?? ""));
      return src ? `<img src="${src}" alt="${alt}" loading="lazy" />` : "";
    }
    case "hr":
      return "<hr />";
    case "table":
      return `<table>${inner}</table>`;
    case "tr":
      return `<tr>${inner}</tr>`;
    case "td":
      return `<td${alignAttr}>${inner}</td>`;
    case "th":
      return `<th${alignAttr}>${inner}</th>`;
    case "p":
    default:
      return HEADING.has(node.type)
        ? `<h3${alignAttr}>${inner}</h3>`
        : `<p${alignAttr}>${inner}</p>`;
  }
}

/** Value Plate (mảng node gốc) → chuỗi HTML. */
export function slateToHtml(value: unknown): string {
  if (!Array.isArray(value)) return "";
  const html = value
    .map((n) => (isElement(n as Node) ? serializeElement(n as Element) : ""))
    .join("")
    .trim();
  // Editor rỗng = 1 paragraph trống.
  if (html === "" || html === "<p></p>") return "";
  return html;
}
