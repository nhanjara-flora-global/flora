# Flora Global — Next.js + Supabase

Shop hữu cơ Flora Global, migrate từ WordPress/WooCommerce sang **Next.js (App Router) + Supabase + Vercel**.

## Chạy local

```bash
cd /home/n/Documents/FCP-2
npm install
npm run dev
```

Mở http://localhost:3000

Mặc định `DATA_SOURCE=local` — dùng seed sản phẩm từ SQL dump (không cần Supabase).

## Kết nối Supabase

1. Tạo project trên [supabase.com](https://supabase.com)
2. Chạy `supabase/schema.sql` rồi `supabase/seed.sql` trong SQL Editor
3. Copy `.env.example` → `.env.local` và điền:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATA_SOURCE=supabase
```

## Deploy Vercel

- Import repo `FCP-2`
- Thêm env vars như trên
- Deploy

## Nguồn dữ liệu WordPress

- Source PHP: `/home/n/Downloads/source`
- SQL dump: `/home/n/Downloads/database.sql` (`floradbname`, prefix `wpdg_`)
- Dump thiếu nhiều `post_content` (phpMyAdmin cắt dòng dài) nhưng còn Yoast + `wc_product_meta_lookup` → 4 sản phẩm đã seed

## Routes

| Path | Mô tả |
|------|--------|
| `/` | Home |
| `/products` | Catalog |
| `/products/[slug]` | Chi tiết SP |
| `/cart` | Giỏ hàng |
| `/checkout` | Đặt hàng (COD / CK) |
| `/about-us` | Giới thiệu |
| `/contact` | Form liên hệ |

## Tự động đăng bài News mỗi ngày

GitHub Action [`daily-news.yml`](.github/workflows/daily-news.yml) chạy 07:00 (giờ VN) mỗi ngày:

1. `scripts/generate-daily-post.mjs` gọi Claude viết 1 bài tiếng Việt (kiến thức/phân tích,
   evergreen — không phải tin thời sự, có ràng buộc không bịa số liệu/ngày tháng/nhân vật).
2. Dịch bài sang `en/zh/ko/hi/si`.
3. Ghi vào `src/lib/data/wp-content.json` + `src/lib/i18n/content/news-cache.json`
   + log `scripts/data/auto-post-log.json`.
4. Commit & push → Vercel tự build lại → bài lên sóng.

**Cần bật:** thêm secret `ANTHROPIC_API_KEY` trong repo Settings → Secrets → Actions.
Tuỳ chọn: biến `NEWS_MODEL` (mặc định `claude-opus-5`, có thể để `claude-sonnet-5` cho rẻ hơn).

Chạy tay / thử: Actions → *Daily auto news* → Run workflow (tích *dry_run* để không commit),
hoặc local: `ANTHROPIC_API_KEY=... npm run news:generate` (thêm `DRY_RUN=1` để xem trước).

## Việc tiếp theo

- [ ] Admin CMS (Supabase Studio hoặc admin Next.js)
- [ ] VNPay / MoMo webhook
- [ ] Upload ảnh lên Supabase Storage
- [ ] Migrate blog posts từ SQL/Yoast
- [ ] Redirect 301 URL cũ
