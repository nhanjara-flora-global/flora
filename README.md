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

## Bài viết mục News

Nội dung news nằm trong 2 file (chế độ `local`, không cần Supabase):

- `src/lib/data/wp-content.json` — bài gốc tiếng Việt (`posts` + `categories`)
- `src/lib/i18n/content/news-cache.json` — bản dịch en/zh/ko/hi/si (badge "bản dịch máy")

5 category: `canh-tac-huu-co`, `chung-nhan-tieu-chuan`, `xuat-khau-logistics`,
`thi-truong-xu-huong`, `goc-nhin-flora` (đặt trong `src/lib/legacy.ts` + 6 file dictionary).

**Thêm bài hàng loạt:**

1. Soạn bài trong `scripts/data/seed-articles.mjs` (`{ category, title, excerpt, content }`).
2. `node scripts/seed-news.mjs` — trộn vào `wp-content.json`, tự tạo slug, rải ngày
   đăng cách nhau 2 ngày (bài mới nhất = hôm nay), `cover: null` (thêm ảnh sau).
3. `node scripts/translate-news.mjs` — dịch các bài mới sang 5 thứ tiếng qua Google
   Translate (miễn phí, idempotent — chạy lại chỉ dịch phần còn thiếu).
4. Ảnh cover: sửa trực tiếp `"cover"` của bài trong `wp-content.json` thành đường dẫn
   trong `/public/images/...` khi có ảnh.

## Việc tiếp theo

- [ ] Admin CMS (Supabase Studio hoặc admin Next.js)
- [ ] VNPay / MoMo webhook
- [ ] Upload ảnh lên Supabase Storage
- [ ] Migrate blog posts từ SQL/Yoast
- [ ] Redirect 301 URL cũ
