import type { Locale } from "@/lib/i18n/config";

/**
 * UI strings for the redesigned service pages. Kept here (mirroring the pattern
 * in localized-content.ts) rather than spread across six dictionary files.
 */

export type ServiceStrings = {
  divisionFlora: string;
  divisionVoac: string;
  divisionFloraNote: string;
  divisionVoacNote: string;
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
    divisionVoac: "VOAC — Vietnam Organic Agriculture Consortium",
    divisionFloraNote:
      "Five vertically integrated capabilities, from Japanese-standard soil inputs to export logistics and global certification.",
    divisionVoacNote:
      "Consortium services connecting Vietnamese organic agriculture to the world — consulting, certification, sourcing and market access.",
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
    divisionVoac: "VOAC — Liên minh Nông nghiệp Hữu cơ Việt Nam",
    divisionFloraNote:
      "Năm năng lực tích hợp theo chiều dọc — từ nguyên liệu đất chuẩn Nhật đến logistics xuất khẩu và chứng nhận toàn cầu.",
    divisionVoacNote:
      "Các dịch vụ liên minh kết nối nông nghiệp hữu cơ Việt Nam với thế giới — tư vấn, chứng nhận, tìm nguồn và tiếp cận thị trường.",
    intro:
      "Một hệ sinh thái tích hợp, được triển khai thành những chuyên môn riêng biệt. Mỗi dịch vụ dưới đây là một năng lực độc lập — hãy khám phá dịch vụ phù hợp với mục tiêu của bạn.",
    network: "Cây trồng hữu cơ trong mạng lưới của chúng tôi",
    explore: "Khám phá hệ sinh thái",
    viewAll: "Xem tất cả dịch vụ",
    overview: "Tổng quan",
    atAGlance: "Thông tin nổi bật",
    service: "Dịch vụ",
  },
  zh: {
    divisionFlora: "Flora Global — 一体化生态系统",
    divisionVoac: "VOAC — 越南有机农业联盟",
    divisionFloraNote: "五项垂直整合能力，从日本标准的土壤投入到出口物流与全球认证。",
    divisionVoacNote: "联盟服务将越南有机农业与世界连接——咨询、认证、采购与市场准入。",
    intro:
      "一个一体化的生态系统，以各自独立的专业能力交付。以下每项服务都是一项独立能力——请探索最契合您目标的那一项。",
    network: "我们网络中的有机作物",
    explore: "探索生态系统",
    viewAll: "查看所有服务",
    overview: "概述",
    atAGlance: "概览",
    service: "服务",
  },
  ko: {
    divisionFlora: "Flora Global — 통합 생태계",
    divisionVoac: "VOAC — 베트남 유기농업 컨소시엄",
    divisionFloraNote:
      "일본 기준의 토양 투입재부터 수출 물류, 글로벌 인증까지 수직 통합된 다섯 가지 역량.",
    divisionVoacNote:
      "베트남 유기농업을 세계와 연결하는 컨소시엄 서비스 — 컨설팅, 인증, 소싱, 시장 진입.",
    intro:
      "하나의 통합 생태계를 각각의 전문 분야로 제공합니다. 아래 각 서비스는 독립적인 역량입니다 — 목표에 맞는 서비스를 살펴보세요.",
    network: "네트워크 내 유기농 작물",
    explore: "생태계 살펴보기",
    viewAll: "모든 서비스 보기",
    overview: "개요",
    atAGlance: "한눈에 보기",
    service: "서비스",
  },
  hi: {
    divisionFlora: "Flora Global — एकीकृत पारिस्थितिकी तंत्र",
    divisionVoac: "VOAC — वियतनाम जैविक कृषि संघ",
    divisionFloraNote:
      "जापानी-मानक मृदा इनपुट से लेकर निर्यात लॉजिस्टिक्स और वैश्विक प्रमाणन तक, पाँच ऊर्ध्वाधर एकीकृत क्षमताएँ।",
    divisionVoacNote:
      "वियतनामी जैविक कृषि को दुनिया से जोड़ने वाली संघ सेवाएँ — परामर्श, प्रमाणन, सोर्सिंग और बाज़ार पहुँच।",
    intro:
      "एक एकीकृत पारिस्थितिकी तंत्र, अलग-अलग विषयों के रूप में प्रस्तुत। नीचे दी गई प्रत्येक सेवा एक स्वतंत्र क्षमता है — वह चुनें जो आपके लक्ष्य से मेल खाती हो।",
    network: "हमारे नेटवर्क में जैविक फसलें",
    explore: "पारिस्थितिकी तंत्र देखें",
    viewAll: "सभी सेवाएँ देखें",
    overview: "अवलोकन",
    atAGlance: "एक नज़र में",
    service: "सेवा",
  },
  si: {
    divisionFlora: "Flora Global — ඒකාබද්ධ පරිසර පද්ධතිය",
    divisionVoac: "VOAC — වියට්නාම කාබනික කෘෂිකර්ම සම්මේලනය",
    divisionFloraNote:
      "ජපන් ප්‍රමිතියේ පස් යෙදවුම් සිට අපනයන සැපයුම් හා ගෝලීය සහතික දක්වා, සිරස් ලෙස ඒකාබද්ධ හැකියාවන් පහක්.",
    divisionVoacNote:
      "වියට්නාම කාබනික කෘෂිකර්මය ලෝකයට සම්බන්ධ කරන සම්මේලන සේවා — උපදේශන, සහතික, සම්පත් සෙවීම හා වෙළඳපොළ ප්‍රවේශය.",
    intro:
      "එක් ඒකාබද්ධ පරිසර පද්ධතියක්, වෙන් වෙන් විෂයයන් ලෙස ලබා දේ. පහත සෑම සේවාවක්ම ස්වාධීන හැකියාවකි — ඔබේ අරමුණට ගැලපෙන එක සොයා බලන්න.",
    network: "අපගේ ජාලයේ කාබනික බෝග",
    explore: "පරිසර පද්ධතිය ගවේෂණය කරන්න",
    viewAll: "සියලු සේවා බලන්න",
    overview: "දළ විශ්ලේෂණය",
    atAGlance: "සැකෙවින්",
    service: "සේවාව",
  },
};

export function getServiceStrings(locale: Locale): ServiceStrings {
  return STRINGS[locale] ?? STRINGS.en;
}
