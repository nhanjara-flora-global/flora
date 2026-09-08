import type { Locale } from "@/lib/i18n/config";

/**
 * Dòng dẫn ngắn hiển thị dưới tên dịch vụ trên trang danh sách.
 *
 * Trước đây các câu này nằm trong service-theme.ts dưới dạng một chuỗi duy
 * nhất, nên tagline tiếng Anh của Flora lọt sang trang /vi và tagline tiếng
 * Việt của VOAC lọt sang /en — trên zh/ko/hi/si thì lẫn cả hai. Tách ra đây
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
  zh: {
    "premium-agricultural-inputs-the-japanese-foundation":
      "日本生物技术的精准，送抵越南的土壤。",
    "strategic-sourcing-procurement-your-bridge-to-vietnam":
      "我们不只是寻找产品——我们构建供应链。",
    "the-export-logistic-chain-precision-velocity-thermal-integrity":
      "从果园到全球最挑剔的餐桌，冷链全程不断。",
    "farming-precision-cultivation-the-honey-no-9-legacy":
      "黄金百香果的黄金标准——蜂蜜9号。",
    "organic-certification-global-compliance-solutions":
      "通往全球市场的通行证——从第一次土壤检测到最终审核。",
    "voac-dich-vu-chung-nhan-huu-co": "通往全球信任与真实性的大门。",
    "voac-chung-nhan-huu-co-voac": "建立在全球标准、信任与可持续之上。",
    "voac-chung-nhan-voac-khong-hoa-chat-chem-free":
      "迈向国际有机农业的坚实第一步。",
    "voac-mo-hinh-nong-trai-khong-hoa-chat-voac":
      "自然、无化学的耕作，符合 VOAC 有机标准。",
    "voac-doi-tac-nong-trai-huu-co-voac": "越南有机农业的卓越网络。",
    "voac-nguyen-lieu-nong-nghiep-huu-co-voac":
      "高品质有机投入品，助力可持续耕作与土壤复原。",
  },
  ko: {
    "premium-agricultural-inputs-the-japanese-foundation":
      "일본 생명공학의 정밀함을 베트남 토양으로.",
    "strategic-sourcing-procurement-your-bridge-to-vietnam":
      "제품을 찾는 데 그치지 않고, 공급망을 설계합니다.",
    "the-export-logistic-chain-precision-velocity-thermal-integrity":
      "산지에서 세계에서 가장 까다로운 식탁까지, 끊기지 않는 콜드체인.",
    "farming-precision-cultivation-the-honey-no-9-legacy":
      "옐로우 패션프루트의 기준 — 허니 넘버 9.",
    "organic-certification-global-compliance-solutions":
      "글로벌 시장으로 가는 여권 — 첫 토양 검사부터 최종 심사까지.",
    "voac-dich-vu-chung-nhan-huu-co": "글로벌 신뢰와 진정성으로 가는 관문.",
    "voac-chung-nhan-huu-co-voac":
      "글로벌 표준, 신뢰, 지속가능성 위에 세워진 인증.",
    "voac-chung-nhan-voac-khong-hoa-chat-chem-free":
      "국제 유기농업으로 가는 확실한 첫걸음.",
    "voac-mo-hinh-nong-trai-khong-hoa-chat-voac":
      "VOAC 유기 기준을 충족하는 무화학 자연 재배.",
    "voac-doi-tac-nong-trai-huu-co-voac": "베트남 유기농업의 우수 파트너 네트워크.",
    "voac-nguyen-lieu-nong-nghiep-huu-co-voac":
      "지속가능한 재배와 토양 회복을 위한 고품질 유기 투입재.",
  },
  hi: {
    "premium-agricultural-inputs-the-japanese-foundation":
      "जापानी जैव-तकनीकी परिशुद्धता, वियतनामी मिट्टी तक।",
    "strategic-sourcing-procurement-your-bridge-to-vietnam":
      "हम सिर्फ़ उत्पाद नहीं ढूँढ़ते — हम आपूर्ति शृंखला रचते हैं।",
    "the-export-logistic-chain-precision-velocity-thermal-integrity":
      "बाग़ से दुनिया की सबसे माँग भरी मेज़ों तक, अटूट कोल्ड चेन।",
    "farming-precision-cultivation-the-honey-no-9-legacy":
      "पीले पैशन फ्रूट का स्वर्ण मानक — हनी नंबर 9।",
    "organic-certification-global-compliance-solutions":
      "वैश्विक बाज़ार का पासपोर्ट — पहली मृदा जाँच से अंतिम ऑडिट तक।",
    "voac-dich-vu-chung-nhan-huu-co":
      "वैश्विक भरोसे और प्रामाणिकता का प्रवेशद्वार।",
    "voac-chung-nhan-huu-co-voac":
      "वैश्विक मानकों, भरोसे और स्थिरता पर आधारित।",
    "voac-chung-nhan-voac-khong-hoa-chat-chem-free":
      "अंतर्राष्ट्रीय जैविक खेती की ओर मज़बूत पहला क़दम।",
    "voac-mo-hinh-nong-trai-khong-hoa-chat-voac":
      "प्राकृतिक, रसायन-मुक्त खेती जो VOAC जैविक मानक पर खरी उतरे।",
    "voac-doi-tac-nong-trai-huu-co-voac":
      "वियतनामी जैविक कृषि में उत्कृष्टता का नेटवर्क।",
    "voac-nguyen-lieu-nong-nghiep-huu-co-voac":
      "टिकाऊ खेती और मृदा पुनर्बहाली के लिए उच्च श्रेणी के जैविक इनपुट।",
  },
  si: {
    "premium-agricultural-inputs-the-japanese-foundation":
      "ජපන් ජෛව තාක්ෂණයේ නිරවද්‍යතාව, වියට්නාම පසට.",
    "strategic-sourcing-procurement-your-bridge-to-vietnam":
      "අපි නිෂ්පාදන සොයනවා පමණක් නොව — සැපයුම් දාමය නිර්මාණය කරමු.",
    "the-export-logistic-chain-precision-velocity-thermal-integrity":
      "වගාවේ සිට ලොව ඉල්ලුම්කාරී මේස දක්වා, නොකැඩෙන සිසිල් දාමයක්.",
    "farming-precision-cultivation-the-honey-no-9-legacy":
      "කහ පැෂන් ෆෘට් හි ස්වර්ණ ප්‍රමිතිය — හනි අංක 9.",
    "organic-certification-global-compliance-solutions":
      "ගෝලීය වෙළඳපොළට ගමන් බලපත්‍රය — පළමු පස් පරීක්ෂණයේ සිට අවසන් විගණනය දක්වා.",
    "voac-dich-vu-chung-nhan-huu-co":
      "ගෝලීය විශ්වාසය හා අව්‍යාජත්වය වෙත දොරටුව.",
    "voac-chung-nhan-huu-co-voac":
      "ගෝලීය ප්‍රමිති, විශ්වාසය හා තිරසාරත්වය මත ගොඩනැඟුණි.",
    "voac-chung-nhan-voac-khong-hoa-chat-chem-free":
      "ජාත්‍යන්තර කාබනික ගොවිතැන වෙත ස්ථිර පළමු පියවර.",
    "voac-mo-hinh-nong-trai-khong-hoa-chat-voac":
      "VOAC කාබනික ප්‍රමිතියට ගැළපෙන ස්වාභාවික, රසායන රහිත වගාව.",
    "voac-doi-tac-nong-trai-huu-co-voac":
      "වියට්නාම කාබනික කෘෂිකර්මයේ විශිෂ්ට ජාලය.",
    "voac-nguyen-lieu-nong-nghiep-huu-co-voac":
      "තිරසාර වගාව හා පස් යථා තත්ත්වයට පත් කිරීම සඳහා උසස් කාබනික යෙදවුම්.",
  },
};

/** Tagline theo đúng ngôn ngữ trang; null nếu dịch vụ chưa có dòng dẫn. */
export function getServiceTagline(locale: Locale, slug: string): string | null {
  return TAGLINE[locale]?.[slug] ?? TAGLINE.en[slug] ?? null;
}
