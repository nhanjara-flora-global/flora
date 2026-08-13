#!/usr/bin/env python3
"""Generate manual + news translation bundles (Google Translate free endpoint).

Usage:
  python3 scripts/translate-content.py
"""

from __future__ import annotations

import html as HTML
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WP = ROOT / "src/lib/data/wp-content.json"
OUT_MANUAL = ROOT / "src/lib/i18n/content/manual-bundle.json"
OUT_NEWS = ROOT / "src/lib/i18n/content/news-cache.json"

TARGET_LOCALES = ["vi", "zh", "ko", "hi", "si"]
GT_CODE = {
    "en": "en",
    "vi": "vi",
    "zh": "zh-CN",
    "ko": "ko",
    "hi": "hi",
    "si": "si",
}

TAG_SPLIT = re.compile(r"(<[^>]+>)")


def detect_source(text: str) -> str:
    return "vi" if re.search(r"[ăâêôơưđĂÂÊÔƠƯĐ]", text) else "en"


def gt_translate(text: str, source: str, target: str) -> str:
    text = text.strip()
    if not text:
        return text
    if not re.search(r"[\w\u0080-\uffff]", text, re.UNICODE):
        return text

    # Keep chunks under ~4000 chars for the free endpoint
    chunks: list[str] = []
    buf = ""
    for sentence in re.split(r"(?<=[\.\!\?\n。！？])\s*", text):
        if not sentence:
            continue
        if len(buf) + len(sentence) + 1 > 3500 and buf:
            chunks.append(buf)
            buf = sentence
        else:
            buf = f"{buf} {sentence}".strip() if buf else sentence
    if buf:
        chunks.append(buf)

    out: list[str] = []
    for chunk in chunks:
        params = urllib.parse.urlencode(
            {
                "client": "gtx",
                "sl": GT_CODE[source],
                "tl": GT_CODE[target],
                "dt": "t",
                "q": chunk,
            }
        )
        url = f"https://translate.googleapis.com/translate_a/single?{params}"
        for attempt in range(4):
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=45) as resp:
                    data = json.load(resp)
                translated = "".join(part[0] for part in (data[0] or []) if part and part[0])
                out.append(HTML.unescape(translated) if translated else chunk)
                break
            except Exception as exc:  # noqa: BLE001
                print(f"  ! gt fail ({attempt}): {exc}")
                time.sleep(1.2 * (attempt + 1))
        else:
            out.append(chunk)
        time.sleep(0.2)
    return " ".join(out)


def translate_html(html: str, source: str, target: str) -> str:
    parts = TAG_SPLIT.split(html)
    result: list[str] = []
    for part in parts:
        if not part:
            continue
        if part.startswith("<") and part.endswith(">"):
            result.append(part)
        elif not part.strip():
            result.append(part)
        else:
            result.append(gt_translate(part, source, target))
    return "".join(result)


def translate_article(title: str, excerpt: str, content: str, source: str, target: str):
    print(f"    → {target} (from {source})")
    return {
        "title": gt_translate(title, source, target),
        "excerpt": gt_translate(excerpt or title, source, target),
        "content": translate_html(content, source, target),
        "sourceLocale": source,
    }


def main() -> None:
    data = json.loads(WP.read_text(encoding="utf-8"))
    manual: dict = {}
    news: dict = {}

    pages = {
        "about-us": data["pages"]["about-us"],
        **data["services"],
    }
    for slug, article in pages.items():
        print("manual", slug)
        manual[slug] = {}
        for locale in TARGET_LOCALES:
            manual[slug][locale] = translate_article(
                article["title"],
                article.get("excerpt") or article["title"],
                article["content"],
                "en",
                locale,
            )

    for slug, article in data["posts"].items():
        print("news", slug)
        news[slug] = {}
        source = detect_source(f"{article['title']}\n{article['content']}")
        targets = [l for l in (TARGET_LOCALES + ["en"]) if l != source]
        for locale in targets:
            news[slug][locale] = translate_article(
                article["title"],
                article.get("excerpt") or article["title"],
                article["content"],
                source,
                locale,
            )

    OUT_MANUAL.parent.mkdir(parents=True, exist_ok=True)
    OUT_MANUAL.write_text(json.dumps(manual, ensure_ascii=False, indent=2), encoding="utf-8")
    OUT_NEWS.write_text(json.dumps(news, ensure_ascii=False, indent=2), encoding="utf-8")
    print("wrote", OUT_MANUAL, "bytes", OUT_MANUAL.stat().st_size)
    print("wrote", OUT_NEWS, "bytes", OUT_NEWS.stat().st_size)


if __name__ == "__main__":
    main()
