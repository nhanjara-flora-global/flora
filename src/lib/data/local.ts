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
      "Phân gà hữu cơ nhập khẩu từ Nhật Bản, đã lên men và xử lý nhiệt để đảm bảo độ an toàn và dinh dưỡng cao cho đất.",
    short_description:
      "Phân gà hữu cơ nhập khẩu từ Nhật Bản, đã lên men và xử lý nhiệt.",
    price: 250000,
    compare_at_price: null,
    currency: "VND",
    sku: null,
    stock_status: "instock",
    image_url: "/images/products/phan-ga.jpg",
    status: "published",
    category_slugs: ["nguyen-lieu-nhap-khau-huu-co"],
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
    image_url: "/images/products/bot-protein.jpg",
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
