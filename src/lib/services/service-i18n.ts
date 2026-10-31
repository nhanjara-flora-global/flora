import type { Locale } from "@/lib/i18n/config";

/**
 * UI strings for the redesigned service pages. Kept here (mirroring the pattern
 * in localized-content.ts) rather than spread across six dictionary files.
 */

export type ServiceStrings = {
  divisionFlora: string;
  divisionVoac: string;
  divisionPortfolio: string;
  divisionFloraNote: string;
  divisionVoacNote: string;
  divisionPortfolioNote: string;
  navGroupFlora: string;
  navGroupVoac: string;
  navGroupPortfolio: string;
  clusterPrecisionFarming: string;
  clusterCertification: string;
  clusterSourcing: string;
  clusterExport: string;
  clusterEcosystem: string;
  clusterPrecisionFarmingNote: string;
  clusterCertificationNote: string;
  clusterSourcingNote: string;
  clusterExportNote: string;
  clusterEcosystemNote: string;
  intro: string;
  network: string;
  explore: string;
  viewAll: string;
  overview: string;
  atAGlance: string;
  service: string;
};

const STRINGS: Record<Locale, ServiceStrings> = {
  en: {
    divisionFlora: "Flora Global — Integrated Ecosystem",
    divisionVoac: "VOAC — Consortium Services",
    divisionPortfolio: "VOAC — Programmes & Standards",
    divisionFloraNote:
      "Five vertically integrated capabilities, from Japanese-standard soil inputs to export logistics and global certification.",
    divisionVoacNote:
      "What you can engage VOAC to do for you — consulting, certification, support and product sourcing.",
    divisionPortfolioNote:
      "VOAC's own certification standards, model farms and partner network — the assets behind the consortium.",
    navGroupFlora: "Flora Global",
    navGroupVoac: "VOAC Services",
    navGroupPortfolio: "VOAC Programmes",
    clusterPrecisionFarming: "Precision Farming",
    clusterCertification: "Certification & Compliance",
    clusterSourcing: "Strategic Sourcing",
    clusterExport: "Export & Supply Chain",
    clusterEcosystem: "VOAC Ecosystem",
    clusterPrecisionFarmingNote:
      "From Japanese-standard inputs to data-driven cultivation — the quality foundation behind every Flora product.",
    clusterCertificationNote:
      "Managing global certification and compliance end-to-end, from farm to export.",
    clusterSourcingNote:
      "Connecting Vietnamese agricultural supply with international buyer demand.",
    clusterExportNote:
      "Running the export logistics chain — preserving quality from harvest to global market.",
    clusterEcosystemNote:
      "How VOAC runs the farm network and consortium services behind the Flora ecosystem.",
    intro:
      "One integrated ecosystem, delivered as distinct disciplines. Each service below is a self-contained capability — explore the one that matches your ambition.",
    network: "Organic crops in our network",
    explore: "Explore the ecosystem",
    viewAll: "View all services",
    overview: "Overview",
    atAGlance: "At a glance",
    service: "Service",
  },
  vi: {
    divisionFlora: "Flora Global — Hệ sinh thái tích hợp",
    divisionVoac: "VOAC — Dịch vụ liên minh",
    divisionPortfolio: "VOAC — Chương trình & Bộ chuẩn",
    divisionFloraNote:
      "Năm năng lực tích hợp theo chiều dọc — từ nguyên liệu đất chuẩn Nhật đến logistics xuất khẩu và chứng nhận toàn cầu.",
    divisionVoacNote:
      "Những gì bạn có thể thuê VOAC thực hiện — tư vấn, chứng nhận, hỗ trợ và tìm nguồn sản phẩm.",
    divisionPortfolioNote:
      "Bộ chuẩn chứng nhận, mô hình nông trại và mạng lưới đối tác do chính VOAC xây dựng — nền tảng đứng sau liên minh.",
    navGroupFlora: "Flora Global",
    navGroupVoac: "Dịch vụ VOAC",
    navGroupPortfolio: "Chương trình VOAC",
    clusterPrecisionFarming: "Canh tác chính xác",
    clusterCertification: "Chứng nhận & Tiêu chuẩn",
    clusterSourcing: "Tìm nguồn & Thu mua",
    clusterExport: "Xuất khẩu & Chuỗi cung ứng",
    clusterEcosystem: "Hệ sinh thái VOAC",
    clusterPrecisionFarmingNote:
      "Từ đầu vào chuẩn Nhật đến canh tác dữ liệu hoá — nền tảng chất lượng của mọi sản phẩm Flora.",
    clusterCertificationNote:
      "Quản lý tiêu chuẩn và chứng nhận quốc tế xuyên suốt từ trang trại đến xuất khẩu.",
    clusterSourcingNote:
      "Kết nối nguồn cung nông sản Việt Nam với nhu cầu của người mua quốc tế.",
    clusterExportNote:
      "Vận hành chuỗi logistics xuất khẩu — bảo toàn chất lượng từ thu hoạch đến thị trường toàn cầu.",
    clusterEcosystemNote:
      "Cách VOAC vận hành mạng lưới trang trại và dịch vụ liên minh phía sau hệ sinh thái Flora.",
    intro:
      "Một hệ sinh thái tích hợp, được triển khai thành những chuyên môn riêng biệt. Mỗi dịch vụ dưới đây là một năng lực độc lập — hãy khám phá dịch vụ phù hợp với mục tiêu của bạn.",
    network: "Cây trồng hữu cơ trong mạng lưới của chúng tôi",
    explore: "Khám phá hệ sinh thái",
    viewAll: "Xem tất cả dịch vụ",
    overview: "Tổng quan",
    atAGlance: "Thông tin nổi bật",
    service: "Dịch vụ",
  },
};

export function getServiceStrings(locale: Locale): ServiceStrings {
  return STRINGS[locale] ?? STRINGS.en;
}
