import { parse, type HTMLElement } from "node-html-parser";

/**
 * Turns the imported WordPress HTML of a service page into a structured model
 * the bespoke template can render as cards, timelines, spec grids and logo
 * strips — instead of one undifferentiated wall of prose.
 */

export type FeatureItem = { label?: string; html: string };

export type ServiceBlock =
  | { kind: "paragraph"; html: string }
  | { kind: "quote"; html: string }
  | { kind: "features"; ordered: boolean; items: FeatureItem[] }
  | { kind: "checklist"; items: string[] }
  | { kind: "specs"; rows: { key: string; value: string }[] }
  | { kind: "logos"; images: { src: string; alt: string }[] };

export type ServiceSection = {
  id: string;
  /** Sequence number when the heading was like "1. …"; null otherwise. */
  step: number | null;
  title: string;
  blocks: ServiceBlock[];
};

export type ServiceModel = {
  /** Short lead-in line, shown in the hero. */
  tagline: string | null;
  /** Intro paragraphs before the first heading. */
  lead: ServiceBlock[];
  sections: ServiceSection[];
  /** Bare headings with no body — e.g. VOAC crop lists. */
  tags: string[];
  /** True when every section carries a "1." / "2." style number. */
  numbered: boolean;
};

const PROCESS_HINT =
  /(stage|step|protocol|roadmap|process|phase|quy tr[ìi]nh|l[ộo] tr[ìi]nh|các b[ưu][ơớ]c)/i;

function decodeEntities(s: string): string {
  return s
    .replace(/&#8220;|&#8221;|&#8243;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8216;|&#8217;|&#8242;|&lsquo;|&rsquo;/g, "'")
    .replace(/&#8211;|&#8212;|&ndash;|&mdash;/g, "–")
    .replace(/&#8230;|&hellip;/g, "…")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&");
}

/** For headings / plain text: decode, collapse whitespace, trim. */
function decode(s: string): string {
  return decodeEntities(s).replace(/\s+/g, " ").trim();
}

/** Keep a safe subset of inline markup; drop attributes except a valid href. */
function inlineHtml(el: HTMLElement): string {
  const walk = (node: HTMLElement): string =>
    node.childNodes
      .map((child) => {
        if (child.nodeType === 3) {
          return decodeEntities((child as unknown as { text: string }).text).replace(/\s+/g, " ");
        }
        const c = child as HTMLElement;
        const tag = c.rawTagName?.toUpperCase();
        const inner = walk(c);
        const trimmed = inner.trim();
        if (tag === "B" || tag === "STRONG") return trimmed ? `<strong>${trimmed}</strong>` : "";
        if (tag === "I" || tag === "EM") return trimmed ? `<em>${trimmed}</em>` : "";
        if (tag === "BR") return " ";
        if (tag === "A") {
          const href = c.getAttribute("href") ?? "";
          const safe = /^(https?:|\/|mailto:)/.test(href) && !href.startsWith("#");
          return safe && trimmed ? `<a href="${href}">${trimmed}</a>` : inner;
        }
        return inner;
      })
      .join("");
  return walk(el)
    // Re-insert spaces lost where inline tags were glued to adjacent words.
    .replace(/<\/(strong|em|a)>(?=[A-Za-zÀ-ỹ0-9(])/g, "</$1> ")
    .replace(/(?<=[A-Za-zÀ-ỹ0-9)."'])<(strong|em|a)(?=[ >])/g, " <$1")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html: string): string {
  return decode(html.replace(/<[^>]+>/g, " "));
}

/** "<strong>Label:</strong> description" or plain "Label: description". */
function toFeature(html: string): FeatureItem {
  const bold = html.match(/^<strong>\s*([^<]+?)\s*:?\s*<\/strong>\s*[:–-]?\s*([^]*)$/);
  if (bold && bold[1].length <= 72 && bold[2].trim()) {
    return { label: decode(bold[1]).replace(/:$/, ""), html: bold[2].trim() };
  }
  const text = stripTags(html);
  const plain = text.match(/^([^:]{2,44}):\s+(.{12,})$/);
  if (plain && !/<(strong|a)\b/.test(html)) {
    return { label: plain[1].trim(), html: escapeText(plain[2].trim()) };
  }
  return { html };
}

function escapeText(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Short "Key: value" — used for VOAC model-farm spec lists. */
function toSpecRow(text: string): { key: string; value: string } | null {
  const m = text.match(/^([^:]{1,28}):\s*(.{1,64})$/);
  return m ? { key: m[1].trim(), value: m[2].trim() } : null;
}

function listBlock(list: HTMLElement, sectionTitle: string): ServiceBlock | null {
  const ordered = list.rawTagName?.toUpperCase() === "OL";
  const raw = list
    .querySelectorAll("li")
    .map((li) => inlineHtml(li))
    .filter((h) => stripTags(h).length > 0);
  if (raw.length === 0) return null;

  const specs = raw.map((h) => toSpecRow(stripTags(h))).filter(Boolean) as {
    key: string;
    value: string;
  }[];
  const specValuesShort = specs.every((r) => r.value.length <= 48);
  if (specs.length === raw.length && specs.length >= 2 && specValuesShort) {
    return { kind: "specs", rows: specs };
  }

  const items = raw.map(toFeature);
  const labelled = items.filter((i) => i.label).length;
  if (labelled >= Math.ceil(raw.length / 2)) {
    return {
      kind: "features",
      ordered: ordered || PROCESS_HINT.test(sectionTitle),
      items,
    };
  }
  return { kind: "checklist", items: raw.map((h) => stripTags(h)) };
}

/** An <ol>/<ul> that is purely a table of contents (only anchor links). */
function isTocList(list: HTMLElement): boolean {
  const lis = list.querySelectorAll("li");
  if (lis.length === 0) return false;
  return lis.every((li) => {
    const a = li.querySelector("a");
    return Boolean(a) && (a!.getAttribute("href") ?? "").startsWith("#");
  });
}

function isQuote(html: string): boolean {
  const text = stripTags(html);
  if (text.length < 12 || text.length > 240) return false;
  const quoted = /^["“”']/.test(text) && /["“”']$/.test(text);
  const wrapped = /^<(strong|em)>[^]*<\/(strong|em)>$/.test(html.trim());
  return quoted || (wrapped && text.length < 150 && /[."'!?]$/.test(text));
}

/** A paragraph that is nothing but a short bold run acts as a heading. */
function boldOnlyHeading(html: string): string | null {
  const m = html.trim().match(/^<strong>([^<]{2,70})<\/strong>$/);
  return m ? decode(m[1]) : null;
}

export function parseService(html: string): ServiceModel {
  const root = parse(html);
  const nodes = root.childNodes
    .map((n) => n as HTMLElement)
    .filter(
      (n) =>
        n.nodeType === 1 ||
        (n.nodeType === 3 && decode((n as unknown as { text: string }).text)),
    );

  const lead: ServiceBlock[] = [];
  const sections: ServiceSection[] = [];
  const tags: string[] = [];
  let tagline: string | null = null;
  let current: ServiceSection | null = null;
  let pendingLogos: { src: string; alt: string }[] = [];
  let seenHeading = false;
  let paraCount = 0;

  const target = () => (current ? current.blocks : lead);
  const flushLogos = () => {
    if (pendingLogos.length === 0) return;
    target().push({ kind: "logos", images: pendingLogos });
    pendingLogos = [];
  };
  const startSection = (title: string, step: number | null) => {
    seenHeading = true;
    current = { id: `s${sections.length + 1}`, step, title, blocks: [] };
    sections.push(current);
  };

  for (const node of nodes) {
    const tag = (node.rawTagName ?? "").toUpperCase();

    if (tag === "H1" || tag === "H2" || tag === "H3" || tag === "H4") {
      flushLogos();
      const title = decode(node.text);
      if (!title) continue;
      if (/^(mục lục|table of contents|contents|nội dung)$/i.test(title)) {
        seenHeading = true;
        continue;
      }
      const step = title.match(/^(\d+)[.)]\s+(.*)$/);
      startSection(step ? step[2] : title, step ? Number(step[1]) : null);
      continue;
    }

    if (tag === "UL" || tag === "OL") {
      if (isTocList(node)) continue;
      flushLogos();
      const block = listBlock(node, sections.at(-1)?.title ?? "");
      if (block) target().push(block);
      continue;
    }

    if (tag === "IMG" || tag === "FIGURE") {
      const img = tag === "IMG" ? node : node.querySelector("img");
      const src = img?.getAttribute("src") ?? "";
      if (src) pendingLogos.push({ src, alt: img?.getAttribute("alt") ?? "" });
      continue;
    }

    if (tag === "BLOCKQUOTE") {
      flushLogos();
      const q = inlineHtml(node);
      if (stripTags(q)) target().push({ kind: "quote", html: q });
      continue;
    }

    if (tag === "P" || tag === "" || tag === "SPAN" || tag === "DIV") {
      flushLogos();
      const inner = inlineHtml(node);
      const text = stripTags(inner);
      if (!text) continue;
      paraCount += 1;

      if (
        !seenHeading &&
        !current &&
        tagline === null &&
        paraCount === 1 &&
        text.length <= 110
      ) {
        tagline = text.replace(/^["“”]|["“”]$/g, "");
        continue;
      }

      const asHeading = boldOnlyHeading(inner);
      if (asHeading && !isQuote(inner)) {
        startSection(asHeading, null);
        continue;
      }

      target().push(
        isQuote(inner) ? { kind: "quote", html: inner } : { kind: "paragraph", html: inner },
      );
      continue;
    }
  }
  flushLogos();

  const kept: ServiceSection[] = [];
  for (const s of sections) {
    if (s.blocks.length === 0 && s.step === null && s.title.length <= 24) {
      tags.push(s.title);
    } else {
      kept.push(s);
    }
  }
  kept.forEach((s, i) => {
    s.id = `s${i + 1}`;
  });

  const numbered = kept.length >= 2 && kept.every((s) => s.step !== null);

  return { tagline, lead, sections: kept, tags, numbered };
}
