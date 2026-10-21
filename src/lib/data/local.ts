export type ProductFaq = { question: string; answer: string };

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number | null;
  compare_at_price: number | null;
  currency: string;
  sku: string | null;
  stock_status: "instock" | "outofstock" | "onbackorder";
  image_url: string | null;
  status: "draft" | "published" | "archived";
  category_slugs?: string[];
  /** Additional photos shown alongside image_url in the detail-page gallery. */
  gallery?: string[];
  /** Short benefit bullets shown near the CTA. */
  highlights?: string[];
  origin?: string;
  manufacturer?: string;
  packaging?: string;
  licenseNo?: string;
  storageNote?: string;
  /** Dosage guidance per crop group, e.g. "Cây ăn trái" → "500 – 700 kg/ha/lần". */
  usageDosage?: { group: string; amount: string }[];
  /** Numbered application steps, e.g. "Rải phân" → "Lấp đất và tưới nước". */
  usageSteps?: { title: string; detail: string }[];
  /** Caution/warning shown at the end of the application-process tab. */
  usageNote?: string;
  faqs?: ProductFaq[];
  /** Bullet facts shown in the "supply capability" tab (packing, container, lead time...). */
  capabilityDetails?: string[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export const LOCAL_CATEGORIES: Category[] = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    name: "Sản phẩm hữu cơ",
    slug: "san-pham-huu-co",
    description: "Nông sản và sản phẩm hữu cơ",
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    name: "Nguyên liệu nhập khẩu hữu cơ",
    slug: "nguyen-lieu-nhap-khau-huu-co",
    description: "Nguyên liệu hữu cơ nhập khẩu",
  },
];

export const LOCAL_PRODUCTS: Product[] = [
  {
    id: "22222222-2222-2222-2222-222222222201",
    name: "Phân gà hữu cơ Nhật Bản",
    slug: "phan-ga-huu-co-nhat-ban",
    description:
      "Phân bón hữu cơ Flora Global OM1 — phân gà Nhật Bản đã qua lên men, nhập khẩu nguyên bao từ nhà sản xuất HOPE CO., LTD (Gifu, Nhật Bản). Trước khi xuống giống hoặc trồng cây, nên bón phân gà song song với cày xới đất để bổ sung cho đất đầy đủ dưỡng chất. Phù hợp bón lót và bón thúc cho cây ăn trái (cây có múi, nho, sầu riêng, chuối, dứa, dưa hấu, đu đủ, việt quất...) và rau màu. Đóng bao 15kg, cung ứng sỉ theo pallet/container cho trang trại, hợp tác xã và đại lý vật tư nông nghiệp.",
    short_description:
      "Phân gà hữu cơ lên men, nhập khẩu nguyên bao từ Nhật Bản — bón lót, bón thúc cho cây ăn trái và rau màu.",
    price: 250000,
    compare_at_price: null,
    currency: "VND",
    sku: "FG-OM1-15",
    stock_status: "instock",
    image_url: "/images/products/phan-ga.jpg",
    status: "published",
    category_slugs: ["nguyen-lieu-nhap-khau-huu-co"],
    gallery: [
      "/images/products/phan-ga.jpg",
      "/images/products/phan-ga-loi-ich.jpg",
      "/images/products/phan-ga-kho-hang.jpg",
      "/images/products/phan-ga-doi-tac.jpg",
      "/images/products/phan-ga-xuat-container.jpg",
    ],
    highlights: [
      "Bổ sung hữu cơ, dưỡng chất cho đất",
      "Cải thiện độ tơi xốp, giữ ẩm tốt hơn",
      "Tăng hoạt động của vi sinh vật có lợi",
      "Hỗ trợ cây bén rễ nhanh, phát triển khỏe",
    ],
    origin: "Nhập khẩu từ Nhật Bản (Gifu)",
    manufacturer: "HOPE CO., LTD — 1-9-13 Yasui, Ogaki-city, Gifu 503-0837, Nhật Bản",
    packaging: "Bao 15kg, đóng pallet — xuất bán theo container",
    licenseNo: "617/QĐ-TTTTV-PB ngày 23/07/2025 (Cục Trồng trọt và Bảo vệ thực vật)",
    storageNote: "Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp; nên sử dụng sớm sau khi mở bao.",
    usageDosage: [
      {
        group: "Cây rau màu và cây lương thực",
        amount: "300 – 500 kg/ha/vụ, dùng để bón lót hoặc bón thúc sớm",
      },
      {
        group: "Cây ăn trái (cam, quýt, sầu riêng, xoài...)",
        amount:
          "500 – 700 kg/ha/lần, bón khoảng 2 lần/năm (giai đoạn sau thu hoạch và giai đoạn nuôi trái)",
      },
      {
        group: "Cây hoa, cây cảnh chậu nhỏ",
        amount:
          "Trộn trực tiếp một lượng nhỏ vào đất trồng hoặc rải quanh gốc rồi lấp đất, tránh sát gốc chính",
      },
    ],
    usageSteps: [
      {
        title: "Làm sạch và xới đất",
        detail:
          "Xới nhẹ lớp đất xung quanh gốc, theo hình chiếu của tán cây đối với cây lâu năm.",
      },
      {
        title: "Rải phân",
        detail:
          "Rải đều phân gà dạng viên nén, viên nở hoặc dạng bột theo vành ngoài của tán cây.",
      },
      {
        title: "Lấp đất và tưới nước",
        detail:
          "Lấp một lớp đất mỏng lên trên phân và tưới nước đủ ẩm để vi sinh vật hoạt động tốt, giúp phân tan dần và cây dễ hấp thụ.",
      },
    ],
    usageNote:
      "Phân gà Nhật Bản có tính chất \"nóng\" do chứa hàm lượng dinh dưỡng hữu cơ cao. Không nên bón quá liều lượng hoặc để phân tiếp xúc trực tiếp với gốc cây non vì dễ gây hiện tượng vàng lá, xót rễ.",
    capabilityDetails: [
      "Đóng bao 15kg, xếp pallet quấn màng chống ẩm trong suốt quá trình vận chuyển",
      "Xuất hàng theo container 20FT/40FT theo số lượng đặt hàng của trang trại, hợp tác xã, đại lý vật tư nông nghiệp",
      "Hàng có sẵn tại kho, sẵn sàng đóng và xuất nhanh cho đơn số lượng lớn",
      "Đội ngũ Flora Global đồng hành trực tiếp từ khâu đóng hàng đến khi giao tại kho khách hàng",
    ],
    faqs: [
      {
        question: "Phân bón hữu cơ Flora Global OM1 dùng cho loại cây nào?",
        answer:
          "Phù hợp bón lót và bón thúc cho cây ăn trái (cây có múi, nho, sầu riêng, chuối, dứa, dưa hấu, đu đủ, việt quất...) và rau màu, đặc biệt trước khi xuống giống hoặc trồng mới.",
      },
      {
        question: "Sản phẩm có giấy phép lưu hành tại Việt Nam không?",
        answer:
          "Có. Sản phẩm được cấp quyết định công nhận lưu hành số 617/QĐ-TTTTV-PB ngày 23/07/2025 của Cục Trồng trọt và Bảo vệ thực vật.",
      },
      {
        question: "Flora Global có bán lẻ theo bao không?",
        answer:
          "Flora Global chỉ cung ứng sỉ theo pallet/container cho trang trại, hợp tác xã và đại lý vật tư nông nghiệp. Liên hệ để nhận báo giá và quy cách đóng hàng phù hợp với đơn hàng của bạn.",
      },
      {
        question: "Thời gian giao hàng cho một container là bao lâu?",
        answer:
          "Thời gian nhập khẩu và giao hàng phụ thuộc số lượng và điểm giao nhận. Đội ngũ Flora Global sẽ tư vấn lịch nhập hàng cụ thể ngay khi nhận yêu cầu báo giá.",
      },
    ],
  },
  {
    id: "22222222-2222-2222-2222-222222222202",
    name: "Phân bón hữu cơ từ tro phân gà nung",
    slug: "phan-bon-huu-co-tu-tro-phan-ga-nung",
    description:
      "Phân bón hỗn hợp PK hữu cơ từ tro phân gà nung — giải pháp bền vững cho nông nghiệp hữu cơ.",
    short_description: "Phân bón hỗn hợp PK hữu cơ từ tro phân gà nung.",
    price: 125000,
    compare_at_price: null,
    currency: "VND",
    sku: null,
    stock_status: "instock",
    image_url: "/images/products/phan-bon.jpg",
    status: "published",
    category_slugs: ["nguyen-lieu-nhap-khau-huu-co"],
  },
  {
    id: "22222222-2222-2222-2222-222222222203",
    name: "Bột Protein từ cá",
    slug: "bot-protein-tu-ca",
    description:
      "Bột protein từ cá — nguyên liệu hữu cơ chất lượng cao cho dinh dưỡng và sản xuất.",
    short_description: "Bột protein từ cá — nguyên liệu hữu cơ chất lượng cao.",
    price: 125000,
    compare_at_price: null,
    currency: "VND",
    sku: null,
    stock_status: "instock",
    image_url: null,
    status: "published",
    category_slugs: ["san-pham-huu-co"],
  },
  {
    id: "22222222-2222-2222-2222-222222222204",
    name: "Bột hạt sen 100% nguyên chất",
    slug: "bot-hat-sen-100-nguyen-chat",
    description:
      "Bột hạt sen 100% nguyên chất. Liên hệ để được tư vấn và báo giá.",
    short_description: "Bột hạt sen nguyên chất — liên hệ để báo giá.",
    price: null,
    compare_at_price: null,
    currency: "VND",
    sku: null,
    stock_status: "instock",
    image_url: "/images/products/bot-hat-sen.jpg",
    status: "published",
    category_slugs: ["san-pham-huu-co"],
  },
];
