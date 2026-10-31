import type { Locale } from "@/lib/i18n/config";

/**
 * Dòng dẫn ngắn hiển thị dưới tên dịch vụ trên trang danh sách.
 *
 * Trước đây các câu này nằm trong service-theme.ts dưới dạng một chuỗi duy
 * nhất, nên tagline tiếng Anh của Flora lọt sang trang /vi và tagline tiếng
 * Việt của VOAC lọt sang /en. Tách ra đây
 * và khoá theo Locale để mỗi ngôn ngữ chỉ thấy chữ của mình.
 */

type TaglineMap = Record<string, string>;

const TAGLINE: Record<Locale, TaglineMap> = {
  en: {
    "premium-agricultural-inputs-the-japanese-foundation":
      "Japanese bio-technological precision, delivered to Vietnamese soil.",
    "strategic-sourcing-procurement-your-bridge-to-vietnam":
      "We don't just find products — we architect supply chains.",
    "the-export-logistic-chain-precision-velocity-thermal-integrity":
      "An unbroken cold chain from the vine to the world's most demanding tables.",
    "farming-precision-cultivation-the-honey-no-9-legacy":
      "The gold standard of yellow passion fruit — Honey No. 9.",
    "organic-certification-global-compliance-solutions":
      "Your passport to the global market — from the first soil test to the final audit.",
    "voac-dich-vu-chung-nhan-huu-co":
      "The gateway to global trust and authenticity.",
    "voac-chung-nhan-huu-co-voac":
      "Built on global standards, trust and sustainability.",
    "voac-chung-nhan-voac-khong-hoa-chat-chem-free":
      "A solid first step towards international organic farming.",
    "voac-mo-hinh-nong-trai-khong-hoa-chat-voac":
      "Natural, chemical-free cultivation that meets the VOAC organic standard.",
    "voac-doi-tac-nong-trai-huu-co-voac":
      "A network of excellence in Vietnamese organic agriculture.",
    "voac-nguyen-lieu-nong-nghiep-huu-co-voac":
      "High-grade organic inputs for sustainable farming and soil recovery.",
  },
  vi: {
    "premium-agricultural-inputs-the-japanese-foundation":
      "Độ chính xác công nghệ sinh học Nhật Bản, mang đến đất Việt.",
    "strategic-sourcing-procurement-your-bridge-to-vietnam":
      "Chúng tôi không chỉ tìm sản phẩm — chúng tôi kiến tạo chuỗi cung ứng.",
    "the-export-logistic-chain-precision-velocity-thermal-integrity":
      "Chuỗi lạnh liền mạch, từ vườn đến những bàn ăn khó tính nhất thế giới.",
    "farming-precision-cultivation-the-honey-no-9-legacy":
      "Chuẩn vàng của chanh dây vàng — Mật ong số 9.",
    "organic-certification-global-compliance-solutions":
      "Hộ chiếu đến thị trường toàn cầu — từ mẫu đất đầu tiên đến lần đánh giá cuối.",
    "voac-dich-vu-chung-nhan-huu-co":
      "Cánh cổng dẫn đến niềm tin và tính xác thực toàn cầu.",
    "voac-chung-nhan-huu-co-voac":
      "Xây dựng trên các tiêu chuẩn toàn cầu, sự tin cậy và tính bền vững.",
    "voac-chung-nhan-voac-khong-hoa-chat-chem-free":
      "Bước khởi đầu vững chắc tiến tới canh tác hữu cơ quốc tế.",
    "voac-mo-hinh-nong-trai-khong-hoa-chat-voac":
      "Canh tác tự nhiên, không hóa chất, đạt chuẩn hữu cơ VOAC.",
    "voac-doi-tac-nong-trai-huu-co-voac":
      "Mạng lưới xuất sắc trong nông nghiệp hữu cơ Việt Nam.",
    "voac-nguyen-lieu-nong-nghiep-huu-co-voac":
      "Nguyên liệu hữu cơ chất lượng cao cho canh tác bền vững và phục hồi đất.",
  },
};

/** Tagline theo đúng ngôn ngữ trang; null nếu dịch vụ chưa có dòng dẫn. */
export function getServiceTagline(locale: Locale, slug: string): string | null {
  return TAGLINE[locale]?.[slug] ?? TAGLINE.en[slug] ?? null;
}
