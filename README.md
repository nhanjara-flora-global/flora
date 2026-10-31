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

Chuyên mục sửa ở `/admin/post-categories` (bảng `post_categories`, xem mục bên dưới).
Mặc định 5 chuyên mục: `canh-tac-huu-co`, `chung-nhan-tieu-chuan`, `xuat-khau-logistics`,
`thi-truong-xu-huong`, `goc-nhin-flora` (`NEWS_CATEGORIES` trong `src/lib/legacy.ts` + dictionary).
Trang news dùng `revalidate = 300` (làm mới sau ~5 phút; đăng từ admin thì revalidate ngay).

### Đăng bài từ admin

1. Chạy `supabase/schema.sql` → `0001_news_posts.sql` → `0002_post_images_storage.sql`
   → `0003_seed_product_descriptions.sql` → `0004_site_content.sql` → `0005_post_categories.sql`
   (trong `supabase/migrations/`) trên Supabase.
   (0002 tạo bucket công khai `post-images`; 0003 backfill mô tả 4 sản phẩm seed.)
2. Đặt `DATA_SOURCE=supabase` + các key Supabase trong env (Vercel).
3. `/admin` → **Bài viết** → **+ Viết bài**. Trình soạn 2 cột (theo mẫu admin Cây Cảnh
   Miền Tây): bên trái tiêu đề / đoạn dẫn / nội dung, bên phải các khung **Xuất bản**
   (chuyên mục, lịch đăng), **Ảnh bìa**, **Bản dịch**, **SEO & đường dẫn** (xem trước
   kết quả Google) và **Kiểm tra trước khi đăng** — mục *bắt buộc* chưa đạt thì không
   đăng được (server kiểm lại y hệt, `src/lib/admin/posts.ts`).
   - Viết tiếng Việt; **Đăng bài** / **Cập nhật** tự dịch máy sang các ngôn ngữ còn lại.
     **Lưu nháp** lưu mà chưa hiện ra web; bài đã đăng có **Gỡ bài** (về nháp) và **Xoá**.
   - **Lịch đăng** ở tương lai → nút thành **Lên lịch đăng**; bài tự hiện khi tới giờ
     (trễ tối đa ~5 phút do `revalidate = 300`).
   - **Xem trước ↗** (bài nháp / lên lịch) mở bài trên web qua Draft Mode
     (`/admin/preview?id=…`, chỉ admin đã đăng nhập); thanh vàng cuối trang để thoát.
   - Đường dẫn sửa được khi bài chưa đăng; bài đã đăng giữ nguyên link.
   - Ảnh (bìa + trong bài) được nén ở trình duyệt về cạnh dài 1600px trước khi tải lên.
   - Danh sách bài có tab Đã đăng / Lên lịch / Nháp (kèm số bài), tìm theo tiêu đề và lọc
     chuyên mục.
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
| `/admin/post-categories` | Chuyên mục bài viết: thêm, đổi tên vi/en, giới thiệu, sản phẩm liên quan, sắp xếp, xoá (chuyển bài sang mục khác) |
| `/admin/orders` | Lọc theo trạng thái, tìm theo mã/tên/email/SĐT, phân trang 20 dòng |
| `/admin/orders/[id]` | Dòng hàng, thông tin khách, địa chỉ, ghi chú + cập nhật trạng thái đơn/thanh toán |
| `/admin/products` | Thêm / sửa / đăng-ẩn / xoá sản phẩm, gán chuyên mục; xem cả `draft`/`archived` (storefront chỉ thấy `published`) |
| `/admin/contacts` | Submission form liên hệ, tìm kiếm + phân trang |
| `/admin/banners` | Banner trang chủ + trang Video: ảnh, chữ vi/en, link, hẹn ngày hiện |
| `/admin/ads` | 7 mẫu quảng cáo (mỗi mẫu hiện ở nhiều trang): sửa chữ / ảnh / link, tắt, hẹn ngày |
| `/admin/seo` | Mọi trang công khai × ngôn ngữ: SEO đặt tay (tiêu đề, mô tả, ảnh chia sẻ, ẩn khỏi Google) + tab Cảnh báo |

### Banner, quảng cáo, SEO (theo mẫu admin Cây Cảnh Miền Tây)

Cần chạy `supabase/migrations/0004_site_content.sql` (bảng `site_slots` + `seo_overrides`).
Chưa chạy thì web vẫn hiện nội dung mặc định, admin hiện hướng dẫn chạy migration.

- **Nội dung mặc định nằm trong code** (`src/lib/site-slots.ts`: ảnh trong `/public`,
  chữ trong `dictionaries/*.json`); database chỉ giữ phần admin đổi, ô trống = mặc định.
  Thêm ô mới: khai trong `SLOTS` rồi đọc bằng `getSlot(key, lang)` ở trang.
- **Quảng cáo**: `<AdSlot>` / `<AdCreative>` là server component async, admin tắt mẫu
  thì ô biến mất. Ô không kèm nhãn "Quảng cáo". Ngoài khoảng ngày hẹn → nội dung mặc định.
- **SEO đặt tay** áp trong `pageSeo()` (`src/lib/seo.ts`), khoá = đường dẫn có ngôn ngữ
  (`/vi/knowledge`). Tiêu đề đặt tay là tiêu đề đầy đủ (không nối template). "Ẩn khỏi
  Google" = `noindex` + rời `sitemap.xml`. Trang công khai mới nhớ dùng `pageSeo()`.
- Lưu ở admin gọi `revalidatePath("/", "layout")` → cả web làm mới ngay.

### Chuyên mục bài viết

Cần chạy `supabase/migrations/0005_post_categories.sql` (bảng `post_categories`, nạp sẵn 5
chuyên mục, chạy lại vô hại). Chưa chạy / bảng trống / đọc lỗi → web dùng 5 chuyên mục mặc
định trong code, admin hiện hướng dẫn chạy migration.

- Mọi chỗ trên web đọc qua `getNewsCategories()` (`src/lib/news-categories.ts`): menu
  Kiến thức, cột chuyên mục trang chủ, trang `/knowledge/category/[slug]` (giới thiệu hiện
  dưới tiêu đề + làm mô tả SEO), breadcrumb / thẻ chủ đề / hộp **Sản phẩm liên quan** của
  bài, ô chọn chuyên mục khi viết bài, sitemap. Thứ tự trên admin = thứ tự menu.
- Đường dẫn chuyên mục cố định sau khi tạo (đổi tên không đổi link). Tên / giới thiệu tiếng
  Anh để trống thì tự dịch khi lưu; dịch lỗi thì để trống, trang /en dùng tên tiếng Việt.
- Xoá chuyên mục còn bài: phải chọn mục để chuyển bài sang (cập nhật `posts.category`).
  Bài mẫu chỉ có trong `wp-content.json` (chưa sync) thì không xoá được — chạy
  `npm run posts:sync` trước. Lưu ý `posts:sync` lấy chuyên mục trong JSON làm chuẩn, nên
  sync lại sau khi chuyển bài sẽ trả bài mẫu về chuyên mục cũ.
- Nhãn chủ đề của **video** (`src/lib/data/videos.ts`) và tiêu đề khối dịch vụ "Chứng nhận"
  trên trang chủ vẫn lấy từ dictionary — không phải chuyên mục bài.

Đơn hàng, liên hệ và CMS bài viết chỉ có dữ liệu khi `DATA_SOURCE=supabase`; ở chế
độ `local` mỗi trang hiện banner nhắc bật Supabase.

## Đồng bộ bài viết seed lên Supabase

`src/lib/data/wp-content.json` + `news-cache.json` là nguồn bài seed. Để đẩy chúng
vào bảng `posts` (kèm `category`, `source_locale`, `translations` — đúng shape
`src/lib/news.ts` đọc), upsert theo `slug`:

```bash
npm run posts:sync          # DRY_RUN=1 npm run posts:sync để xem trước
ONLY=slug-a,slug-b npm run posts:sync   # chỉ đẩy vài bài, không đụng bài khác
```

Cần chạy `supabase/migrations/0001_news_posts.sql` trước. Lưu ý script lấy file JSON
làm chuẩn — bài đã sửa trong `/admin` sẽ bị ghi đè nếu trùng slug.

## Import nội dung từ voac.vn

`voac.vn` (WordPress + Elementor) là site chị em cùng chủ. `scripts/import-voac.mjs`
kéo nội dung **tiếng Việt làm gốc**:

```bash
npm run import:voac                     # staging: scripts/data/voac-import.json + tải ảnh public/images/voac/
# sửa include / type / slug trong voac-import.json nếu cần
node scripts/import-voac.mjs --apply    # 9 dịch vụ -> wp-content.json ; 3 sản phẩm -> Supabase (draft)
node scripts/import-voac.mjs --translate  # dịch dịch vụ voac -> manual-bundle.json (5 ngôn ngữ)
```

- **Sản phẩm** (Phân gà, Vi sinh vật/Phân bón, Bio-SoilZ) vào `/admin/products` dạng
  nháp, slug `voac-*` — cần `SUPABASE_SERVICE_ROLE_KEY` trong `.env.local`.
- **Dịch vụ** (9 trang) thêm vào 5 dịch vụ hiện có. Gốc **tiếng Việt** →
  `SERVICE_SOURCE_LOCALE` trong `src/lib/legacy.ts`; các ngôn ngữ khác dịch máy
  (badge "machine"). Slug + nhãn đã khai trong `legacy.ts` + 6 file `dictionaries/*.json`.
- `--apply` in ra danh sách slug cần thêm tay vào `SERVICE_ORDER` nếu chạy lại với
  trang mới.

## Việc tiếp theo

- [x] Admin CMS (dashboard Next.js tại `/admin`)
- [ ] VNPay / MoMo webhook
- [x] Upload ảnh lên Supabase Storage
- [ ] Migrate blog posts từ SQL/Yoast
- [ ] Redirect 301 URL cũ
