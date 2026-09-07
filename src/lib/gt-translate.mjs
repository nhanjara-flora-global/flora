/**
 * Dịch qua endpoint Google Translate miễn phí (client=gtx). Không cần API key.
 * Dùng chung bởi server action admin và scripts/translate-news.mjs.
 */

const GT_CODE = { en: "en", vi: "vi", zh: "zh-CN", ko: "ko", hi: "hi", si: "si" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gtChunk(text, source, target) {
  const params = new URLSearchParams({
    client: "gtx",
    sl: GT_CODE[source] ?? source,
    tl: GT_CODE[target] ?? target,
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
    } catch {
      await sleep(1000 * (attempt + 1));
    }
  }
  return text;
}

/** Dịch một đoạn text thuần (tự cắt nhỏ nếu quá dài). */
export async function gtText(text, source, target) {
  const t = (text || "").trim();
  if (!t || !/[\p{L}\p{N}]/u.test(t)) return text || "";

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
    out.push(await gtChunk(c, source, target));
    await sleep(150);
  }
  return out.join(" ");
}

/** Dịch HTML: giữ nguyên thẻ, chỉ dịch text node. */
export async function gtHtml(html, source, target) {
  const parts = (html || "").split(/(<[^>]+>)/);
  const result = [];
  for (const part of parts) {
    if (!part) continue;
    if (/^<[^>]+>$/.test(part) || !part.trim()) result.push(part);
    else result.push(await gtText(part, source, target));
  }
  return result.join("");
}

/**
 * Dịch một bài viết sang nhiều ngôn ngữ.
 * Trả về object dạng locale -> { title, excerpt, content, sourceLocale }.
 */
export async function translateArticle(
  { title, excerpt, content },
  targets,
  source = "vi",
) {
  /** @type {Record<string, {title:string, excerpt:string, content:string, sourceLocale:string}>} */
  const result = {};
  for (const target of targets) {
    if (target === source) continue;
    result[target] = {
      title: await gtText(title, source, target),
      excerpt: await gtText(excerpt || title, source, target),
      content: await gtHtml(content, source, target),
      sourceLocale: source,
    };
  }
  return result;
}
