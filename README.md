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
4. Ô **Nội dung** là trình soạn thảo trực quan **Plate.js** (Slate): dán thẳng từ
   Word / Google Docs giữ nguyên định dạng. Thanh công cụ: đậm/nghiêng/gạch chân/
   gạch ngang, sub/sup, H2-H3, danh sách, trích dẫn, liên kết, **màu chữ + bút
   dạ**, **canh lề**, **font + cỡ chữ**, **bảng**, IN HOA. Nút 🖼 chèn ảnh: **tải
   lên** (lưu vào Supabase Storage) hoặc **dán URL ngoài**.
   Nút **Tải lên** ở ô Ảnh bìa dùng chung kho ảnh đó.
   Nội dung vẫn lưu dạng HTML (`posts.content`) — Plate serialize khi lưu,
   deserialize khi mở lại (xem `src/lib/admin/plate-serialize.ts`).

### Thêm bài hàng loạt (seed, không cần Supabase)

1. Soạn bài trong `scripts/data/seed-articles.mjs` (`{ category, title, excerpt, content }`).
2. `node scripts/seed-news.mjs` — trộn vào `wp-content.json`, tự tạo slug, rải ngày
   đăng cách nhau 2 ngày (bài mới nhất = hôm nay), `cover: null`.
3. `node scripts/translate-news.mjs` — dịch bài mới sang 5 thứ tiếng (idempotent).
4. Ảnh cover: sửa `"cover"` của bài trong `wp-content.json` thành đường dẫn `/images/...`.

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

## Trang quản trị `/admin`

Đăng nhập bằng `ADMIN_USERNAME` + `ADMIN_PASSWORD` (dev để trống thì mặc định
`admin`/`admin`; **production bắt buộc đặt `ADMIN_PASSWORD`**, thiếu là khoá đăng
nhập chứ không rơi về mặc định). Phiên là cookie ký HMAC bằng `ADMIN_SECRET`, tự
hết hạn sau 7 ngày — đổi `ADMIN_SECRET` là đăng xuất toàn bộ phiên đang mở.

| Path | Nội dung |
|------|----------|
| `/admin` | KPI doanh thu 30 ngày, đơn theo trạng thái, đơn & liên hệ mới nhất |
| `/admin/posts` | CMS bài viết: viết, sửa, đăng/ẩn, xoá, dịch lại 5 ngôn ngữ |
| `/admin/orders` | Lọc theo trạng thái, tìm theo mã/tên/email/SĐT, phân trang 20 dòng |
| `/admin/orders/[id]` | Dòng hàng, thông tin khách, địa chỉ, ghi chú + cập nhật trạng thái đơn/thanh toán |
| `/admin/products` | Thêm / sửa / đăng-ẩn / xoá sản phẩm, gán chuyên mục; xem cả `draft`/`archived` (storefront chỉ thấy `published`) |
| `/admin/contacts` | Submission form liên hệ, tìm kiếm + phân trang |

Đơn hàng, liên hệ và CMS bài viết chỉ có dữ liệu khi `DATA_SOURCE=supabase`; ở chế
độ `local` mỗi trang hiện banner nhắc bật Supabase.

## Đồng bộ bài viết seed lên Supabase

`src/lib/data/wp-content.json` + `news-cache.json` là nguồn bài seed. Để đẩy chúng
vào bảng `posts` (kèm `category`, `source_locale`, `translations` — đúng shape
`src/lib/news.ts` đọc), upsert theo `slug`:

```bash
npm run posts:sync          # DRY_RUN=1 npm run posts:sync để xem trước
```

Cần chạy `supabase/migrations/0001_news_posts.sql` trước. Lưu ý script lấy file JSON
làm chuẩn — bài đã sửa trong `/admin` sẽ bị ghi đè nếu trùng slug.

## Việc tiếp theo

- [x] Admin CMS (dashboard Next.js tại `/admin`)
- [ ] VNPay / MoMo webhook
- [x] Upload ảnh lên Supabase Storage
- [ ] Migrate blog posts từ SQL/Yoast
- [ ] Redirect 301 URL cũ
