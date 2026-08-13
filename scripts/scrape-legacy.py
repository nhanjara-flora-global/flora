"""Scrape the legacy WordPress site into JSON + local images.

Run with the old site served locally:
    python3 scripts/scrape-legacy.py http://127.0.0.1:8080
"""

import json
import os
import re
import sys
import urllib.parse
import urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8080").rstrip("/")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "public", "images", "wp")
OUT = os.path.join(ROOT, "src", "lib", "data", "wp-content.json")

PAGES = ["about-us", "contact"]

SERVICES = [
    "premium-agricultural-inputs-the-japanese-foundation",
    "strategic-sourcing-procurement-your-bridge-to-vietnam",
    "the-export-logistic-chain-precision-velocity-thermal-integrity",
    "farming-precision-cultivation-the-honey-no-9-legacy",
    "organic-certification-global-compliance-solutions",
]

POSTS = [
    "viet-nam-thuc-day-nong-nghiep-huu-co-tu-hoi-nghi-isop-2025",
    "dien-tich-nong-nghiep-huu-co-toan-cau-dat-gan-99-trieu-ha",
    "5-xu-huong-nong-nghiep-moi-2025",
    "thi-truong-thuc-pham-huu-co-toan-cau-tang-truong-manh",
    "bat-kip-xu-huong-huu-co-huong-di-ben-vung-cho-nen-nong-nghiep-viet-nam",
    "thong-ke-thuc-trang-nong-nghiep-huu-co-tren-the-gioi",
    "ceo-le-thi-thuy-hoa-va-khat-vong-cung-nong-dan-hien-thuc-hoa-nong-nghiep-organic",
    "nong-san-huu-co-chiem-uu-the-vuot-troi",
    "viet-nam-day-manh-phat-trien-nong-nghiep-huu-co",
    "xuat-khau-nong-san-huu-co-xu-the-co-hoi-va-thach-thuc-nhin-tu-mat-hang-dieu-huu-co",
]

CATEGORIES = {
    "news": [
        "viet-nam-thuc-day-nong-nghiep-huu-co-tu-hoi-nghi-isop-2025",
        "dien-tich-nong-nghiep-huu-co-toan-cau-dat-gan-99-trieu-ha",
        "5-xu-huong-nong-nghiep-moi-2025",
        "thi-truong-thuc-pham-huu-co-toan-cau-tang-truong-manh",
        "bat-kip-xu-huong-huu-co-huong-di-ben-vung-cho-nen-nong-nghiep-viet-nam",
    ],
    "press": [
        "ceo-le-thi-thuy-hoa-va-khat-vong-cung-nong-dan-hien-thuc-hoa-nong-nghiep-organic",
    ],
    "market-information": [
        "thong-ke-thuc-trang-nong-nghiep-huu-co-tren-the-gioi",
        "nong-san-huu-co-chiem-uu-the-vuot-troi",
        "viet-nam-day-manh-phat-trien-nong-nghiep-huu-co",
        "xuat-khau-nong-san-huu-co-xu-the-co-hoi-va-thach-thuc-nhin-tu-mat-hang-dieu-huu-co",
    ],
}


def fetch(path: str) -> str:
    url = f"{BASE}/{path.lstrip('/')}"
    with urllib.request.urlopen(url, timeout=30) as resp:
        return resp.read().decode("utf-8", "replace")


def download_image(src: str) -> str | None:
    """Download an upload into public/images/wp and return the public path."""
    if not src or src.startswith("data:"):
        return None
    if "/wp-content/uploads/" not in src:
        return None
    rel = src.split("/wp-content/uploads/", 1)[1].split("?")[0]
    # Skip WordPress generated size variants.
    rel = re.sub(r"-\d+x\d+(\.[a-z]+)$", r"\1", rel, flags=re.I)
    name = urllib.parse.unquote(rel.replace("/", "_"))
    dest = os.path.join(IMG_DIR, name)
    public = f"/images/wp/{name}"
    if os.path.exists(dest):
        return public
    url = f"{BASE}/wp-content/uploads/{rel}"
    try:
        with urllib.request.urlopen(url, timeout=60) as resp:
            data = resp.read()
    except Exception as exc:  # noqa: BLE001 - best effort scraper
        print(f"  ! image failed {rel}: {exc}")
        return None
    os.makedirs(IMG_DIR, exist_ok=True)
    with open(dest, "wb") as fh:
        fh.write(data)
    return public


TAG_WHITELIST = r"p|h2|h3|h4|ul|ol|li|strong|b|em|i|br|blockquote|figure|figcaption|img|a|table|thead|tbody|tr|td|th"


def clean_html(fragment: str) -> str:
    """Keep semantic markup, drop WP/Flatsome chrome, localise image sources."""
    html = re.sub(r"<(script|style|noscript|form|iframe)[\s\S]*?</\1>", "", fragment, flags=re.I)
    html = re.sub(r"<!--[\s\S]*?-->", "", html)

    def fix_img(match: re.Match[str]) -> str:
        tag = match.group(0)
        src = re.search(r'data-src="([^"]+)"', tag) or re.search(r'src="([^"]+)"', tag)
        if not src:
            return ""
        local = download_image(src.group(1))
        if not local:
            return ""
        alt = re.search(r'alt="([^"]*)"', tag)
        return f'<img src="{local}" alt="{alt.group(1) if alt else ""}" loading="lazy" />'

    html = re.sub(r"<img[^>]*>", fix_img, html, flags=re.I)
    html = re.sub(r"\s(class|id|style|data-[\w-]+|srcset|sizes|width|height)=\"[^\"]*\"", "", html, flags=re.I)
    html = re.sub(rf"</?(?!(?:{TAG_WHITELIST})\b)[a-z][^>]*>", "", html, flags=re.I)
    html = re.sub(r"<p>\s*(&nbsp;)?\s*</p>", "", html, flags=re.I)
    html = re.sub(r"\n{3,}", "\n\n", html)
    return html.strip()


def text_of(fragment: str) -> str:
    txt = re.sub(r"<[^>]+>", " ", fragment)
    txt = (
        txt.replace("&nbsp;", " ")
        .replace("&amp;", "&")
        .replace("&#8217;", "’")
        .replace("&#8220;", "“")
        .replace("&#8221;", "”")
        .replace("&#8211;", "–")
    )
    return re.sub(r"\s+", " ", txt).strip()


def extract_article(html: str) -> dict:
    title = ""
    tm = re.search(r"<h1[^>]*>([\s\S]*?)</h1>", html, re.I)
    if tm:
        title = text_of(tm.group(1))
    if not title:
        tm = re.search(r"<title>([^<]+)</title>", html, re.I)
        title = tm.group(1).split("|")[0].strip() if tm else ""

    body = ""
    for pattern in (
        r'<div class="entry-content[^"]*">([\s\S]*?)<div class="[^"]*(?:entry-meta|blog-share|post-footer)',
        r"<article[^>]*>([\s\S]*?)</article>",
        r"<main[^>]*>([\s\S]*?)</main>",
    ):
        bm = re.search(pattern, html, re.I)
        if bm:
            body = bm.group(1)
            break

    body = re.sub(r'<aside[\s\S]*?</aside>', "", body, flags=re.I)
    body = re.sub(r"<h1[^>]*>[\s\S]*?</h1>", "", body, flags=re.I, count=1)

    date = ""
    dm = re.search(r'<time[^>]*datetime="([^"]+)"', html, re.I) or re.search(
        r"Posted on\s*(\d{2}/\d{2}/\d{4})", text_of(html)
    )
    if dm:
        date = dm.group(1)

    cover = None
    om = re.search(r'property="og:image"\s+content="([^"]+)"', html, re.I)
    if om:
        cover = download_image(om.group(1))
    if not cover:
        im = re.search(r"<img[^>]+/wp-content/uploads/[^>]*>", body, re.I)
        if im:
            src = re.search(r'data-src="([^"]+)"', im.group(0)) or re.search(r'src="([^"]+)"', im.group(0))
            if src:
                cover = download_image(src.group(1))

    content = clean_html(body)
    plain = text_of(content)
    return {
        "title": title,
        "date": date,
        "cover": cover,
        "content": content,
        "excerpt": plain[:220] + ("…" if len(plain) > 220 else ""),
    }


def main() -> None:
    os.makedirs(IMG_DIR, exist_ok=True)
    data: dict = {"home": {}, "pages": {}, "services": {}, "posts": {}, "categories": CATEGORIES}

    print("home")
    home = fetch("/")
    home_main = re.search(r"<main[^>]*>([\s\S]*?)</main>", home, re.I)
    home_imgs = []
    for m in re.finditer(r"<img[^>]*>", home, re.I):
        src = re.search(r'data-src="([^"]+)"', m.group(0)) or re.search(r'src="([^"]+)"', m.group(0))
        if src:
            local = download_image(src.group(1))
            if local and local not in home_imgs:
                home_imgs.append(local)
    data["home"] = {
        "images": home_imgs,
        "content": clean_html(home_main.group(1)) if home_main else "",
    }

    for slug in PAGES:
        print("page", slug)
        data["pages"][slug] = extract_article(fetch(f"/{slug}/"))

    for slug in SERVICES:
        print("service", slug)
        data["services"][slug] = extract_article(fetch(f"/{slug}/"))

    for slug in POSTS:
        print("post", slug)
        data["posts"][slug] = extract_article(fetch(f"/{slug}/"))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
    print("wrote", OUT)


if __name__ == "__main__":
    main()
