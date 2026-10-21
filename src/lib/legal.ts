import type { Locale } from "@/lib/i18n/config";

// Legal copy is maintained in English and Vietnamese only; other locales fall
// back to English (the governing text) with their own translated page title.
export type LegalDoc = "terms" | "privacy";

export const LEGAL_UPDATED = "2026-10-21";

const CONTACT_EN = `<p>Flora Global Company Limited<br />692/31 Doan Van Bo Street, Xom Chieu Ward, Ho Chi Minh City, Vietnam<br />Phone: <a href="tel:0932108990">0932.108.990</a><br />Email: <a href="mailto:info@flora-global.vn">info@flora-global.vn</a></p>`;

const CONTACT_VI = `<p>Công ty TNHH Flora Global<br />692/31 Đường Đoàn Văn Bơ, Phường Xóm Chiếu, TP. Hồ Chí Minh, Việt Nam<br />Điện thoại: <a href="tel:0932108990">0932.108.990</a><br />Email: <a href="mailto:info@flora-global.vn">info@flora-global.vn</a></p>`;

const CONTENT: Record<"en" | "vi", Record<LegalDoc, string>> = {
  en: {
    terms: `
<p>These Terms of Use govern your access to and use of the Flora Global website (the “Website”), operated by Flora Global Company Limited (“Flora Global”, “we”, “us”). By using the Website you agree to these Terms. If you do not agree, please do not use the Website.</p>

<h2>1. Use of the Website</h2>
<p>You may use the Website for lawful purposes only. You must not attempt to gain unauthorised access to the Website or its systems, interfere with its operation, or use it to send spam or malicious content.</p>

<h2>2. Information on the Website</h2>
<p>Content on the Website, including product, solution and knowledge articles, is provided for general information. We try to keep it accurate and current but do not guarantee that it is complete or error-free. Product specifications, availability and prices are confirmed only in a written quotation or contract.</p>

<h2>3. Enquiries and orders</h2>
<p>Submitting the contact or wholesale enquiry form does not create a contract. Any supply of products or services is subject to a separate agreement between you and Flora Global.</p>

<h2>4. Intellectual property</h2>
<p>All text, images, logos and other materials on the Website belong to Flora Global or its licensors and are protected by law. You may not copy, reproduce or distribute them for commercial purposes without our prior written consent.</p>

<h2>5. Third-party links and services</h2>
<p>The Website may link to or embed third-party services (such as Facebook, Google Analytics and Google News). We are not responsible for their content or practices; your use of them is governed by their own terms.</p>

<h2>6. Limitation of liability</h2>
<p>To the extent permitted by law, Flora Global is not liable for any indirect or consequential loss arising from your use of, or inability to use, the Website or reliance on its content.</p>

<h2>7. Changes</h2>
<p>We may update these Terms from time to time. The updated version takes effect when published on this page.</p>

<h2>8. Governing law</h2>
<p>These Terms are governed by the laws of Vietnam. Disputes will be resolved by the competent courts of Ho Chi Minh City.</p>

<h2>9. Contact</h2>
${CONTACT_EN}
`,
    privacy: `
<p>Flora Global Company Limited (“Flora Global”, “we”, “us”) respects your privacy. This Privacy Policy explains what personal data we collect through our website, how we use it and the choices you have.</p>

<h2>1. Data we collect</h2>
<ul>
<li><strong>Information you provide:</strong> when you submit the contact or wholesale enquiry form we collect your name, email, phone number, company, location and the content of your message.</li>
<li><strong>Usage data:</strong> we use Google Analytics to collect anonymous information such as pages visited, device, browser, approximate location and referring site, using cookies or similar technologies.</li>
<li><strong>Google News / Reader Revenue Manager:</strong> our pages load a Google script that may set cookies and process data under Google’s own policy.</li>
</ul>

<h2>2. How we use your data</h2>
<ul>
<li>To respond to your enquiries and provide quotations, products and services;</li>
<li>To improve the website’s content and user experience;</li>
<li>To comply with our legal obligations.</li>
</ul>
<p>We do not sell your personal data.</p>

<h2>3. Sharing</h2>
<p>We share data only with service providers that help us operate the website (such as hosting, database and analytics providers, including Vercel, Supabase and Google), or when required by law.</p>

<h2>4. Cookies</h2>
<p>You can block or delete cookies in your browser settings. You can also opt out of Google Analytics with the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer">Google Analytics Opt-out Browser Add-on</a>. See <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google’s Privacy Policy</a> for how Google uses data.</p>

<h2>5. Retention and security</h2>
<p>We keep enquiry data only as long as needed for the purposes above or as required by law, and apply reasonable technical and organisational measures to protect it.</p>

<h2>6. Your rights</h2>
<p>You may request access to, correction of, or deletion of your personal data, or withdraw your consent, by contacting us using the details below. We will respond in accordance with applicable law, including Vietnam’s regulations on personal data protection.</p>

<h2>7. Changes</h2>
<p>We may update this Policy from time to time. The updated version takes effect when published on this page.</p>

<h2>8. Contact</h2>
${CONTACT_EN}
`,
  },
  vi: {
    terms: `
<p>Điều khoản sử dụng này điều chỉnh việc bạn truy cập và sử dụng website Flora Global (“Website”) do Công ty TNHH Flora Global (“Flora Global”, “chúng tôi”) vận hành. Khi sử dụng Website, bạn đồng ý với các Điều khoản này. Nếu không đồng ý, vui lòng ngừng sử dụng Website.</p>

<h2>1. Sử dụng Website</h2>
<p>Bạn chỉ được sử dụng Website cho mục đích hợp pháp. Không được truy cập trái phép vào Website hoặc hệ thống của chúng tôi, can thiệp vào hoạt động của Website, hay dùng Website để gửi thư rác hoặc nội dung độc hại.</p>

<h2>2. Thông tin trên Website</h2>
<p>Nội dung trên Website, gồm thông tin sản phẩm, giải pháp và bài viết kiến thức, chỉ mang tính tham khảo. Chúng tôi cố gắng giữ thông tin chính xác và cập nhật nhưng không bảo đảm hoàn toàn đầy đủ hay không có sai sót. Thông số, tình trạng hàng và giá chỉ được xác nhận trong báo giá hoặc hợp đồng bằng văn bản.</p>

<h2>3. Yêu cầu liên hệ và đặt hàng</h2>
<p>Việc gửi biểu mẫu liên hệ hoặc yêu cầu mua sỉ không hình thành hợp đồng. Mọi việc cung cấp sản phẩm, dịch vụ sẽ theo thỏa thuận riêng giữa bạn và Flora Global.</p>

<h2>4. Sở hữu trí tuệ</h2>
<p>Toàn bộ văn bản, hình ảnh, logo và tài liệu trên Website thuộc sở hữu của Flora Global hoặc bên cấp phép và được pháp luật bảo hộ. Không được sao chép, tái bản hay phân phối cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản của chúng tôi.</p>

<h2>5. Liên kết và dịch vụ bên thứ ba</h2>
<p>Website có thể liên kết hoặc nhúng dịch vụ của bên thứ ba (như Facebook, Google Analytics, Google News). Chúng tôi không chịu trách nhiệm về nội dung hay cách hoạt động của các dịch vụ đó; việc bạn sử dụng chúng tuân theo điều khoản riêng của từng bên.</p>

<h2>6. Giới hạn trách nhiệm</h2>
<p>Trong phạm vi pháp luật cho phép, Flora Global không chịu trách nhiệm đối với thiệt hại gián tiếp hoặc phát sinh từ việc sử dụng, không thể sử dụng Website hay việc dựa vào nội dung trên Website.</p>

<h2>7. Thay đổi điều khoản</h2>
<p>Chúng tôi có thể cập nhật Điều khoản này theo thời gian. Phiên bản mới có hiệu lực kể từ khi được đăng trên trang này.</p>

<h2>8. Luật áp dụng</h2>
<p>Điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Tranh chấp được giải quyết tại tòa án có thẩm quyền tại TP. Hồ Chí Minh.</p>

<h2>9. Liên hệ</h2>
${CONTACT_VI}
`,
    privacy: `
<p>Công ty TNHH Flora Global (“Flora Global”, “chúng tôi”) tôn trọng quyền riêng tư của bạn. Chính sách bảo mật này giải thích chúng tôi thu thập dữ liệu cá nhân nào qua website, sử dụng ra sao và bạn có những lựa chọn gì.</p>

<h2>1. Dữ liệu chúng tôi thu thập</h2>
<ul>
<li><strong>Thông tin bạn cung cấp:</strong> khi gửi biểu mẫu liên hệ hoặc yêu cầu mua sỉ, chúng tôi thu thập họ tên, email, số điện thoại, công ty, địa điểm và nội dung tin nhắn.</li>
<li><strong>Dữ liệu sử dụng:</strong> chúng tôi dùng Google Analytics để thu thập thông tin ẩn danh như trang đã xem, thiết bị, trình duyệt, vị trí gần đúng và trang giới thiệu, thông qua cookie hoặc công nghệ tương tự.</li>
<li><strong>Google News / Reader Revenue Manager:</strong> các trang của chúng tôi tải một tập lệnh của Google, có thể đặt cookie và xử lý dữ liệu theo chính sách riêng của Google.</li>
</ul>

<h2>2. Mục đích sử dụng</h2>
<ul>
<li>Phản hồi yêu cầu của bạn, gửi báo giá, cung cấp sản phẩm và dịch vụ;</li>
<li>Cải thiện nội dung và trải nghiệm trên website;</li>
<li>Thực hiện nghĩa vụ theo quy định pháp luật.</li>
</ul>
<p>Chúng tôi không bán dữ liệu cá nhân của bạn.</p>

<h2>3. Chia sẻ dữ liệu</h2>
<p>Chúng tôi chỉ chia sẻ dữ liệu với các nhà cung cấp dịch vụ giúp vận hành website (như lưu trữ, cơ sở dữ liệu và phân tích, gồm Vercel, Supabase và Google), hoặc khi pháp luật yêu cầu.</p>

<h2>4. Cookie</h2>
<p>Bạn có thể chặn hoặc xóa cookie trong cài đặt trình duyệt, và có thể từ chối Google Analytics bằng <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer">tiện ích chọn không tham gia Google Analytics</a>. Xem <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Chính sách quyền riêng tư của Google</a> để biết Google sử dụng dữ liệu thế nào.</p>

<h2>5. Lưu trữ và bảo mật</h2>
<p>Chúng tôi chỉ lưu dữ liệu yêu cầu trong thời gian cần thiết cho các mục đích trên hoặc theo quy định pháp luật, và áp dụng biện pháp kỹ thuật, tổ chức hợp lý để bảo vệ dữ liệu.</p>

<h2>6. Quyền của bạn</h2>
<p>Bạn có quyền yêu cầu xem, chỉnh sửa, xóa dữ liệu cá nhân hoặc rút lại sự đồng ý bằng cách liên hệ với chúng tôi theo thông tin bên dưới. Chúng tôi sẽ phản hồi theo quy định pháp luật hiện hành, bao gồm quy định của Việt Nam về bảo vệ dữ liệu cá nhân.</p>

<h2>7. Thay đổi chính sách</h2>
<p>Chúng tôi có thể cập nhật Chính sách này theo thời gian. Phiên bản mới có hiệu lực kể từ khi được đăng trên trang này.</p>

<h2>8. Liên hệ</h2>
${CONTACT_VI}
`,
  },
};

export function getLegalContent(doc: LegalDoc, locale: Locale): string {
  return CONTENT[locale === "vi" ? "vi" : "en"][doc];
}
