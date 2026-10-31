/**
 * Video trên trang /video và các khối video. Không lưu file video trên site:
 * chỉ giữ ID rồi nhúng từ YouTube / TikTok, nên thêm video không tốn dung lượng.
 *
 * Thêm video mới:
 *  - YouTube: lấy phần sau `v=` trong link (youtube.com/watch?v=XXXXXXXXXXX)
 *    hoặc sau youtu.be/ → `id`. Thumbnail tự lấy từ i.ytimg.com.
 *  - TikTok: lấy dãy số cuối link (tiktok.com/@kenh/video/7123456789012345678)
 *    → `id`, dán cả link vào `url`. TikTok không có link ảnh bìa cố định, nên
 *    điền `thumbnail` nếu muốn có ảnh (link ảnh trực tiếp bất kỳ); không điền
 *    thì hiện khung màu.
 *  - `title` giữ đúng tiêu đề gốc trên nền tảng, `source` là tên kênh đăng.
 *  - Video nào tắt "cho phép nhúng" sẽ không phát được — kiểm tra bằng
 *    https://www.youtube.com/oembed?url=<link video> (trả 200 là nhúng được).
 *
 * Danh sách hiện tại là video công khai của các đài truyền hình (VTV, VTC16,
 * THĐT, Lâm Đồng TV...) đã kiểm tra nhúng được ngày 31/10/2026. Khi Flora có
 * kênh YouTube/TikTok riêng, thay dần bằng video của Flora.
 */

export type VideoPlatform = "youtube" | "tiktok";

/** Trùng slug chuyên mục Kiến thức để dùng chung nhãn đã dịch. */
export type VideoTopic =
  | "canh-tac-huu-co"
  | "chung-nhan-tieu-chuan"
  | "xuat-khau-logistics"
  | "thi-truong-xu-huong";

export type Video = {
  platform: VideoPlatform;
  id: string;
  title: string;
  source: string;
  duration?: string;
  topic: VideoTopic;
  /** "howto" = hướng dẫn kỹ thuật, "report" = phóng sự / bản tin. */
  kind: "howto" | "report";
  /** Ghi đè ảnh bìa (nên có với TikTok). */
  thumbnail?: string;
  /** Link gốc để mở trên nền tảng (nên có với TikTok, vì link xem cần tên kênh). */
  url?: string;
};

export const VIDEOS: Video[] = [
  {
    platform: "youtube",
    id: "MZGNkpPx4l4",
    title: "Xuất khẩu nông sản hữu cơ vào thị trường EU",
    source: "VTV4",
    duration: "7:08",
    topic: "thi-truong-xu-huong",
    kind: "report",
  },
  {
    platform: "youtube",
    id: "nGqGU7yYO-c",
    title: "Kỹ thuật ủ phân hữu cơ bón cho cây trồng",
    source: "VTC16",
    duration: "10:11",
    topic: "canh-tac-huu-co",
    kind: "howto",
  },
  {
    platform: "youtube",
    id: "ww6c_0WlF5Y",
    title: "Làm gì để đạt chứng nhận hữu cơ tại Việt Nam?",
    source: "VTC16",
    duration: "15:21",
    topic: "chung-nhan-tieu-chuan",
    kind: "report",
  },
  {
    platform: "youtube",
    id: "YMYVdc-4XLM",
    title: "Sự lên ngôi của phân bón hữu cơ",
    source: "VTV24",
    duration: "1:38",
    topic: "thi-truong-xu-huong",
    kind: "report",
  },
  {
    platform: "youtube",
    id: "MGT5f3LOr5c",
    title: "Hướng giải quyết cho trái cây tươi xuất khẩu sang Mỹ",
    source: "VTV24",
    duration: "2:22",
    topic: "xuat-khau-logistics",
    kind: "report",
  },
  {
    platform: "youtube",
    id: "j9YZlBUkCns",
    title: "Trồng chanh dây theo hướng sinh học",
    source: "VTC16",
    duration: "10:05",
    topic: "canh-tac-huu-co",
    kind: "report",
  },
  {
    platform: "youtube",
    id: "KF7sfnFlrj0",
    title: "Trồng chanh dây xuất khẩu châu Âu",
    source: "Lâm Đồng TV",
    duration: "1:28",
    topic: "xuat-khau-logistics",
    kind: "report",
  },
  {
    platform: "youtube",
    id: "bTZ68ugeIA8",
    title: "Câu chuyện nhãn hàng nông sản Việt Nam trên thị trường châu Âu",
    source: "VTV24",
    duration: "2:40",
    topic: "thi-truong-xu-huong",
    kind: "report",
  },
  {
    platform: "youtube",
    id: "ziDjFV5SkB4",
    title: "Tăng cường công nghệ bảo quản nông sản, giữ hoa quả tươi lâu gấp nhiều lần",
    source: "VTV24",
    duration: "2:05",
    topic: "xuat-khau-logistics",
    kind: "report",
  },
  {
    platform: "youtube",
    id: "z4IJ2EO9lv0",
    title: "Khoa học công nghệ nâng giá trị xuất khẩu gừng hữu cơ",
    source: "VTV4",
    duration: "2:42",
    topic: "xuat-khau-logistics",
    kind: "report",
  },
  {
    platform: "youtube",
    id: "gOwZkShSjP0",
    title: "Kỹ thuật ủ phân hữu cơ đạt chất lượng",
    source: "Truyền hình Đồng Tháp",
    duration: "5:03",
    topic: "canh-tac-huu-co",
    kind: "howto",
  },
  {
    platform: "youtube",
    id: "B5yMrdn2L08",
    title: "Cách ủ phân chuồng thành phân hữu cơ vi sinh",
    source: "VTC16",
    duration: "9:28",
    topic: "canh-tac-huu-co",
    kind: "howto",
  },
  {
    platform: "youtube",
    id: "A_XCfVT-dHw",
    title: "Các biện pháp quản lý dịch hại tổng hợp (IPM)",
    source: "CropLife Vietnam",
    duration: "2:42",
    topic: "canh-tac-huu-co",
    kind: "howto",
  },
  {
    platform: "youtube",
    id: "ACuvmOH4pwI",
    title: "5 quy tắc vàng: hướng dẫn an toàn khi sử dụng thuốc BVTV",
    source: "VTC16",
    duration: "3:32",
    topic: "canh-tac-huu-co",
    kind: "howto",
  },
  {
    platform: "youtube",
    id: "MmkPP7yWMHw",
    title: "Ủ nấm Trichoderma với phân chuồng",
    source: "VTC16",
    duration: "5:06",
    topic: "canh-tac-huu-co",
    kind: "howto",
  },
  {
    platform: "youtube",
    id: "pU1cYN-V-VE",
    title: "Mẹo ủ phân hữu cơ vi sinh từ phế phụ phẩm nông nghiệp",
    source: "VTC16",
    duration: "5:18",
    topic: "canh-tac-huu-co",
    kind: "howto",
  },
  {
    platform: "youtube",
    id: "TUJ-fJhFiM8",
    title: "Truy xuất nguồn gốc: điểm tựa cho nông sản Việt",
    source: "VTC16",
    duration: "3:34",
    topic: "chung-nhan-tieu-chuan",
    kind: "report",
  },
  {
    platform: "youtube",
    id: "5F9M1FeHF5g",
    title: "Chuẩn hóa kiểm nghiệm nông sản: mở rộng cửa xuất khẩu, giữ chữ tín nông sản Việt",
    source: "VTV24",
    duration: "2:24",
    topic: "chung-nhan-tieu-chuan",
    kind: "report",
  },
  {
    platform: "youtube",
    id: "Q0vbZm9jeQQ",
    title: "Bất cập trong cấp chứng nhận VietGAP, sản xuất hữu cơ gặp khó",
    source: "VTC16",
    duration: "8:38",
    topic: "chung-nhan-tieu-chuan",
    kind: "report",
  },
  {
    platform: "youtube",
    id: "mdP80x8cTuI",
    title: "Truy xuất nguồn gốc cà phê qua mã số vùng trồng",
    source: "VTC16",
    duration: "16:38",
    topic: "chung-nhan-tieu-chuan",
    kind: "report",
  },
];

export function videoById(id: string): Video | undefined {
  return VIDEOS.find((v) => v.id === id);
}

export function videoThumbnail(v: Video): string | null {
  if (v.thumbnail) return v.thumbnail;
  // hqdefault luôn có (480x360); maxresdefault thì không phải video nào cũng có.
  return v.platform === "youtube" ? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` : null;
}

export function videoEmbedUrl(v: Video): string {
  return v.platform === "youtube"
    ? // Bản nocookie: YouTube không đặt cookie theo dõi cho tới khi người xem bấm phát.
      `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`
    : `https://www.tiktok.com/embed/v2/${v.id}`;
}

export function videoWatchUrl(v: Video): string {
  if (v.url) return v.url;
  return v.platform === "youtube"
    ? `https://www.youtube.com/watch?v=${v.id}`
    : `https://www.tiktok.com/embed/v2/${v.id}`;
}

/** Video theo chuyên mục; thiếu thì bù bằng video hướng dẫn kỹ thuật. */
export function videosForTopic(topic: string | null, count: number): Video[] {
  const match = VIDEOS.filter((v) => v.topic === topic);
  const rest = VIDEOS.filter((v) => v.topic !== topic && v.kind === "howto");
  return [...match, ...rest].slice(0, count);
}
