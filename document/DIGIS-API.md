# Cổng API nội dung DIGIS — `/api/digis/v1`

DIGIS (đơn vị vận hành nội dung) dùng cổng này để đăng bài Kiến thức song ngữ mỗi ngày.
Mã: `src/lib/digis-api.ts`, `src/lib/digis-bai.ts`, `src/app/api/digis/v1/**`.

## Giới hạn
- Chỉ chạm bảng `posts` và bucket ảnh `post-images`. **Không có lệnh xoá.** Không đọc / ghi đơn hàng, liên hệ, người dùng, cài đặt.
- Bài đi qua đúng các hàm của /admin: `cleanBlocks` + `blocksToHtml`, "Kiểm tra trước khi đăng" (`postChecks`), `slugify`, chuyên mục.
- Bài DIGIS hiện trong /admin như bài thường — Flora xem, sửa, gỡ được.
- Bản tiếng Anh do DIGIS viết, lưu ở `translations.en`. Bấm **Lưu** một bài **đã đăng** trong /admin sẽ dịch máy lại và ghi đè bản này.

## Xác thực
`Authorization: Bearer <token>`. Web chỉ giữ **mã băm SHA-256** của token: biến môi trường Vercel
`DIGIS_API_TOKEN_SHA256` (ưu tiên) hoặc `HASH_MAC_DINH` trong `src/lib/digis-api.ts`. Đổi token = đổi mã băm.

## Endpoint
| Phương thức | Đường dẫn | Việc |
|---|---|---|
| GET | `/suc-khoe` | Cổng còn chạy, đọc được Supabase, số bài đã đăng |
| GET | `/chuyen-muc` | Chuyên mục (slug, tên vi/en) |
| GET | `/san-pham` | Sản phẩm đang bán (tên, mô tả ngắn, link) — chỉ đọc |
| GET | `/bai?tu=&den=&trang_thai=&trang=&day_du=1` | Danh sách bài, 100 bài/trang |
| POST | `/bai` | Tạo **nháp**: `{chuyen_muc, anh_bia?, slug?, vi:{tieu_de, mo_ta_ngan, khoi[], seo_title?, seo_description?}, en?:{tieu_de, mo_ta_ngan, khoi[]}}` |
| GET | `/bai/{id}` | Một bài, cả 2 bản + kết quả kiểm tra |
| PUT | `/bai/{id}` | Sửa một phần (gửi trường cần đổi) |
| POST | `/bai/{id}/len-lich` | `{published_at: ISO \| "ngay"}` — cần đủ bản en |
| POST | `/bai/{id}/ve-nhap` | Gỡ khỏi trang công khai, giữ dữ liệu |
| POST | `/anh` | multipart `file` (≤ 4MB) → `{url}` trong bucket `post-images` |

`khoi` = mảng khối đúng định dạng trình soạn /admin (`PostBlock` trong `src/lib/post-blocks.ts`).
Lỗi: `{loi, chi_tiet, truong?}` với mã HTTP 400 / 401 / 404 / 409 / 413 / 422 / 500 / 503.

## Robot cũ
Lịch chạy hằng ngày của `.github/workflows/daily-news.yml` đã tắt (25/11/2026), vẫn chạy tay được.
