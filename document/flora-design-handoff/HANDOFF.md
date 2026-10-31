# Flora Global – Design handoff (giao diện kiểu báo điện tử)

Tài liệu này đi kèm 4 trang HTML tĩnh trong thư mục `pages/`. Mở trực tiếp bằng trình duyệt để xem. Đây là **bản thiết kế tham chiếu**, không phải code production: HTML dùng inline style để giữ đúng pixel, khi code thật cần tách thành component và token.

## Gợi ý câu lệnh cho Claude Code

> Đọc `HANDOFF.md` và các file trong `pages/`. Dựng lại giao diện này trong codebase Next.js hiện tại của flora-global.vn: tách thành component dùng chung, đưa màu và font vào design token, giữ nguyên cấu trúc route và nội dung song ngữ VI/EN đang có. Bắt đầu với Header, Footer, AdSlot, ArticleCard rồi đến trang chủ.

## Bối cảnh

- Website hiện tại: https://flora-global.vn (Next.js, có `/en` và tiếng Việt, ảnh qua `next/image`).
- Mục tiêu: chuyển sang bố cục kiểu báo điện tử (tham khảo BBC News) nhưng giữ thương hiệu Flora. **Không dùng logo, tên, font hay màu nhận diện của BBC.**
- Ngành: xuất khẩu nông sản, chứng nhận hữu cơ, phân bón và thuốc bảo vệ thực vật.

## Các trang

| File | Route đề xuất | Mẫu tham khảo |
|---|---|---|
| `pages/trang-chu.html` | `/` | BBC Home |
| `pages/kien-thuc-phan-bon.html` | `/knowledge/category/[slug]` | BBC Sport/Tennis, Health |
| `pages/bai-viet.html` | `/knowledge/[slug]` | BBC Article |
| `pages/video.html` | `/video` (mới) | BBC Video |

Route giải pháp, sản phẩm, hệ sinh thái giữ nguyên như site hiện tại, chỉ áp dụng Header/Footer mới và token màu.

## Design tokens

### Màu
| Token | Giá trị | Dùng cho |
|---|---|---|
| `--color-primary` | `#1F5E3B` | Màu chủ đạo: nhãn chuyên mục, số "Đọc nhiều nhất", dải chuyên mục, nút chính |
| `--color-harvest` | `#A3541A` | Màu nhấn: nút "Khám phá/Nhận báo giá", viền khối nổi bật |
| `--color-logo` | `#1E4E8C` | Chỉ cho logo (thay bằng mã chính xác từ file logo) |
| `--color-ink` | `#141414` | Chữ chính, đường kẻ đầu khối, nút đen |
| `--color-ink-2` | `#3A3A3A` | Mô tả bài |
| `--color-muted` | `#5A5A5A` | Ngày, chuyên mục (meta) |
| `--color-rule` | `#E3E3E3` | Đường kẻ mảnh giữa các tin |
| `--color-ad-bg` | `#F2F2F2` | Nền dải quảng cáo |
| `--color-dark` | `#12301F` | Khối nền tối (Chứng nhận, Câu chuyện vùng trồng) |
| `--color-dark-2` | `#0E2418` | Footer |
| `--color-video-bg` | `#0D1A12` | Nền trang Video |
| `--color-cream` | `#FBF3E6` | Nền ô quảng cáo sáng, hộp "Sản phẩm liên quan" |
| `--color-on-dark-muted` | `#A9B8AD` / `#CFDAD2` | Chữ phụ trên nền tối |

Mọi cặp chữ/nền đã chọn để đạt tương phản tối thiểu 4.5:1.

### Chữ
- **Be Vietnam Pro** (400/500/600/700/800): giao diện, menu, nhãn, mô tả, meta.
- **Noto Serif** (600/700): toàn bộ tiêu đề bài viết và thân bài trang chi tiết.
- Cả hai từ Google Fonts, hỗ trợ đầy đủ dấu tiếng Việt. Dùng `next/font/google`.

| Vai trò | Font | Cỡ / dòng | Đậm |
|---|---|---|---|
| Tiêu đề tin lớn (lead) | Noto Serif | 30px / 1.2 | 700 |
| H1 bài viết | Noto Serif | 38px / 1.18 | 700 |
| Tiêu đề tin vừa | Noto Serif | 17–20px / 1.3 | 700 |
| Tiêu đề tin nhỏ, danh sách | Noto Serif | 14–16px / 1.35 | 700 |
| Thân bài | Noto Serif | 18px / 1.7 | 400 |
| Mô tả | Be Vietnam Pro | 13–15px / 1.5 | 400 |
| Meta (ngày, chuyên mục) | Be Vietnam Pro | 12px | 400 |
| Nhãn khối ("TIN MỚI ›") | Be Vietnam Pro | 13px, chữ hoa, letter-spacing 0.4px | 700 |
| Menu chính | Be Vietnam Pro | 13px | 400, mục đang chọn 700 |

### Khoảng cách và bố cục
- Khung nội dung: `max-width: 1280px`, lề ngang 16px. Trang bài viết: khung 1100px, cột bài tối đa 680px, cột phải 300px.
- Khoảng cách giữa các khối: 36–40px. Giữa các thẻ trong lưới: 16–24px.
- Không bo góc (radius 0) ở toàn bộ thẻ, ảnh, nút, đúng phong cách báo.
- Ảnh: 16:9 cho tin, 1:1 cho sản phẩm, 21:9 cho thẻ bản tin.

## Component cần dựng

1. **Header**: hàng trên chia 3 (menu + tìm kiếm | logo giữa | nút Liên hệ + VI/EN), hàng dưới là menu chính căn giữa, gạch chân 3px mục đang chọn. Nên dính (sticky) khi cuộn.
2. **CategoryBand**: dải màu primary với tên chuyên mục lớn + menu con, bên dưới là dải đen chứa link chủ đề con.
3. **SectionHeader**: đường kẻ trên 1px màu ink + nhãn chữ hoa có `›`, tùy chọn nút ‹ › cho carousel.
4. **ArticleCard** với các biến thể: `lead` (ảnh lớn), `standard` (ảnh + tiêu đề + mô tả + meta), `compact` (chỉ chữ), `thumb-side` (ảnh nhỏ bên cạnh), `list-row` (ngày trái, chữ giữa, ảnh phải).
5. **TopStories**: 3 cột (2 tin có ảnh | tin lead | danh sách chữ), xuống 1 cột trên điện thoại.
6. **Carousel**: hàng cuộn ngang (sản phẩm, video) với nút ‹ ›.
7. **DarkBand**: khối nền tối cho tin nổi bật hoặc carousel.
8. **FeatureBlock**: ảnh lớn bên trái + chữ bên phải trên nền tối.
9. **MostRead**: danh sách đánh số 1–10, số to màu primary, 2 cột trên desktop.
10. **CategoryColumns**: 4 cột, mỗi cột có nhãn, ảnh, tin chính và 3 link.
11. **VideoCard**: ảnh 16:9 + nút phát vuông trắng ở góc dưới trái.
12. **AdSlot**: dải nền `#F2F2F2`, nhãn "QUẢNG CÁO" 11px căn giữa, ô quảng cáo bên trong. Kích thước chuẩn: `970x250` (billboard), `728x90` (leaderboard), `300x250` (MPU), `300x600` (half-page, cột phải bài viết). Nội dung ô lấy từ CMS để tự quảng cáo sản phẩm/dịch vụ Flora, sau này có thể thay bằng Google AdSense mà không đổi bố cục. Ô phải giữ chiều cao cố định để tránh nhảy trang (CLS).
13. **NewsletterSignup**: ô email có `<label>` + nút Đăng ký (cần nối dịch vụ gửi email).
14. **RelatedProduct**: hộp nền cream, viền trên màu harvest, dùng chèn trong bài viết.
15. **Pagination**, **Breadcrumb**, **TagList**, **Footer**.

## Vị trí quảng cáo

| Trang | Vị trí | Kích thước |
|---|---|---|
| Trang chủ | Trên header | 970x250 |
| Trang chủ | Sau tin nổi bật | 728x90 |
| Trang chủ | Trước khối Sản phẩm | 2 × 300x250 |
| Trang chủ | Trước Đọc nhiều nhất | Dải bản tin 970 |
| Trang chủ | Trước footer | 970 |
| Chuyên mục | Dưới dải chuyên mục | 728x90 |
| Chuyên mục | Sau tin nổi bật | 300x250 |
| Chuyên mục | Giữa danh sách Mới nhất | 728x90 |
| Bài viết | Dưới header | 970x250 |
| Bài viết | Giữa thân bài | 300x250 |
| Bài viết | Cột phải | 300x600 + 300x250 |
| Video | Giữa trang | 970 |

## Responsive

- **≥ 1024px**: bố cục như bản thiết kế.
- **768–1023px**: lưới 4 cột thành 2 cột, TopStories thành 2 hàng (lead trên cùng).
- **< 768px**: một cột, menu chính cuộn ngang hoặc gom vào nút menu, carousel cuộn bằng tay, cột phải bài viết xuống dưới bài. Vùng bấm tối thiểu 44×44px.
- Bản thiết kế đã dùng flex-wrap/grid `auto-fit` nên tự xếp chồng; khi code thật nên đặt breakpoint rõ ràng.

## Dữ liệu và nội dung

- **Ảnh**: tất cả là khung giữ chỗ màu. Dùng ảnh thật từ `/images/...` của site hiện tại (ví dụ `hero-greenhouse.jpg`, `2026_03_ELITE.jpg`, `2026_03_PRECISION-GROWING.jpg`, `2025_09_tuvanthietke.jpg`, `2025_09_quanlyduan.jpg`, `2025_09_thuyhoa.jpg`).
- **Bài viết**: chỉ 3 bài là thật (Phân bón hữu cơ là gì…, Xuất khẩu không chỉ là bán hàng…, Minh bạch chuỗi cung ứng…). Các tiêu đề và mốc thời gian còn lại là **nội dung mẫu để xem bố cục**, không đưa lên production. Trang chủ và chuyên mục phải lấy bài từ CMS và tự ẩn khối khi không đủ bài.
- **Nhãn chuyên mục** của 3 bài thật là gán tạm, cần kiểm tra lại.
- Các chỗ trong ngoặc vuông (ví dụ `[Tên kỹ sư nông nghiệp]`) và câu trích dẫn mẫu trong trang bài viết phải thay bằng thông tin thật.
- Logo đang là chữ "Flora Global" tạm thời, thay bằng file logo gốc (`/images/wp/2025_08_logo.png`) và lấy đúng mã màu xanh dương.
- Thời gian tương đối ("2 giờ trước") nên tính từ ngày đăng thật.

## Khả năng truy cập (giữ khi code)

- Dùng thẻ ngữ nghĩa: `header`, `nav` có `aria-label`, `main`, `article`, `aside` cho quảng cáo, `footer`.
- Nút chỉ có icon phải có `aria-label`. Icon trang trí có `aria-hidden="true"`.
- Mọi ảnh thật cần `alt` mô tả.
- Trang chuyển ngôn ngữ phải cập nhật `lang` của `<html>`.
