/**
 * Ảnh minh hoạ của từng dịch vụ VOAC, giữ nguyên thứ tự và chú thích như trên
 * voac.vn.
 *
 * Trên voac.vn các ảnh này là background của container Elementor, khai báo
 * trong file CSS riêng của trang chứ không nằm trong HTML — nên lần quét đầu
 * tưởng là các trang không có ảnh.
 *
 * `src` trỏ thẳng ra ngoài (đúng như voac.vn đang làm, nhiều ảnh vốn đã là
 * ảnh mượn từ site khác). Vì vậy phần hiển thị dùng thẻ <img> thường thay cho
 * next/image: không phải khai remotePatterns cho ~17 tên miền, và không đẩy
 * ảnh của bên thứ ba qua bộ tối ưu ảnh của mình.
 *
 * `step` khớp với số thứ tự mục trong nội dung; mục nào có step thì ảnh được
 * gắn vào đúng mục đó, còn lại xếp thành lưới có chú thích.
 */

export type VoacImage = {
  src: string;
  caption: string | null;
  /** Số thứ tự mục tương ứng trong nội dung, nếu có. */
  step: number | null;
};

const MEDIA: Record<string, VoacImage[]> = {
  "voac-dich-vu-cot-loi-cua-voac": [
    { src: "https://voac.vn/wp-content/uploads/2025/10/eco-friendly-farming-methods.png", caption: "Tư vấn Canh tác Hữu cơ & Giải pháp Đặc thù", step: 1 },
    { src: "https://biosoilz.com/assets/img/Net-Zero-Agriculture_18Feb2025.jpg", caption: "Phân bón & Sản phẩm Bảo vệ Thực vật Hữu cơ Bền vững", step: 3 },
    { src: "https://worldwidequalitycontrol.com/wp-content/uploads/agricultural-factory-audit.jpg", caption: "Kiểm tra Sản phẩm Toàn diện & Hướng dẫn Pháp lý", step: 4 },
    { src: "https://i0.wp.com/www.globaltrademag.com/wp-content/uploads/2023/07/shutterstock_1455218390-scaled.jpg?fit=589%2C393&ssl=1", caption: "Nguồn cung Sản phẩm Chiến lược & Tối ưu Chuỗi Cung ứng", step: 5 },
    { src: "https://bcp.cdnchinhphu.vn/344443456812359680/2025/5/9/ghepqhf-lflq-3200-1730360684826576955691-17467281937081963380574-17467828088121038576918.png", caption: "Hỗ trợ Xuất nhập khẩu Toàn cầu Liên tục", step: 6 },
    { src: "https://education.irri.org/wp-content/uploads/2025/08/soil_health_res.jpg", caption: "Giáo dục & Đào tạo Toàn diện", step: 7 },
    { src: "https://staprodmtpdxpzan.blob.core.windows.net/dxp/styles/max_1280x1280/azblob/2025-03/3151.jpg?itok=QJlZKyd6", caption: "Hỗ trợ Tài chính Toàn diện", step: 8 },
  ],
  "voac-dich-vu-ho-tro-cua-voac": [
    { src: "https://img.freepik.com/free-photo/business-people-shaking-hands-together_53876-20488.jpg?semt=ais_hybrid&w=740&q=80", caption: null, step: null },
    { src: "https://s44783.pcdn.co/in/wp-content/uploads/sites/3/2023/04/what-does-a-business-analyst-do.png", caption: null, step: null },
    { src: "https://confluencefarmers.com/wp-content/uploads/2024/03/Home-Page-2.jpg", caption: null, step: null },
  ],
  "voac-dich-vu-tim-nguon-san-pham": [
    { src: "https://img.freepik.com/fotos-premium/garantia-de-qualidade-de-servicos-empresariais-mao-de-empresario-mostra-o-sinal-do-servico-superior-garantia-de-qualidade-em-fundo-preto-normas-de-garantia-certificacao-iso-e-conceito-de-padronizacao_162459-2353.jpg", caption: "Dịch vụ Đảm bảo Chất lượng", step: 2 },
    { src: "https://vlr.1cdn.vn/2023/06/02/amazon-import-export.jpg", caption: "Dịch vụ Hỗ trợ Logistics & Xuất khẩu", step: 3 },
    { src: "https://www.simplilearn.com/ice9/free_resources_article_thumb/Business_Analyst_Vs_Data_Analyst.jpg", caption: "Dịch vụ Giá trị Gia tăng", step: 4 },
  ],
  "voac-mo-hinh-nong-trai-khong-hoa-chat-voac": [
    { src: "https://voac.vn/wp-content/uploads/2025/10/VOAC-Chem-Free-Model-Farms-durian.jpg", caption: "Sầu riêng", step: null },
    { src: "https://voac.vn/wp-content/uploads/2025/10/VOAC-Chem-Free-Model-Farms-Passion-Fruit.jpg", caption: "Chanh dây", step: null },
    { src: "https://voac.vn/wp-content/uploads/2025/10/VOAC-Chem-Free-Model-Farms-dragon-fruit.jpg", caption: "Thanh long", step: null },
    { src: "https://cdn2.fptshop.com.vn/unsafe/ot_chi_thien_2_983b241999.png", caption: "Ớt", step: null },
    { src: "https://voac.vn/wp-content/uploads/2025/11/bactris-gasipaes-2.webp", caption: "Cây cọ đào", step: null },
  ],
  "voac-doi-tac-nong-trai-huu-co-voac": [
    { src: "/images/voac/voac-farmers-rice-harvest.png", caption: "Gạo", step: null },
    { src: "https://file.hstatic.net/200000662087/article/roasted-coffee-beans-5831e5d35f9b58d5b1c85fa7_c0c65f148ce24be88d6724156a20651e_1024x1024.jpeg", caption: "Cà phê", step: null },
    { src: "https://gonefarmers.com/cdn/shop/products/image_97225a30-47e6-4d93-bded-7fa5bc4d5d4c_1024x1024@2x.jpg?v=1608040183", caption: "Hạt điều", step: null },
  ],
  "voac-nguyen-lieu-nong-nghiep-huu-co-voac": [
    { src: "https://voac.vn/wp-content/uploads/2025/10/Bio.SoilZ-Technology.png", caption: "Chất Kích Hoạt Vi Sinh Hữu Cơ", step: null },
    { src: "https://voac.vn/wp-content/uploads/2025/10/Organic-Microbes-Fertilizers-Pesticides.png", caption: "Vi sinh vật, Phân bón & Thuốc trừ sâu Hữu cơ", step: null },
    { src: "https://voac.vn/wp-content/uploads/2025/10/Chicken-Dung.png", caption: "Phân gà", step: null },
  ],
};

/** Ảnh của một dịch vụ, theo đúng thứ tự trên voac.vn. */
export function getVoacImages(slug: string): VoacImage[] {
  return MEDIA[slug] ?? [];
}

/** Ảnh gắn theo số thứ tự mục — dùng khi nội dung có mục đánh số. */
export function getVoacImageByStep(slug: string, step: number | null): VoacImage | null {
  if (step === null) return null;
  return MEDIA[slug]?.find((m) => m.step === step) ?? null;
}
