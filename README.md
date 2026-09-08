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

Tin tức đến từ 2 nguồn, gộp lại (Supabase ghi đè seed nếu trùng slug):

- **Seed** (luôn có): `src/lib/data/wp-content.json` (`posts` + `categories`)
  + `src/lib/i18n/content/news-cache.json` (bản dịch en/zh/ko/hi/si).
- **Supabase** (khi `DATA_SOURCE=supabase`): bảng `posts`, quản lý qua `/admin`.

5 category: `canh-tac-huu-co`, `chung-nhan-tieu-chuan`, `xuat-khau-logistics`,
`thi-truong-xu-huong`, `goc-nhin-flora` (trong `src/lib/legacy.ts` + 6 file dictionary).
Trang news dùng `revalidate = 300` (làm mới sau ~5 phút; đăng từ admin thì revalidate ngay).

### Đăng bài từ admin

1. Chạy `supabase/schema.sql` → `supabase/migrations/0001_news_posts.sql` →
   `supabase/migrations/0002_post_images_storage.sql` trên Supabase.
   (0002 tạo bucket công khai `post-images` để upload ảnh.)
2. Đặt `DATA_SOURCE=supabase` + các key Supabase trong env (Vercel).
3. `/admin` → **Bài viết** → **Viết bài mới**. Viết tiếng Việt; bấm **Đăng bài** →
   hệ thống tự dịch sang 5 ngôn ngữ (Google Translate free) rồi publish.
   **Lưu nháp** để lưu mà chưa hiện ra web. Trang sửa có nút **Dịch lại**.
4. Ô **Nội dung** là trình soạn thảo trực quan (TipTap): dán thẳng từ Word /
   Google Docs giữ nguyên định dạng; thanh công cụ có đậm/nghiêng/IN HOA/H2-H3/
   danh sách/trích dẫn/liên kết. Nút 🖼 chèn ảnh: **tải lên** (lưu vào Supabase
   Storage) hoặc **dán URL ngoài**; kéo-thả hoặc dán ảnh vào editor cũng tự upload.
   Nút **Tải lên** ở ô Ảnh bìa dùng chung kho ảnh đó.

### Thêm bài hàng loạt (seed, không cần Supabase)

1. Soạn bài trong `scripts/data/seed-articles.mjs` (`{ category, title, excerpt, content }`).
2. `node scripts/seed-news.mjs` — trộn vào `wp-content.json`, tự tạo slug, rải ngày
   đăng cách nhau 2 ngày (bài mới nhất = hôm nay), `cover: null`.
3. `node scripts/translate-news.mjs` — dịch bài mới sang 5 thứ tiếng (idempotent).
4. Ảnh cover: sửa `"cover"` của bài trong `wp-content.json` thành đường dẫn `/images/...`.

## Việc tiếp theo

- [x] Admin CMS (Supabase Studio hoặc admin Next.js)
- [ ] VNPay / MoMo webhook
- [x] Upload ảnh lên Supabase Storage
- [ ] Migrate blog posts từ SQL/Yoast
- [ ] Redirect 301 URL cũ
