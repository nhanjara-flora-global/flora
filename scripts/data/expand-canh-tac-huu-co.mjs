/**
 * Nội dung mở rộng cho 6 bài "seed" chuyên mục canh-tac-huu-co (các bài hiện
 * ở khối "Canh tác hữu cơ" dưới trang sản phẩm Phân gà hữu cơ Nhật Bản).
 *
 * Cùng mẫu với expand-articles.mjs: 1200–1700 từ/bài, thêm bảng so sánh, ví dụ
 * Việt Nam (ĐBSCL, Tây Nguyên), quy định của TCVN/USDA/EU và mục "Tham khảo"
 * (link chỉ đặt ở cuối bài, không chèn trong thân).
 *
 * Áp dụng:  node scripts/data/expand-canh-tac-huu-co.mjs           (ghi wp-content.json)
 *           DRY_RUN=1 node scripts/data/expand-canh-tac-huu-co.mjs (chỉ in số từ)
 * Sau đó:   xóa 6 slug khỏi news-cache.json + chạy scripts/translate-news.mjs
 *           rồi ONLY=slug1,slug2,... npm run posts:sync
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const WP_PATH = path.join(ROOT, "src/lib/data/wp-content.json");
const DRY_RUN = process.env.DRY_RUN === "1";

/** slug -> { excerpt?, content } (HTML thân bài, chỉ p/h2/h3/ul/ol/li/table/strong/em/a) */
export const EXPANDED = {
  "chuyen-doi-sang-canh-tac-huu-co-lo-trinh-cho-nhung-nam-dau-tien": {
    excerpt:
      "Chuyển từ canh tác thông thường sang hữu cơ là quá trình nhiều năm. Bài viết so sánh thời gian chuyển đổi theo USDA, EU, JAS, gợi ý lộ trình từng năm, kỳ vọng thực tế về năng suất – chi phí và những sai lầm khiến nông hộ bỏ cuộc giữa chừng.",
    content: `
<p>Chuyển đổi sang canh tác hữu cơ hiếm khi là một bước ngoặt đột ngột. Với hầu hết nông hộ, đó là một quá trình kéo dài nhiều năm, trong đó đất, cây trồng và cả thói quen canh tác đều phải thích nghi dần với một cách làm nông khác. Hiểu rõ lộ trình này giúp người sản xuất chuẩn bị tâm lý và tài chính cho giai đoạn khó khăn nhất: những năm đầu.</p>

<h2>Vì sao cần một giai đoạn chuyển đổi</h2>
<p>Đất canh tác thông thường trong thời gian dài thường phụ thuộc vào phân bón hòa tan nhanh và thuốc bảo vệ thực vật tổng hợp. Khi ngừng sử dụng các đầu vào này, hệ sinh vật đất cần thời gian phục hồi, hàm lượng chất hữu cơ cần được xây dựng lại, và quần thể thiên địch cần tái lập. Phần lớn tiêu chuẩn hữu cơ quốc tế vì thế yêu cầu một khoảng thời gian chuyển đổi trước khi sản phẩm được chứng nhận, thường tính từ lần cuối cùng sử dụng vật tư bị cấm.</p>
<p>Giai đoạn này còn có một chức năng ít được nhắc tới: đó là thời gian để tổ chức chứng nhận kiểm chứng rằng hệ thống quản lý của trang trại thực sự vận hành — nhật ký được ghi đều, vật tư đầu vào được kiểm soát, rủi ro nhiễm chéo từ ruộng bên cạnh được xử lý — chứ không chỉ tồn tại trên giấy.</p>

<h2>Thời gian chuyển đổi theo các tiêu chuẩn</h2>
<table>
<tr><th>Tiêu chuẩn</th><th>Cây hằng năm</th><th>Cây lâu năm</th><th>Ghi chú</th></tr>
<tr><th>USDA Organic (Hoa Kỳ)</th><td>Không dùng chất cấm trong 36 tháng trước vụ thu hoạch hữu cơ đầu tiên</td><td>Như cây hằng năm: 36 tháng trước vụ thu hoạch</td><td>Thời gian trước khi nộp hồ sơ được tính nếu có hồ sơ chứng minh</td></tr>
<tr><th>EU Organic (Quy định 2018/848)</th><td>Ít nhất 2 năm trước khi gieo trồng</td><td>Ít nhất 3 năm trước vụ thu hoạch đầu tiên</td><td>Cơ quan có thẩm quyền có thể công nhận hồi tố trong một số trường hợp có bằng chứng</td></tr>
<tr><th>JAS Organic (Nhật Bản)</th><td>Ít nhất 2 năm trước khi gieo trồng</td><td>Ít nhất 3 năm trước vụ thu hoạch đầu tiên</td><td>Sản phẩm phải mang JAS Mark mới được bán là hữu cơ tại Nhật</td></tr>
</table>
<p>Tại Việt Nam, TCVN 11041-2:2017 (phần trồng trọt hữu cơ của bộ TCVN 11041) cũng quy định thời gian chuyển đổi riêng cho nhóm cây hằng năm và cây lâu năm. Vì thị trường đích quyết định tiêu chuẩn áp dụng, người sản xuất nên xác định sớm sẽ bán đi đâu, rồi đối chiếu trực tiếp với văn bản tiêu chuẩn và tổ chức chứng nhận được chỉ định cho thị trường đó.</p>

<h2>Lộ trình gợi ý theo từng năm</h2>
<h3>Năm 0 — chuẩn bị (khoảng 3–6 tháng)</h3>
<ul>
<li><strong>Đánh giá hiện trạng đất và nước:</strong> lấy mẫu phân tích để biết điểm xuất phát về dinh dưỡng, độ pH, chất hữu cơ, đồng thời kiểm tra nguồn nước tưới.</li>
<li><strong>Xác định nguồn gây nhiễm:</strong> ruộng lân cận, kênh mương dùng chung, đường phun thuốc từ khu vực xung quanh; lên phương án vùng đệm.</li>
<li><strong>Chọn diện tích thí điểm:</strong> bắt đầu trên một phần trang trại, thửa có đất tốt nhất và dễ cách ly nhất.</li>
<li><strong>Tìm đầu ra trước khi trồng:</strong> trao đổi với người mua về tiêu chuẩn họ yêu cầu, sản lượng, giá và khả năng bao tiêu.</li>
<li><strong>Bắt đầu ghi nhật ký đồng ruộng:</strong> mọi hoạt động, vật tư và thu hoạch đều cần được ghi lại ngay từ đầu.</li>
</ul>
<h3>Năm 1 — ngừng vật tư bị cấm, xây nền đất</h3>
<p>Đây là năm thay đổi lớn nhất. Phân bón hóa học được thay bằng phân hữu cơ đã ủ hoai hoặc đã qua xử lý, phân xanh và cây che phủ; thuốc bảo vệ thực vật tổng hợp được thay bằng biện pháp phòng ngừa và chế phẩm được phép. Vì dinh dưỡng từ phân hữu cơ giải phóng chậm, cây có thể thiếu đạm cục bộ ở giai đoạn sinh trưởng mạnh, nên cần bón lót đầy đủ và theo dõi cây sát hơn. Lập kế hoạch luân canh, đưa cây họ đậu và cây che phủ vào hệ thống để cải tạo đất.</p>
<h3>Năm 2 — ổn định hệ thống, chuẩn bị đánh giá</h3>
<p>Quần thể thiên địch bắt đầu tái lập, đất tơi xốp hơn, người làm đã quen với lịch thăm đồng và ghi chép. Trang trại nộp hồ sơ đăng ký chứng nhận (nếu chưa), hoàn thiện kế hoạch sản xuất hữu cơ bằng văn bản và đón cuộc đánh giá đầu tiên. Những điểm không phù hợp phát hiện ở lần này là cơ hội sửa trước khi sản phẩm được chứng nhận.</p>
<h3>Năm 3 trở đi — chứng nhận và mở rộng</h3>
<p>Khi đủ thời gian chuyển đổi theo tiêu chuẩn áp dụng, sản phẩm được bán với tư cách hữu cơ. Với cây lâu năm như cây có múi, sầu riêng, cà phê, mốc này thường đến muộn hơn cây hằng năm. Từ đây, trang trại có dữ liệu thực tế của chính mình để quyết định mở rộng diện tích chuyển đổi theo từng đợt.</p>

<h2>Năng suất và chi phí: kỳ vọng thực tế</h2>
<p>Các phân tích tổng hợp quốc tế cho thấy năng suất hữu cơ trung bình thấp hơn canh tác thông thường, nhưng mức chênh lệch phụ thuộc lớn vào loại cây và cách quản lý. Nghiên cứu của Seufert và cộng sự đăng trên tạp chí Nature năm 2012 ghi nhận mức chênh trung bình khoảng 25%, nhỏ hơn đáng kể với cây họ đậu và cây lâu năm. Phân tích của Ponisio và cộng sự năm 2015 (Proceedings of the Royal Society B) cho mức chênh khoảng 19%, và mức này thu hẹp còn khoảng 8–9% khi trang trại áp dụng xen canh và luân canh đa dạng.</p>
<table>
<tr><th>Hạng mục</th><th>Năm 1</th><th>Năm 2</th><th>Năm 3 trở đi</th></tr>
<tr><th>Năng suất</th><td>Thường giảm, nhất là cây cần nhiều đạm</td><td>Bắt đầu phục hồi khi đất cải thiện</td><td>Ổn định dần; mức cụ thể tùy cây và quản lý</td></tr>
<tr><th>Giá bán</th><td>Giá thông thường</td><td>Giá thông thường hoặc giá "đang chuyển đổi" ở một số thị trường</td><td>Giá hữu cơ nếu có hợp đồng đầu ra</td></tr>
<tr><th>Chi phí vật tư</th><td>Giảm phân, thuốc hóa học; tăng phân hữu cơ, chế phẩm sinh học</td><td>Tương tự năm 1</td><td>Giảm dần khi đất tự cung cấp dinh dưỡng tốt hơn</td></tr>
<tr><th>Công lao động</th><td>Tăng mạnh (làm cỏ, thăm đồng, ghi chép)</td><td>Vẫn cao, bắt đầu có kinh nghiệm</td><td>Giảm dần khi quy trình thành nếp</td></tr>
<tr><th>Chi phí chứng nhận</th><td>Có thể chưa phát sinh</td><td>Phí đánh giá lần đầu</td><td>Phí đánh giá định kỳ hằng năm</td></tr>
</table>

<h2>Bán gì trong thời gian chuyển đổi</h2>
<p>Đây là câu hỏi thực tế nhất với nông hộ. EU cho phép ghi nhãn "sản phẩm đang chuyển đổi" (in-conversion) cho một số sản phẩm thực vật đáp ứng điều kiện về thời gian; chương trình hữu cơ quốc gia của Hoa Kỳ không có nhãn tương đương. Trong nước, nhiều hộ duy trì bán qua kênh thông thường hoặc bán như sản phẩm an toàn có chứng nhận VietGAP trong lúc chờ. Cách bền vững nhất vẫn là tìm được người mua sẵn sàng đồng hành từ đầu, chấp nhận ký hợp đồng cho sản phẩm đang chuyển đổi để giữ nguồn cung ổn định về sau.</p>

<h2>Chính sách hỗ trợ tại Việt Nam</h2>
<p>Nghị định 109/2018/NĐ-CP về nông nghiệp hữu cơ có các chính sách khuyến khích sản xuất hữu cơ, trong đó có hỗ trợ một phần chi phí như phân tích mẫu đất, nước và chi phí chứng nhận. Quyết định 885/QĐ-TTg ngày 23/6/2020 phê duyệt Đề án phát triển nông nghiệp hữu cơ giai đoạn 2020–2030, đặt mục tiêu đến năm 2030 diện tích đất sản xuất nông nghiệp hữu cơ đạt khoảng 2,5–3% tổng diện tích đất sản xuất nông nghiệp. Mức hỗ trợ và điều kiện cụ thể thay đổi theo địa phương, nên nông hộ, hợp tác xã nên hỏi trực tiếp Sở Nông nghiệp và Môi trường tỉnh trước khi lập kế hoạch tài chính.</p>

<h2>Những sai lầm khiến nông hộ bỏ cuộc</h2>
<ul>
<li><strong>Chuyển đổi toàn bộ diện tích cùng lúc:</strong> khi năng suất giảm, cả nguồn thu của gia đình bị ảnh hưởng, không còn khoảng đệm tài chính.</li>
<li><strong>Trồng trước, tìm người mua sau:</strong> đến khi có sản phẩm mới phát hiện người mua cần tiêu chuẩn khác, hoặc không cần sản lượng đó.</li>
<li><strong>Thay hóa chất bằng "thuốc sinh học" không rõ nguồn gốc:</strong> một số sản phẩm trên thị trường không nằm trong danh mục được phép, có thể làm hỏng cả quá trình chuyển đổi.</li>
<li><strong>Ghi chép đối phó:</strong> nhật ký viết bù trước ngày đánh giá thường không khớp với hóa đơn vật tư và dễ bị phát hiện.</li>
<li><strong>Bỏ qua nguồn nhiễm từ bên ngoài:</strong> nước tưới chung kênh, thuốc trôi dạt từ ruộng bên cạnh là nguyên nhân phổ biến của mẫu kiểm nghiệm không đạt.</li>
</ul>
<p>Áp lực dịch hại có thể tăng tạm thời trước khi hệ sinh thái cân bằng trở lại. Đây là giai đoạn nhiều nông hộ bỏ cuộc, nên việc chuẩn bị nguồn lực dự phòng và bắt đầu trên một diện tích vừa phải sẽ an toàn hơn là chuyển đổi toàn bộ trang trại cùng lúc.</p>

<h2>Nhìn về dài hạn</h2>
<p>Sau giai đoạn chuyển đổi, nhiều trang trại ghi nhận đất giữ ẩm tốt hơn, ít phụ thuộc đầu vào mua ngoài hơn và giá bán ổn định hơn nhờ hợp đồng với người mua có nhu cầu rõ ràng. Canh tác hữu cơ không phải là quay lại cách làm cũ, mà là một hệ thống quản lý đòi hỏi quan sát nhiều hơn và can thiệp đúng lúc hơn.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=194623" rel="noopener nofollow" target="_blank">Nghị định 109/2018/NĐ-CP ngày 29/8/2018 về Nông nghiệp hữu cơ</a>.</li>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=200315" rel="noopener nofollow" target="_blank">Quyết định 885/QĐ-TTg ngày 23/6/2020 — Đề án phát triển nông nghiệp hữu cơ giai đoạn 2020–2030</a>.</li>
<li><a href="https://tcvn.gov.vn/gioi-thieu-tong-quan-he-thong-tieu-chuan-ve-san-pham-nong-nghiep-huu-co/13/10/2022/" rel="noopener nofollow" target="_blank">Giới thiệu hệ thống TCVN 11041 về nông nghiệp hữu cơ</a> — Ủy ban Tiêu chuẩn Đo lường Chất lượng Quốc gia.</li>
<li><a href="https://eur-lex.europa.eu/eli/reg/2018/848/oj" rel="noopener nofollow" target="_blank">Regulation (EU) 2018/848 on organic production and labelling</a>.</li>
<li><a href="https://www.ecfr.gov/current/title-7/subtitle-B/chapter-I/subchapter-M/part-205" rel="noopener nofollow" target="_blank">7 CFR Part 205 — National Organic Program (USDA)</a>.</li>
<li><a href="https://doi.org/10.1038/nature11069" rel="noopener nofollow" target="_blank">Seufert, Ramankutty &amp; Foley (2012). Comparing the yields of organic and conventional agriculture. Nature</a>.</li>
<li><a href="https://doi.org/10.1098/rspb.2014.1396" rel="noopener nofollow" target="_blank">Ponisio và cộng sự (2015). Diversification practices reduce organic to conventional yield gap. Proc. R. Soc. B</a>.</li>
</ul>
`,
  },

  "suc-khoe-dat-la-nen-tang-chat-huu-co-vi-sinh-vat-va-do-phi-tu-nhien": {
    excerpt:
      "Trong canh tác hữu cơ, đất là một hệ sống cần được nuôi dưỡng. Bài viết giải thích vai trò của chất hữu cơ và sinh vật đất, cách đọc phiếu phân tích đất, những lưu ý riêng cho đất phèn, đất xám và đất đỏ bazan ở Việt Nam, cùng vài phép thử đơn giản ngay tại ruộng.",
    content: `
<p>Một nguyên tắc xuyên suốt canh tác hữu cơ là "nuôi đất để đất nuôi cây". Thay vì cung cấp dinh dưỡng hòa tan trực tiếp cho cây theo từng đợt, người làm hữu cơ tập trung xây dựng một nền đất khỏe, nơi các quá trình sinh học tự nhiên giải phóng dinh dưỡng dần dần theo nhu cầu của cây. Bộ nguyên tắc của Liên đoàn Quốc tế các Phong trào Nông nghiệp Hữu cơ (IFOAM) đặt "sức khỏe" lên hàng đầu, và sức khỏe đó bắt đầu từ đất.</p>

<h2>Chất hữu cơ trong đất</h2>
<p>Chất hữu cơ là phần đất bắt nguồn từ xác thực vật, động vật và vi sinh vật ở các mức độ phân hủy khác nhau. Nó ảnh hưởng đến gần như mọi tính chất quan trọng của đất: khả năng giữ nước, độ tơi xốp, khả năng trao đổi dinh dưỡng và sức chống chịu xói mòn. Xây dựng chất hữu cơ là công việc nhiều năm, thông qua bón phân hữu cơ, vùi tàn dư cây trồng, trồng cây che phủ và hạn chế làm đất quá mức.</p>
<p>Có thể hình dung chất hữu cơ gồm hai phần. Phần "hoạt động" — tàn dư tươi, phân mới bón, sinh khối vi sinh vật — phân giải nhanh trong vài tháng đến vài năm và là nguồn dinh dưỡng trực tiếp cho cây. Phần "ổn định" (mùn) phân giải rất chậm, quyết định khả năng giữ nước và giữ dinh dưỡng lâu dài. Một chương trình bón phân hữu cơ tốt cần nuôi cả hai: bón đều đặn để duy trì phần hoạt động, và giữ tàn dư, che phủ để tích lũy dần phần ổn định.</p>

<h2>Hệ sinh vật đất</h2>
<p>Mỗi gram đất khỏe chứa một quần thể vi khuẩn, nấm, động vật nguyên sinh và tuyến trùng đông đảo, cùng giun đất và các loài chân khớp nhỏ. Báo cáo của FAO năm 2020 về hiện trạng đa dạng sinh học đất nhấn mạnh rằng phần lớn các chức năng mà nông nghiệp cần — phân giải chất hữu cơ, chu trình dinh dưỡng, hình thành cấu trúc đất, kiểm soát mầm bệnh — đều do các sinh vật này thực hiện.</p>
<ul>
<li><strong>Vi khuẩn:</strong> phân giải chất hữu cơ dễ tiêu; một số nhóm cố định đạm từ không khí (sống tự do hoặc cộng sinh trong nốt sần cây họ đậu).</li>
<li><strong>Nấm:</strong> phân giải chất khó phân hủy như lignin; nấm rễ cộng sinh mở rộng đáng kể vùng đất mà rễ khai thác, giúp cây hút lân và nước.</li>
<li><strong>Động vật nguyên sinh và tuyến trùng có lợi:</strong> ăn vi khuẩn, nấm và qua đó giải phóng đạm ở dạng cây dùng được.</li>
<li><strong>Giun đất:</strong> đào hang giúp đất thoáng khí, thấm nước; phân giun là dạng chất hữu cơ giàu dinh dưỡng và có cấu trúc tốt.</li>
</ul>
<p>Khi ngừng dùng hóa chất tổng hợp và duy trì nguồn thức ăn hữu cơ ổn định, quần thể này thường phục hồi rõ rệt.</p>

<h2>Đọc phiếu phân tích đất</h2>
<p>Phân tích đất định kỳ là cách khách quan nhất để biết đất đang tốt lên hay xấu đi. Một phiếu kết quả thường có các chỉ tiêu sau:</p>
<table>
<tr><th>Chỉ tiêu</th><th>Ý nghĩa</th><th>Gợi ý trong canh tác hữu cơ</th></tr>
<tr><th>pH (H₂O hoặc KCl)</th><td>Độ chua của đất, ảnh hưởng đến khả năng hòa tan dinh dưỡng. pH KCl thường thấp hơn pH H₂O</td><td>Phần lớn cây trồng phát triển tốt khi pH khoảng 5,5–7; đất chua có thể bón vôi, dolomite nguồn gốc tự nhiên</td></tr>
<tr><th>Carbon hữu cơ (OC) hoặc chất hữu cơ (OM)</th><td>Mức tích lũy hữu cơ. Có thể quy đổi gần đúng OM ≈ OC × 1,72</td><td>Chỉ số quan trọng nhất để theo dõi qua nhiều năm</td></tr>
<tr><th>Đạm tổng số (N)</th><td>Lượng đạm dự trữ, phần lớn nằm trong chất hữu cơ</td><td>Dùng cùng OC để ước tính tỷ lệ C/N của đất</td></tr>
<tr><th>Lân, kali dễ tiêu</th><td>Phần dinh dưỡng cây có thể sử dụng trong ngắn hạn</td><td>Lân quá cao sau nhiều năm bón phân chuồng là dấu hiệu cần giảm lượng bón</td></tr>
<tr><th>CEC (dung tích trao đổi cation)</th><td>Khả năng "giữ" dinh dưỡng của đất</td><td>Đất cát, đất xám có CEC thấp, càng cần tăng chất hữu cơ</td></tr>
<tr><th>EC (độ dẫn điện)</th><td>Phản ánh hàm lượng muối hòa tan</td><td>Theo dõi sát ở vùng ven biển chịu xâm nhập mặn</td></tr>
</table>
<p>Để so sánh được qua các năm, nên lấy mẫu cùng vị trí, cùng thời điểm trong năm, cùng độ sâu (thường 0–20 cm với cây hằng năm; với cây lâu năm lấy theo vành tán) và gửi cùng một phòng thí nghiệm.</p>

<h2>Lưu ý theo loại đất ở Việt Nam</h2>
<ul>
<li><strong>Đất phèn (Đồng Tháp Mười, Tứ giác Long Xuyên, bán đảo Cà Mau):</strong> tránh để tầng phèn tiềm tàng bị phơi khô và ô-xy hóa, vì sẽ sinh chua mạnh. Quản lý nước, lên liếp, bón vôi và tăng chất hữu cơ là các biện pháp chính.</li>
<li><strong>Đất xám bạc màu (Đông Nam Bộ, trung du phía Bắc):</strong> thành phần cát cao, nghèo hữu cơ, giữ nước và dinh dưỡng kém. Che phủ mặt đất và bón phân hữu cơ đều đặn mang lại hiệu quả rõ nhất.</li>
<li><strong>Đất đỏ bazan (Tây Nguyên, một phần Đông Nam Bộ):</strong> cấu trúc tốt, tầng dày, nhưng thường chua và dễ xói mòn trên đất dốc. Cây che phủ, băng cây chắn theo đường đồng mức giúp giữ lớp đất mặt cho cà phê, hồ tiêu, sầu riêng.</li>
<li><strong>Đất ven biển chịu ảnh hưởng mặn:</strong> chất hữu cơ giúp cải thiện cấu trúc và đệm cho rễ, nhưng gốc rễ của vấn đề vẫn là quản lý nước — trữ nước ngọt, theo dõi độ mặn trước khi tưới trong mùa khô.</li>
</ul>

<h2>Những thực hành nuôi dưỡng đất</h2>
<ul>
<li>Bón phân hữu cơ đã hoai mục hoặc đã qua xử lý đúng cách thay vì phân tươi.</li>
<li>Giữ đất luôn có lớp phủ, bằng cây trồng hoặc tàn dư, để bảo vệ bề mặt khỏi mưa lớn và nắng gắt.</li>
<li>Luân canh đa dạng, xen cây họ đậu để bổ sung đạm sinh học.</li>
<li>Hạn chế cày xới sâu và thường xuyên, vốn làm mất chất hữu cơ và phá vỡ mạng nấm.</li>
<li>Tránh để đất bị nén do máy móc nặng khi đất ướt.</li>
<li>Tận dụng nguồn hữu cơ tại chỗ như rơm rạ, trấu, vỏ cà phê sau khi ủ, thay vì đốt bỏ.</li>
</ul>

<h2>Vài phép thử đơn giản ngay tại ruộng</h2>
<p>Không phải lúc nào cũng cần phòng thí nghiệm. Một số quan sát đơn giản, nếu ghi lại đều đặn, cho biết khá nhiều về xu hướng của đất:</p>
<ol>
<li><strong>Đếm giun đất:</strong> đào một khối đất khoảng một xẻng sâu, đếm số giun. Số giun tăng qua các năm là dấu hiệu tốt.</li>
<li><strong>Thử độ thấm:</strong> đổ một lượng nước cố định vào ống hở hai đầu cắm xuống đất, ghi thời gian nước thấm hết. Đất khỏe thấm nhanh hơn và không đọng vũng sau mưa.</li>
<li><strong>Thử độ bền cục đất:</strong> thả một cục đất khô vào cốc nước. Cục đất giữ hình dạng là đất có cấu trúc tốt; tan rã nhanh là đất thiếu chất kết dính hữu cơ.</li>
<li><strong>Quan sát rễ:</strong> nhổ thử vài cây, xem rễ có phát triển sâu, nhiều rễ tơ, hay bị gấp khúc do tầng đất cứng.</li>
</ol>

<h2>Đất và khí hậu</h2>
<p>Đất là kho chứa carbon lớn trên cạn. Sáng kiến "4 phần nghìn" (4 per 1000) khởi xướng tại Hội nghị COP21 ở Paris năm 2015 lấy ý tưởng rằng chỉ cần tăng lượng carbon hữu cơ trong đất thêm 0,4% mỗi năm cũng có ý nghĩa đáng kể đối với lượng CO₂ trong khí quyển. Với người sản xuất, lợi ích trực tiếp hơn là đất giàu hữu cơ chịu hạn, chịu mưa lớn tốt hơn — điều ngày càng quan trọng khi thời tiết thất thường.</p>

<h2>Kiên nhẫn và quan sát</h2>
<p>Độ phì tự nhiên không tăng nhanh trong một vụ. Nhưng khi nền đất đã khỏe, cây trồng chống chịu sâu bệnh và thời tiết bất lợi tốt hơn, nhu cầu tưới và bón giảm, và chi phí sản xuất theo thời gian trở nên ổn định hơn. Đây là lý do các trang trại hữu cơ lâu năm thường xem việc đo lường chất hữu cơ định kỳ là một chỉ số quản trị quan trọng.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://doi.org/10.4060/cb1928en" rel="noopener nofollow" target="_blank">FAO, ITPS, GSBI, SCBD &amp; EC (2020). State of knowledge of soil biodiversity — Status, challenges and potentialities</a>.</li>
<li><a href="https://www.sare.org/resources/building-soils-for-better-crops/" rel="noopener nofollow" target="_blank">SARE — Building Soils for Better Crops</a>.</li>
<li><a href="https://4p1000.org/" rel="noopener nofollow" target="_blank">Sáng kiến quốc tế "4 per 1000"</a>.</li>
<li><a href="https://tcvn.gov.vn/gioi-thieu-tong-quan-he-thong-tieu-chuan-ve-san-pham-nong-nghiep-huu-co/13/10/2022/" rel="noopener nofollow" target="_blank">Giới thiệu hệ thống TCVN 11041 về nông nghiệp hữu cơ</a> — Ủy ban Tiêu chuẩn Đo lường Chất lượng Quốc gia.</li>
<li><a href="https://mae.gov.vn/" rel="noopener nofollow" target="_blank">Bộ Nông nghiệp và Môi trường</a>.</li>
</ul>
`,
  },

  "quan-ly-dich-hai-trong-canh-tac-huu-co-ma-khong-dung-hoa-chat-tong-hop": {
    excerpt:
      "Không dùng thuốc trừ sâu tổng hợp không có nghĩa là buông xuôi trước dịch hại. Bài viết trình bày chiến lược phòng ngừa bốn lớp, các mô hình đã áp dụng ở Việt Nam như công nghệ sinh thái trên lúa, kiến vàng trên cây có múi, và bảng các tác nhân sinh học thường dùng.",
    content: `
<p>Một hiểu lầm phổ biến là canh tác hữu cơ đồng nghĩa với việc chấp nhận thiệt hại do sâu bệnh. Thực tế, hệ thống hữu cơ dựa trên một chiến lược phòng ngừa nhiều lớp, trong đó việc phun bất kỳ chế phẩm nào chỉ là biện pháp cuối cùng khi các lớp trước đó không đủ. Cách tiếp cận này không xa lạ với nông dân Việt Nam: chương trình Quản lý dịch hại tổng hợp (IPM) quốc gia được triển khai từ đầu những năm 1990, cùng các lớp huấn luyện nông dân trên đồng ruộng, đã xây dựng nền tảng cho nhiều thực hành mà canh tác hữu cơ đang kế thừa.</p>
<p>Các tiêu chuẩn hữu cơ cũng quy định rõ thứ tự ưu tiên. Chẳng hạn, chương trình hữu cơ của Hoa Kỳ (7 CFR 205.206) yêu cầu trước hết dùng biện pháp canh tác, sinh học và cơ giới; chỉ khi các biện pháp đó không đủ mới được dùng chất trong danh mục cho phép, và phải ghi rõ điều kiện sử dụng trong kế hoạch sản xuất hữu cơ.</p>

<h2>Lớp thứ nhất: phòng ngừa bằng thiết kế hệ thống</h2>
<p>Chọn giống phù hợp điều kiện địa phương và có khả năng kháng bệnh, bố trí thời vụ để né đỉnh phát sinh của dịch hại chính, luân canh để cắt vòng đời sâu bệnh trong đất, và giữ khoảng cách trồng hợp lý để tán cây thông thoáng. Phần lớn vấn đề dịch hại nghiêm trọng có thể được giảm nhẹ ngay từ khâu quy hoạch mùa vụ.</p>
<ul>
<li><strong>Với lúa:</strong> gieo sạ đồng loạt theo lịch "né rầy" do ngành nông nghiệp địa phương khuyến cáo, không sạ quá dày, không bón thừa đạm — ruộng lúa xanh đậm, rậm rạp là môi trường lý tưởng cho rầy nâu và bệnh đạo ôn.</li>
<li><strong>Với cây ăn trái:</strong> tỉa cành sau thu hoạch cho tán thông thoáng, thu dọn trái rụng (nơi ruồi đục trái và sâu đục trái hóa nhộng), giữ thoát nước tốt để hạn chế bệnh thối rễ.</li>
<li><strong>Với rau màu:</strong> dùng cây giống sạch bệnh, luân canh khác họ, làm luống cao trong mùa mưa.</li>
</ul>

<h2>Lớp thứ hai: khuyến khích thiên địch</h2>
<p>Bọ rùa, ong ký sinh, nhện, bọ xít bắt mồi, chim và nhiều loài khác kiểm soát dịch hại tự nhiên nếu môi trường sống của chúng được duy trì. Trồng dải hoa ven ruộng, giữ hàng rào cây bụi, hạn chế xáo trộn đất và tránh các chế phẩm phổ rộng giết cả thiên địch là những cách nuôi dưỡng lực lượng kiểm soát sinh học này.</p>
<h3>Công nghệ sinh thái trên lúa</h3>
<p>Ở Đồng bằng sông Cửu Long, mô hình "công nghệ sinh thái" — trồng hoa như sao nhái, đậu bắp, mè trên bờ ruộng — được thử nghiệm tại Tiền Giang từ cuối những năm 2000 với hỗ trợ kỹ thuật của Viện Nghiên cứu Lúa Quốc tế (IRRI) và sau đó được nhân rộng ra nhiều tỉnh. Hoa cung cấp mật và phấn cho ong ký sinh, giúp chúng sống lâu hơn và ký sinh nhiều trứng sâu, rầy hơn; nông dân nhờ đó giảm được số lần phun thuốc.</p>
<h3>Kiến vàng trên cây có múi</h3>
<p>Nuôi kiến vàng trong vườn cam, quýt, bưởi là kinh nghiệm truyền thống lâu đời của nông dân miền Tây, đã được nhiều nghiên cứu ghi nhận. Kiến vàng tuần tra tán cây và săn nhiều loài sâu, bọ xít gây hại. Người trồng thường bắc cầu dây nối các cây để kiến di chuyển, và cung cấp thêm thức ăn trong mùa khan hiếm. Cần lưu ý kiến vàng có thể "chăn" rệp sáp, rệp mềm để lấy dịch ngọt, nên phải theo dõi mật độ rệp trong vườn.</p>

<h2>Lớp thứ ba: giám sát và ngưỡng hành động</h2>
<p>Người làm hữu cơ thường thăm đồng thường xuyên, đặt bẫy theo dõi và ghi lại mật độ dịch hại. Chỉ khi mật độ vượt ngưỡng có thể gây thiệt hại kinh tế thì mới can thiệp. Việc phun phòng theo lịch cố định, không dựa trên quan sát, không phù hợp với nguyên tắc hữu cơ.</p>
<ul>
<li><strong>Bẫy đèn:</strong> theo dõi rầy nâu, sâu cuốn lá trưởng thành vào đèn để dự báo đợt nở rộ. Hệ thống bẫy đèn của ngành bảo vệ thực vật địa phương phát thông báo định kỳ — một nguồn thông tin miễn phí nên tận dụng.</li>
<li><strong>Bẫy dính màu vàng:</strong> theo dõi rệp, bọ phấn, bọ trĩ trên rau và cây ăn trái.</li>
<li><strong>Bẫy dẫn dụ:</strong> bẫy pheromone theo dõi sâu tơ, sâu khoang; bẫy chất dẫn dụ cho ruồi đục trái trên xoài, ổi, thanh long.</li>
<li><strong>Thăm đồng theo điểm cố định:</strong> kiểm tra số cây, số lá nhất định ở các điểm cố định mỗi tuần để số liệu so sánh được qua thời gian.</li>
</ul>

<h2>Lớp thứ tư: biện pháp trực tiếp được phép</h2>
<ul>
<li>Bắt bằng tay, bẫy dính, bẫy pheromone, lưới chắn côn trùng trong nhà lưới.</li>
<li>Bao trái cho xoài, ổi, bưởi, mãng cầu để ngăn ruồi đục trái và sâu đục trái.</li>
<li>Thiên địch nhân nuôi thả bổ sung.</li>
<li>Chế phẩm sinh học và một số hoạt chất có nguồn gốc tự nhiên nằm trong danh mục được tiêu chuẩn cho phép, ví dụ chế phẩm vi khuẩn Bt, spinosad, dầu neem (azadirachtin), lưu huỳnh. Các hợp chất đồng được phép có giới hạn: tại EU, lượng đồng bị giới hạn ở 28 kg/ha trong 7 năm.</li>
</ul>

<h2>Các tác nhân sinh học thường dùng</h2>
<table>
<tr><th>Tác nhân</th><th>Đối tượng chính</th><th>Lưu ý khi sử dụng</th></tr>
<tr><th>Ong mắt đỏ (<em>Trichogramma</em>)</th><td>Trứng sâu bộ cánh vảy: sâu đục thân, sâu cuốn lá, sâu đục trái</td><td>Thả đúng thời điểm sâu đẻ trứng, dựa vào số liệu bẫy đèn</td></tr>
<tr><th>Vi khuẩn <em>Bacillus thuringiensis</em> (Bt)</th><td>Sâu non bộ cánh vảy: sâu tơ, sâu xanh, sâu khoang</td><td>Hiệu quả nhất với sâu tuổi nhỏ; dễ bị tia UV phân hủy, nên phun chiều mát</td></tr>
<tr><th>Nấm xanh (<em>Metarhizium</em>)</th><td>Rầy nâu, bọ cánh cứng, một số loài sâu trong đất</td><td>Cần ẩm độ cao để bào tử nảy mầm; tác động chậm hơn thuốc hóa học</td></tr>
<tr><th>Nấm trắng (<em>Beauveria bassiana</em>)</th><td>Rầy, rệp, bọ xít, bọ trĩ</td><td>Tránh phun cùng lúc với chế phẩm diệt nấm</td></tr>
<tr><th>Nấm đối kháng <em>Trichoderma</em></th><td>Nấm bệnh vùng rễ: thối rễ, chết nhanh, lở cổ rễ</td><td>Thường trộn vào phân hữu cơ khi ủ hoặc bón cùng phân hữu cơ đã hoai</td></tr>
<tr><th>Kiến vàng, bọ rùa, nhện</th><td>Sâu, bọ xít, rệp, rầy</td><td>Duy trì nơi trú ẩn, tránh chế phẩm phổ rộng</td></tr>
</table>

<h2>Kiểm tra trước khi dùng bất kỳ chế phẩm nào</h2>
<p>Một sản phẩm được quảng cáo là "sinh học" chưa chắc đã được phép dùng trong sản xuất hữu cơ. Người sản xuất cần kiểm tra hai lớp: sản phẩm có trong danh mục thuốc bảo vệ thực vật được phép sử dụng tại Việt Nam hay không, và hoạt chất cùng các phụ gia có nằm trong danh mục được phép của tiêu chuẩn hữu cơ đang áp dụng hay không. Tốt nhất là gửi nhãn và bảng thành phần cho tổ chức chứng nhận xác nhận trước khi mua. Mọi vật tư dùng để xử lý dịch hại đều phải được ghi vào nhật ký đồng ruộng: tên sản phẩm, lô, liều lượng, ngày dùng, thửa áp dụng và lý do sử dụng.</p>

<h2>Chấp nhận một mức thiệt hại</h2>
<p>Hệ thống hữu cơ không đặt mục tiêu diệt sạch dịch hại mà giữ chúng dưới ngưỡng gây hại. Một quần thể dịch hại nhỏ còn cần thiết để duy trì nguồn thức ăn cho thiên địch. Thay đổi tư duy từ "tiêu diệt" sang "cân bằng" là bước chuyển quan trọng nhất khi làm quen với canh tác hữu cơ.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://www.ecfr.gov/current/title-7/subtitle-B/chapter-I/subchapter-M/part-205" rel="noopener nofollow" target="_blank">7 CFR Part 205 — National Organic Program (USDA), mục 205.206 về quản lý dịch hại, cỏ dại, bệnh hại</a>.</li>
<li><a href="https://eur-lex.europa.eu/eli/reg/2018/848/oj" rel="noopener nofollow" target="_blank">Regulation (EU) 2018/848 on organic production and labelling</a>.</li>
<li><a href="https://www.sare.org/resources/manage-insects-on-your-farm/" rel="noopener nofollow" target="_blank">SARE — Manage Insects on Your Farm: A Guide to Ecological Strategies</a>.</li>
<li><a href="https://www.ppd.gov.vn/" rel="noopener nofollow" target="_blank">Cục Trồng trọt và Bảo vệ thực vật</a> — danh mục thuốc bảo vệ thực vật được phép sử dụng, thông báo dịch hại.</li>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=194623" rel="noopener nofollow" target="_blank">Nghị định 109/2018/NĐ-CP về Nông nghiệp hữu cơ</a>.</li>
</ul>
`,
  },

  "phan-bon-huu-co-phan-loai-cach-u-hoai-va-nguyen-tac-su-dung": {
    excerpt:
      "Phân chuồng, phân gà, phân ủ compost, phân xanh và phân hữu cơ chế biến có vai trò khác nhau. Bài viết so sánh các nhóm phân, hướng dẫn ủ hoai theo tỷ lệ C/N, quy định về phân chuồng của USDA và EU, cách đọc nhãn phân bón tại Việt Nam và những sai lầm thường gặp khi bón.",
    content: `
<p>Trong canh tác hữu cơ, phân bón không chỉ cung cấp dinh dưỡng mà còn là thức ăn cho hệ sinh vật đất. Việc chọn loại phân, xử lý trước khi bón và bón đúng thời điểm ảnh hưởng trực tiếp đến hiệu quả và đến khả năng vượt qua các cuộc đánh giá chứng nhận.</p>

<h2>Các nhóm phân hữu cơ phổ biến</h2>
<table>
<tr><th>Nhóm phân</th><th>Đặc điểm</th><th>Lưu ý khi dùng</th></tr>
<tr><th>Phân bò, phân trâu</th><td>Dinh dưỡng vừa phải, nhiều chất xơ, cải tạo cấu trúc đất tốt</td><td>Phải ủ hoai để diệt hạt cỏ dại và mầm bệnh; dùng lượng lớn</td></tr>
<tr><th>Phân gà, phân gia cầm</th><td>Giàu đạm và lân hơn phân gia súc; đạm chuyển hóa nhanh nên phân được gọi là "nóng"</td><td>Không bón phân tươi; dùng dạng đã ủ, lên men hoặc sấy; không để sát gốc cây non</td></tr>
<tr><th>Phân heo</th><td>Giàu dinh dưỡng, ẩm, mùi mạnh</td><td>Nguy cơ mầm bệnh cao; có thể chứa đồng, kẽm từ thức ăn chăn nuôi — nên biết nguồn gốc</td></tr>
<tr><th>Phân ủ compost</th><td>Hỗn hợp nguyên liệu hữu cơ ủ có kiểm soát nhiệt độ và độ ẩm</td><td>An toàn, ổn định; chất lượng phụ thuộc nguyên liệu và quy trình ủ</td></tr>
<tr><th>Phân trùn quế</th><td>Chất hữu cơ đã qua đường ruột giun, tơi, giàu vi sinh vật</td><td>Phù hợp ươm cây, rau màu; giá thành cao hơn phân chuồng</td></tr>
<tr><th>Phân xanh</th><td>Cây, thường là họ đậu, được vùi trực tiếp vào đất</td><td>Vùi khi cây ra hoa; chờ phân hủy trước khi gieo trồng vụ sau</td></tr>
<tr><th>Phân hữu cơ chế biến thương mại</th><td>Dạng bột, viên; thành phần ổn định, dễ vận chuyển và rải</td><td>Kiểm tra quyết định lưu hành và tính hợp lệ theo tiêu chuẩn hữu cơ</td></tr>
</table>

<h2>Phân gà: vì sao "nóng" và dùng thế nào cho đúng</h2>
<p>Gia cầm thải đạm chủ yếu dưới dạng axit uric, chất này chuyển hóa nhanh thành amoniac khi gặp ẩm. Vì vậy phân gà tươi bón trực tiếp dễ gây xót rễ, vàng lá, và mất một phần đạm do bay hơi. Phân gà qua ủ, lên men hoặc sấy khô thì ổn định hơn: mùi giảm, mầm bệnh và hạt cỏ được xử lý, đạm giải phóng đều hơn. Dạng viên nén còn thuận tiện cho rải máy và giảm bụi.</p>
<p>Với phân gà đã xử lý, nguyên tắc chung là bón lót trước khi xuống giống hoặc bón theo vành tán với cây lâu năm, lấp một lớp đất mỏng rồi tưới đủ ẩm. Không đổ thành đống sát gốc, nhất là với cây con. Do hàm lượng dinh dưỡng cao, lượng bón phân gà thường thấp hơn đáng kể so với phân bò cho cùng một mục tiêu dinh dưỡng; luôn theo hướng dẫn trên nhãn và điều chỉnh theo kết quả phân tích đất.</p>

<h2>Vì sao phải ủ hoai</h2>
<p>Bón phân tươi tiềm ẩn nhiều rủi ro: vi sinh vật gây bệnh có thể lây nhiễm lên sản phẩm ăn tươi, đạm dạng amoniac gây cháy rễ, và quá trình phân hủy trong đất tạm thời rút oxy và đạm khỏi vùng rễ. Quá trình ủ đúng cách, với giai đoạn nhiệt độ cao kéo dài, xử lý phần lớn các vấn đề này. Một đống ủ thường đi qua ba giai đoạn: giai đoạn ấm khi vi sinh vật bắt đầu hoạt động, giai đoạn nóng (khoảng 55–65°C) khi phần lớn mầm bệnh và hạt cỏ bị tiêu diệt, và giai đoạn nguội – chín khi nấm và các sinh vật khác hoàn thiện mùn.</p>

<h2>Kỹ thuật ủ: tỷ lệ C/N, độ ẩm và đảo trộn</h2>
<p>Vi sinh vật cần carbon làm năng lượng và đạm để xây dựng tế bào. Đống ủ hoạt động tốt khi tỷ lệ C/N ban đầu khoảng 25–30:1. Nguyên liệu giàu đạm (phân gà, cỏ tươi) cần được phối với nguyên liệu giàu carbon (rơm, lá khô, mùn cưa) để đạt tỷ lệ này.</p>
<table>
<tr><th>Nguyên liệu</th><th>C/N tham khảo</th><th>Vai trò trong đống ủ</th></tr>
<tr><th>Phân gà</th><td>khoảng 5–10</td><td>Nguồn đạm, khởi động nhiệt nhanh</td></tr>
<tr><th>Phân bò</th><td>khoảng 15–25</td><td>Cân bằng, có thể ủ gần như riêng lẻ</td></tr>
<tr><th>Cỏ tươi, rau thải</th><td>khoảng 10–25</td><td>Nguồn đạm, nhiều nước</td></tr>
<tr><th>Lá khô</th><td>khoảng 30–80</td><td>Nguồn carbon, tạo độ xốp</td></tr>
<tr><th>Rơm rạ</th><td>khoảng 50–80</td><td>Nguồn carbon phổ biến ở vùng lúa</td></tr>
<tr><th>Mùn cưa</th><td>khoảng 200–500</td><td>Nguồn carbon rất cao, phân hủy chậm; chỉ dùng lượng nhỏ</td></tr>
</table>
<p>Các giá trị trên chỉ để tham khảo, thực tế dao động theo nguồn và độ ẩm nguyên liệu. Một số nguyên tắc vận hành:</p>
<ul>
<li><strong>Độ ẩm khoảng 50–60%:</strong> nắm chặt một nắm nguyên liệu, thấy nước rịn qua kẽ tay nhưng không chảy thành giọt là vừa.</li>
<li><strong>Kích thước đống:</strong> đủ lớn để giữ nhiệt (thường từ khoảng 1 m³ trở lên), không quá cao để tránh nén chặt và thiếu khí.</li>
<li><strong>Đảo trộn:</strong> đảo khi nhiệt độ bắt đầu giảm sau đỉnh, để đưa phần bên ngoài vào lõi nóng.</li>
<li><strong>Che mưa:</strong> đống ủ để ngoài trời mưa bị rửa trôi dinh dưỡng và thừa nước.</li>
<li><strong>Dấu hiệu phân đã hoai:</strong> màu nâu sẫm, mùi đất, không còn nóng khi đảo, không nhận ra nguyên liệu ban đầu.</li>
</ul>

<h2>Các tiêu chuẩn hữu cơ quy định gì về phân chuồng</h2>
<ul>
<li><strong>USDA (7 CFR 205.203):</strong> phân chuồng chưa xử lý phải được bón ít nhất 120 ngày trước thu hoạch nếu phần ăn được tiếp xúc với đất, và ít nhất 90 ngày nếu không tiếp xúc. Phân được coi là compost khi tỷ lệ C/N ban đầu từ 25:1 đến 40:1 và đạt 55–77°C trong 3 ngày (ủ trong thùng hoặc đống thổi khí tĩnh), hoặc trong 15 ngày với luống ủ được đảo ít nhất 5 lần.</li>
<li><strong>EU (Quy định 2018/848 và quy định thực thi):</strong> phân chuồng, phân gia cầm được phép, nhưng cấm phân có nguồn gốc từ chăn nuôi công nghiệp quy mô lớn ("factory farming"). Tổng lượng phân chuồng bón không vượt quá 170 kg đạm/ha/năm.</li>
<li><strong>Việt Nam:</strong> TCVN 11041-2:2017 yêu cầu ưu tiên nguồn hữu cơ từ chính trang trại và chỉ dùng vật tư đầu vào trong danh mục cho phép. Phân bón mua ngoài phải được công nhận lưu hành theo Luật Trồng trọt 2018 và Nghị định 84/2019/NĐ-CP (sửa đổi bởi Nghị định 130/2022/NĐ-CP); chất lượng theo QCVN 01-189:2019/BNNPTNT, gồm cả giới hạn kim loại nặng và vi sinh vật gây bệnh.</li>
</ul>
<p>Cần phân biệt: một loại phân bón "được lưu hành tại Việt Nam" chưa có nghĩa là "được phép dùng trong sản xuất hữu cơ". Hai điều kiện này được kiểm tra độc lập.</p>

<h2>Đọc nhãn phân bón tại Việt Nam</h2>
<p>Nhãn phân bón hợp lệ cung cấp những thông tin cần để kiểm tra và ghi hồ sơ:</p>
<ul>
<li><strong>Loại phân bón</strong> (ví dụ phân bón hữu cơ, hữu cơ vi sinh, hữu cơ khoáng). Phân hữu cơ khoáng có pha phân hóa học, thường không phù hợp sản xuất hữu cơ.</li>
<li><strong>Số quyết định công nhận lưu hành</strong> do cơ quan quản lý cấp — có thể tra cứu để xác minh.</li>
<li><strong>Thành phần và hàm lượng:</strong> chất hữu cơ, tỷ lệ C/N, đạm, lân, kali, độ ẩm, pH.</li>
<li><strong>Nguồn gốc nguyên liệu và nhà sản xuất, nhà nhập khẩu</strong>; ngày sản xuất, hạn sử dụng.</li>
<li><strong>Hướng dẫn sử dụng:</strong> liều lượng theo nhóm cây, cách bón, cảnh báo.</li>
</ul>

<h2>Nguyên tắc sử dụng</h2>
<p>Bón theo nhu cầu thực tế của cây và hiện trạng đất, dựa trên kết quả phân tích, thay vì bón theo thói quen — tinh thần "4 đúng": đúng loại, đúng lượng, đúng lúc, đúng cách. Đạm hữu cơ giải phóng chậm, chỉ một phần được cây dùng trong vụ đầu, nên cần tính đến độ trễ. Tránh bón thừa lân tích lũy nhiều năm từ phân chuồng, vốn có thể gây mất cân bằng vi lượng và rủi ro môi trường. Ghi lại nguồn gốc, khối lượng và ngày bón của mọi lô phân.</p>

<h2>Những sai lầm thường gặp</h2>
<ul>
<li>Bón phân gà, phân heo tươi trực tiếp, nhất là gần ngày thu hoạch rau ăn lá.</li>
<li>Đổ phân thành đống sát gốc cây con, gây xót rễ.</li>
<li>Trộn vôi với phân chuồng cùng lúc: pH tăng làm đạm bay hơi thành amoniac. Nên bón vôi trước, cách vài tuần mới bón phân.</li>
<li>Mua phân không rõ nguồn gốc, không có nhãn, không giữ hóa đơn.</li>
<li>Chỉ bón phân mà bỏ qua che phủ, luân canh — đất vẫn mất chất hữu cơ nhanh dưới nắng mưa nhiệt đới.</li>
</ul>

<h2>Lưu trữ hồ sơ</h2>
<p>Với phân mua ngoài, giữ hóa đơn, nhãn sản phẩm, quyết định lưu hành và bất kỳ giấy xác nhận nào về thành phần. Với phân tự ủ, ghi lại nguyên liệu đầu vào, ngày ủ, nhiệt độ theo dõi và các lần đảo trộn. Đây là những tài liệu mà đánh giá viên sẽ xem xét để xác nhận không có vật tư bị cấm đi vào hệ thống.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://www.ecfr.gov/current/title-7/subtitle-B/chapter-I/subchapter-M/part-205" rel="noopener nofollow" target="_blank">7 CFR Part 205 — National Organic Program (USDA), mục 205.203 về độ phì đất và quản lý dinh dưỡng</a>.</li>
<li><a href="https://eur-lex.europa.eu/eli/reg/2018/848/oj" rel="noopener nofollow" target="_blank">Regulation (EU) 2018/848 on organic production and labelling</a>.</li>
<li><a href="https://compost.css.cornell.edu/" rel="noopener nofollow" target="_blank">Cornell Waste Management Institute — Composting</a>.</li>
<li><a href="https://www.sare.org/resources/building-soils-for-better-crops/" rel="noopener nofollow" target="_blank">SARE — Building Soils for Better Crops</a>.</li>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=194623" rel="noopener nofollow" target="_blank">Nghị định 109/2018/NĐ-CP về Nông nghiệp hữu cơ</a>.</li>
<li>Nghị định 84/2019/NĐ-CP về quản lý phân bón; QCVN 01-189:2019/BNNPTNT về chất lượng phân bón.</li>
</ul>
`,
  },

  "luan-canh-va-cay-che-phu-hai-cong-cu-nen-tang-cua-he-thong-huu-co": {
    excerpt:
      "Luân canh hợp lý và cây che phủ giúp quản lý dinh dưỡng, cắt vòng đời sâu bệnh và bảo vệ đất. Bài viết phân nhóm cây theo họ, đưa ví dụ chu kỳ cho rau màu và lúa – màu ở ĐBSCL, và gợi ý cây che phủ cho vườn cây ăn trái, cà phê trên đất dốc.",
    content: `
<p>Nếu phải chọn hai kỹ thuật quan trọng nhất trong canh tác hữu cơ, nhiều người làm nghề sẽ chọn luân canh và cây che phủ. Cả hai đều không đòi hỏi đầu vào đắt tiền, nhưng đòi hỏi kế hoạch dài hạn và kỷ luật thực hiện. Nghiên cứu tổng hợp của Ponisio và cộng sự (2015) cho thấy khi trang trại hữu cơ áp dụng luân canh và xen canh đa dạng, khoảng cách năng suất so với canh tác thông thường thu hẹp đáng kể — một bằng chứng cho thấy đây không chỉ là kỹ thuật "bảo vệ đất" mà còn là đòn bẩy kinh tế.</p>

<h2>Luân canh làm được gì</h2>
<ul>
<li><strong>Quản lý sâu bệnh và cỏ dại:</strong> thay đổi họ cây trồng qua các vụ làm gián đoạn vòng đời của nhiều loài dịch hại chuyên tính.</li>
<li><strong>Cân bằng dinh dưỡng:</strong> cây họ đậu bổ sung đạm; cây rễ sâu khai thác dinh dưỡng ở tầng dưới và đưa lên bề mặt.</li>
<li><strong>Cấu trúc đất:</strong> luân phiên cây rễ chùm và rễ cọc giúp cải thiện độ tơi xốp ở nhiều tầng.</li>
<li><strong>Phân tán rủi ro:</strong> đa dạng cây trồng giảm thiệt hại khi một loại gặp bất lợi về thời tiết hay giá cả.</li>
</ul>

<h2>Tiêu chuẩn hữu cơ yêu cầu gì</h2>
<p>Luân canh không chỉ là khuyến nghị. Chương trình hữu cơ của Hoa Kỳ (7 CFR 205.205) yêu cầu nhà sản xuất áp dụng luân canh — có thể gồm cây che phủ, phân xanh, cây bắt dinh dưỡng — để duy trì chất hữu cơ, quản lý dịch hại và hạn chế xói mòn. Quy định hữu cơ của EU yêu cầu duy trì độ phì của đất bằng luân canh nhiều năm, trong đó bắt buộc có cây họ đậu làm cây chính hoặc cây che phủ đối với cây trồng luân canh. Khi đánh giá, chuyên gia thường đối chiếu sơ đồ thửa với nhật ký để xác nhận chu kỳ luân canh đã thực sự được thực hiện.</p>

<h2>Nhóm cây theo họ</h2>
<p>Cây cùng họ thường chung sâu bệnh và có nhu cầu dinh dưỡng giống nhau, nên đơn vị để lập kế hoạch luân canh là họ cây, không phải từng loại cây.</p>
<table>
<tr><th>Họ cây</th><th>Ví dụ</th><th>Vai trò trong chu kỳ</th></tr>
<tr><th>Họ cà</th><td>Cà chua, ớt, cà tím, khoai tây</td><td>Cần nhiều dinh dưỡng; chung nhiều bệnh như héo xanh vi khuẩn — tránh trồng lặp lại</td></tr>
<tr><th>Họ bầu bí</th><td>Dưa leo, bí đỏ, khổ qua, dưa hấu</td><td>Cần nhiều dinh dưỡng; chung bọ dưa, bệnh phấn trắng, sương mai</td></tr>
<tr><th>Họ cải (thập tự)</th><td>Cải xanh, cải ngọt, bắp cải, su hào</td><td>Cần nhiều đạm; chung sâu tơ, sâu xanh bướm trắng</td></tr>
<tr><th>Họ đậu</th><td>Đậu xanh, đậu nành, đậu phộng, đậu đũa</td><td>Cố định đạm nhờ vi khuẩn nốt sần — cây "trả lại" cho đất</td></tr>
<tr><th>Họ hành tỏi</th><td>Hành lá, hành tím, tỏi, hẹ</td><td>Nhu cầu dinh dưỡng vừa phải; ít chung sâu bệnh với các họ trên</td></tr>
<tr><th>Họ hòa thảo</th><td>Lúa, bắp, mía</td><td>Rễ chùm cải thiện cấu trúc đất; để lại sinh khối lớn</td></tr>
</table>

<h2>Nguyên tắc thiết kế chu kỳ</h2>
<p>Một chu kỳ luân canh tốt thường tránh trồng lại cùng một họ cây trên cùng thửa đất trong vài vụ liên tiếp, xen kẽ cây "lấy nhiều dinh dưỡng" với cây "cải tạo đất", và bố trí ít nhất một giai đoạn có cây che phủ hoặc cây phân xanh. Trang trại nên vẽ sơ đồ các thửa và lịch cây trồng nhiều năm để theo dõi.</p>
<h3>Ví dụ: vườn rau chia 4 khu</h3>
<table>
<tr><th>Khu</th><th>Vụ 1</th><th>Vụ 2</th><th>Vụ 3</th><th>Vụ 4</th></tr>
<tr><th>A</th><td>Họ đậu</td><td>Họ cải</td><td>Họ cà / bầu bí</td><td>Họ hành tỏi</td></tr>
<tr><th>B</th><td>Họ cải</td><td>Họ cà / bầu bí</td><td>Họ hành tỏi</td><td>Họ đậu</td></tr>
<tr><th>C</th><td>Họ cà / bầu bí</td><td>Họ hành tỏi</td><td>Họ đậu</td><td>Họ cải</td></tr>
<tr><th>D</th><td>Họ hành tỏi</td><td>Họ đậu</td><td>Họ cải</td><td>Họ cà / bầu bí</td></tr>
</table>
<p>Logic của trình tự này: cây họ đậu để lại đạm cho họ cải vốn cần nhiều đạm; họ cà, bầu bí tiếp theo khai thác phần dinh dưỡng còn lại cùng phân bón lót; họ hành tỏi nhu cầu thấp hơn, khép lại chu kỳ trước khi quay về họ đậu. Giữa các vụ có thể chen một đợt cây che phủ ngắn ngày.</p>
<h3>Lúa – màu và lúa – tôm ở Đồng bằng sông Cửu Long</h3>
<p>Trên đất phù sa chủ động nước, luân canh lúa với bắp, đậu nành, đậu xanh hoặc mè giúp cắt vòng đời rầy nâu và bệnh trên lúa, giảm cỏ lúa, cải thiện cấu trúc đất do đất được làm khô xen kẽ. Ở vùng ven biển, mô hình lúa – tôm (tôm nuôi mùa khô khi nước mặn, lúa trồng mùa mưa khi nước ngọt) là một dạng luân canh thích ứng với điều kiện tự nhiên, và đang được nhiều địa phương định hướng theo hướng hữu cơ vì ít phụ thuộc phân bón, thuốc hóa học.</p>

<h2>Cây che phủ</h2>
<p>Cây che phủ được trồng chủ yếu để bảo vệ và cải tạo đất chứ không phải để thu hoạch. Chúng chống xói mòn, giữ dinh dưỡng khỏi bị rửa trôi trong mùa mưa, ức chế cỏ dại, và khi được vùi vào đất thì trở thành nguồn chất hữu cơ và đạm. Việc chọn loài phụ thuộc vào mục tiêu:</p>
<table>
<tr><th>Mục tiêu</th><th>Cây thường dùng ở Việt Nam</th><th>Ghi chú</th></tr>
<tr><th>Bổ sung đạm, phân xanh</th><td>Điền thanh, muồng hoa vàng, đậu mèo, đậu xanh, đậu nành</td><td>Vùi khi ra hoa — lúc sinh khối và hàm lượng đạm cao, trước khi ra hạt</td></tr>
<tr><th>Thảm che phủ lâu năm trong vườn cây</th><td>Lạc dại (đậu phộng dại)</td><td>Bò sát mặt đất, chịu cắt tỉa, giữ ẩm cho vườn cây ăn trái, cà phê</td></tr>
<tr><th>Chống xói mòn trên đất dốc</th><td>Cỏ vetiver, cốt khí trồng theo đường đồng mức</td><td>Tạo băng chắn giữ đất, giữ nước cho cà phê, hồ tiêu, cây ăn trái vùng đồi</td></tr>
<tr><th>Tạo sinh khối, cải tạo cấu trúc</th><td>Bắp, cao lương, hỗn hợp hòa thảo – họ đậu</td><td>Rễ chùm làm tơi đất; hỗn hợp nhiều loài đạt nhiều mục tiêu cùng lúc</td></tr>
</table>

<h2>Kết thúc cây che phủ đúng cách</h2>
<ul>
<li><strong>Vùi vào đất:</strong> cắt nhỏ rồi vùi nông; với lượng sinh khối lớn, nên chờ khoảng 2–3 tuần cho phân hủy trước khi gieo hạt vụ chính.</li>
<li><strong>Cắt rải làm lớp phủ:</strong> giữ nguyên trên mặt đất để giữ ẩm và chặn cỏ, phù hợp với vườn cây lâu năm và canh tác ít làm đất.</li>
<li><strong>Không để cây che phủ ra hạt:</strong> nếu không, chính nó sẽ trở thành cỏ dại ở vụ sau.</li>
</ul>

<h2>Đưa vào thực tế</h2>
<p>Thách thức lớn nhất thường là thời gian: cây che phủ chiếm chỗ và chiếm thời gian mà lẽ ra dành cho cây thương phẩm. Giải pháp là xem chúng như một khoản đầu tư vào đất, tính toán để gieo và kết thúc đúng thời điểm, và bắt đầu thử nghiệm trên một phần diện tích trước khi mở rộng. Ghi chép đầy đủ — thửa nào, trồng gì, ngày gieo, ngày vùi — vừa giúp tối ưu các vụ sau, vừa là bằng chứng cần thiết khi đánh giá chứng nhận.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://www.sare.org/resources/crop-rotation-on-organic-farms/" rel="noopener nofollow" target="_blank">SARE — Crop Rotation on Organic Farms: A Planning Manual</a>.</li>
<li><a href="https://www.sare.org/resources/managing-cover-crops-profitably-3rd-edition/" rel="noopener nofollow" target="_blank">SARE — Managing Cover Crops Profitably (3rd edition)</a>.</li>
<li><a href="https://www.ecfr.gov/current/title-7/subtitle-B/chapter-I/subchapter-M/part-205" rel="noopener nofollow" target="_blank">7 CFR Part 205 — National Organic Program (USDA), mục 205.205 về luân canh</a>.</li>
<li><a href="https://eur-lex.europa.eu/eli/reg/2018/848/oj" rel="noopener nofollow" target="_blank">Regulation (EU) 2018/848 on organic production and labelling</a>.</li>
<li><a href="https://doi.org/10.1098/rspb.2014.1396" rel="noopener nofollow" target="_blank">Ponisio và cộng sự (2015). Diversification practices reduce organic to conventional yield gap. Proc. R. Soc. B</a>.</li>
</ul>
`,
  },

  "kiem-soat-co-dai-trong-canh-tac-huu-co-khi-khong-dung-thuoc-diet-co": {
    excerpt:
      "Cỏ dại là một trong những thách thức lớn nhất khi chuyển sang hữu cơ. Bài viết tổng hợp biện pháp phòng ngừa, canh tác, cơ giới và sinh học, các mô hình như vịt – lúa, thảm cỏ trong vườn cây ăn trái, kèm lịch làm cỏ theo giai đoạn cây trồng.",
    content: `
<p>Không có thuốc diệt cỏ tổng hợp, người làm hữu cơ phải quản lý cỏ dại bằng một tập hợp biện pháp phối hợp. Mục tiêu không phải là một cánh đồng sạch bóng cỏ, mà là giữ cạnh tranh của cỏ dại ở mức không ảnh hưởng đáng kể đến năng suất và chất lượng. Danh mục vật tư được phép của các tiêu chuẩn hữu cơ hầu như không có thuốc trừ cỏ dùng trên diện tích canh tác, nên việc quản lý cỏ phải được thiết kế ngay trong hệ thống canh tác, không thể "chữa cháy" bằng một lần phun.</p>

<h2>Hiểu về "ngân hàng hạt cỏ" trong đất</h2>
<p>Mỗi thửa đất chứa một lượng lớn hạt cỏ dại tồn tại nhiều năm. Chiến lược dài hạn của canh tác hữu cơ là làm cạn dần ngân hàng này: không để cỏ ra hạt, kích thích hạt nảy mầm rồi diệt cây non trước khi gieo trồng, và hạn chế đưa hạt cỏ mới vào qua phân chưa hoai hoặc hạt giống lẫn tạp. Người làm nông phương Tây có câu "một năm để cỏ ra hạt, bảy năm làm cỏ" — một vụ lơ là có thể để lại hậu quả nhiều năm.</p>
<p>Ở Đồng bằng sông Cửu Long, lúa cỏ (lúa hoang lẫn trong ruộng) là ví dụ điển hình: hạt lúa cỏ lẫn trong lúa giống tự để, rụng sớm xuống ruộng và tồn tại qua nhiều vụ. Dùng giống xác nhận, sạch hạt cỏ là biện pháp phòng ngừa rẻ nhất.</p>

<h2>Giai đoạn quyết định</h2>
<p>Cây trồng không nhạy cảm với cỏ dại như nhau trong suốt chu kỳ. Giai đoạn đầu — từ khi gieo đến khi cây khép tán, thường rơi vào khoảng một phần ba đầu chu kỳ sinh trưởng — là lúc cỏ gây thiệt hại năng suất lớn nhất. Cỏ mọc sau khi cây đã khép tán ít ảnh hưởng đến năng suất, nhưng vẫn cần được nhổ trước khi ra hạt để không bổ sung vào ngân hàng hạt.</p>

<h2>Phòng ngừa: chặn hạt cỏ từ đầu vào</h2>
<ul>
<li>Dùng hạt giống sạch, có nguồn gốc rõ ràng.</li>
<li>Chỉ bón phân chuồng đã ủ hoai đúng kỹ thuật — giai đoạn nóng của đống ủ tiêu diệt phần lớn hạt cỏ.</li>
<li>Vệ sinh máy làm đất, máy gặt khi chuyển từ ruộng nhiều cỏ sang ruộng khác.</li>
<li>Cắt cỏ bờ ruộng, bờ kênh trước khi cỏ ra hạt.</li>
</ul>

<h2>Biện pháp canh tác</h2>
<ul>
<li><strong>Làm đất giả:</strong> chuẩn bị luống sớm, tưới ẩm, chờ cỏ nảy mầm, xử lý lớp cỏ non bằng xới nông rồi mới gieo cây trồng. Có thể lặp lại hai lần nếu thời gian cho phép.</li>
<li><strong>Quản lý nước trên lúa:</strong> giữ nước ngập nông sau khi lúa đã bén rễ giúp ức chế nhiều loài cỏ cạn, như cỏ lồng vực, cỏ đuôi phụng.</li>
<li><strong>Che phủ mặt đất:</strong> rơm rạ, tàn dư cây, hoặc màng phủ chặn ánh sáng đến hạt cỏ. Lớp phủ hữu cơ cần đủ dày (thường khoảng 5–10 cm) mới hiệu quả.</li>
<li><strong>Mật độ và tán cây:</strong> cây trồng khép tán nhanh sẽ tự cạnh tranh tốt với cỏ; trồng hàng hẹp hơn và dùng cây giống khỏe giúp rút ngắn giai đoạn đất trống.</li>
<li><strong>Luân canh và cây che phủ:</strong> thay đổi điều kiện khiến không loài cỏ nào chiếm ưu thế lâu dài.</li>
</ul>
<p>Về màng phủ, chương trình hữu cơ của Hoa Kỳ cho phép màng phủ nhựa với điều kiện phải thu gom khỏi đồng ruộng khi kết thúc vụ; màng phủ "phân hủy sinh học" chỉ được dùng khi đáp ứng điều kiện riêng về thành phần, nên cần hỏi tổ chức chứng nhận trước khi mua.</p>

<h2>Biện pháp cơ giới và vật lý</h2>
<table>
<tr><th>Công cụ / biện pháp</th><th>Phù hợp với</th><th>Lưu ý</th></tr>
<tr><th>Nhổ tay, cuốc</th><td>Diện tích nhỏ, rau màu, quanh gốc cây</td><td>Tốn công nhưng chính xác; hiệu quả nhất khi cỏ còn nhỏ</td></tr>
<tr><th>Máy xới giữa hàng</th><td>Bắp, đậu, rau trồng theo hàng</td><td>Xới nông để không làm đứt rễ cây trồng và không kéo thêm hạt cỏ từ tầng sâu lên</td></tr>
<tr><th>Bừa răng lò xo</th><td>Ruộng gieo hàng, giai đoạn cỏ mới nhú</td><td>Phải thực hiện đúng lúc cỏ ở giai đoạn "sợi chỉ"</td></tr>
<tr><th>Máy cắt cỏ cầm tay</th><td>Vườn cây ăn trái, cà phê, bờ ruộng</td><td>Cắt thấp nhưng giữ lại thảm cỏ để che đất</td></tr>
<tr><th>Phơi đất dưới màng nhựa trong</th><td>Vườn ươm, luống rau trước khi trồng</td><td>Tận dụng nắng gắt mùa khô để làm nóng lớp đất mặt, diệt hạt cỏ và một phần mầm bệnh</td></tr>
<tr><th>Đốt bằng ngọn lửa</th><td>Luống gieo hạt chậm nảy mầm</td><td>Đốt lướt cỏ non ngay trước khi cây trồng nhú; cần thiết bị và an toàn cháy nổ</td></tr>
</table>
<p>Thời điểm quan trọng hơn công cụ: diệt cỏ khi còn nhỏ tốn ít công hơn nhiều so với khi cỏ đã lớn.</p>

<h2>Biện pháp sinh học</h2>
<ul>
<li><strong>Vịt – lúa:</strong> thả vịt vào ruộng lúa sau khi lúa đã cứng cây; vịt ăn cỏ non, côn trùng và làm đục nước, hạn chế cỏ nảy mầm. Mô hình này được nông dân Nhật Bản phát triển và phổ biến từ những năm 1990, và có nhiều biến thể tại châu Á.</li>
<li><strong>Cá – lúa:</strong> cá trong ruộng sục bùn, ăn một phần cỏ và côn trùng.</li>
<li><strong>Cây che phủ cạnh tranh:</strong> lạc dại hay hỗn hợp cây họ đậu phủ kín đất, không chừa chỗ cho cỏ khó trị.</li>
<li><strong>Chăn thả có kiểm soát:</strong> gia cầm trong vườn cây ăn trái giúp giữ cỏ thấp; cần tuân thủ khoảng cách thời gian an toàn trước thu hoạch đối với phân động vật theo tiêu chuẩn áp dụng.</li>
</ul>

<h2>Cỏ trong vườn cây ăn trái: quản lý chứ không xóa sạch</h2>
<p>Với sầu riêng, bưởi, cam, xoài, thảm cỏ là đồng minh nhiều hơn là kẻ thù. Thảm cỏ mềm, được cắt định kỳ giúp giữ đất không bị xói trong mùa mưa, giữ ẩm trong mùa khô, và là nơi trú ẩn của thiên địch. Cách làm phổ biến là giữ một vùng sạch cỏ quanh gốc (thường phủ rơm hoặc cỏ cắt), còn giữa các hàng để cỏ và cắt khi cao. Chỉ những loài cỏ dây leo hoặc cỏ thân ngầm cạnh tranh mạnh mới cần được loại bỏ triệt để.</p>

<h2>Lịch làm cỏ gợi ý cho cây hằng năm</h2>
<table>
<tr><th>Giai đoạn</th><th>Việc cần làm</th></tr>
<tr><th>Trước khi gieo</th><td>Làm đất giả 1–2 lần; phơi đất hoặc phủ màng nếu có điều kiện</td></tr>
<tr><th>Từ khi gieo đến khoảng 3 tuần</th><td>Xới nông, nhổ tay cỏ mới nhú; đây là giai đoạn cỏ cạnh tranh mạnh nhất</td></tr>
<tr><th>Trước khi cây khép tán</th><td>Làm cỏ lần hai, vun gốc, phủ rơm giữa hàng</td></tr>
<tr><th>Sau khi khép tán</th><td>Đi đồng nhổ những cây cỏ sắp ra hạt</td></tr>
<tr><th>Sau thu hoạch</th><td>Gieo ngay cây che phủ, không để đất trống cho cỏ chiếm chỗ</td></tr>
</table>

<h2>Về các sản phẩm "diệt cỏ sinh học"</h2>
<p>Trên thị trường có nhiều sản phẩm quảng cáo là diệt cỏ "sinh học" hoặc "hữu cơ". Trước khi dùng, cần kiểm tra thành phần và xác nhận với tổ chức chứng nhận, vì phần lớn tiêu chuẩn hữu cơ gần như không cho phép thuốc trừ cỏ trên diện tích canh tác. Cũng cần lưu ý glyphosate đã bị loại khỏi danh mục thuốc bảo vệ thực vật được phép sử dụng tại Việt Nam từ năm 2019, nên bất kỳ sản phẩm nào chứa hoạt chất này đều không hợp lệ.</p>

<h2>Chấp nhận và ưu tiên</h2>
<p>Người làm hữu cơ lâu năm thường tập trung nguồn lực vào giai đoạn cây trồng nhạy cảm nhất với cạnh tranh, và chấp nhận một lượng cỏ nhất định ở cuối vụ khi thiệt hại đã không còn đáng kể. Việc ghi chép loài cỏ nào xuất hiện ở đâu, vào lúc nào, giúp điều chỉnh kế hoạch cho các vụ sau.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://www.sare.org/resources/manage-weeds-on-your-farm/" rel="noopener nofollow" target="_blank">SARE — Manage Weeds on Your Farm: A Guide to Ecological Strategies</a>.</li>
<li><a href="https://www.ecfr.gov/current/title-7/subtitle-B/chapter-I/subchapter-M/part-205" rel="noopener nofollow" target="_blank">7 CFR Part 205 — National Organic Program (USDA), mục 205.206 về quản lý dịch hại, cỏ dại, bệnh hại</a>.</li>
<li><a href="https://eur-lex.europa.eu/eli/reg/2018/848/oj" rel="noopener nofollow" target="_blank">Regulation (EU) 2018/848 on organic production and labelling</a>.</li>
<li><a href="https://www.ppd.gov.vn/" rel="noopener nofollow" target="_blank">Cục Trồng trọt và Bảo vệ thực vật</a> — danh mục thuốc bảo vệ thực vật được phép sử dụng tại Việt Nam.</li>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=194623" rel="noopener nofollow" target="_blank">Nghị định 109/2018/NĐ-CP về Nông nghiệp hữu cơ</a>.</li>
</ul>
`,
  },
};

function main() {
  const wp = JSON.parse(fs.readFileSync(WP_PATH, "utf8"));
  const stripLen = (html) =>
    html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").length;
  const total = Object.keys(EXPANDED).length;

  let n = 0;
  for (const [slug, data] of Object.entries(EXPANDED)) {
    const post = wp.posts[slug];
    if (!post) {
      console.error(`  ! không tìm thấy: ${slug}`);
      continue;
    }
    const before = stripLen(post.content);
    post.content = data.content.trim() + "\n";
    if (data.excerpt) post.excerpt = data.excerpt;
    const after = stripLen(post.content);
    n++;
    console.log(`  ${slug}\n    ${before} -> ${after} từ`);
  }

  if (DRY_RUN) {
    console.log(`\nDRY_RUN=1 — không ghi. ${n}/${total} bài sẵn sàng.`);
    return;
  }
  fs.writeFileSync(WP_PATH, JSON.stringify(wp, null, 2) + "\n", "utf8");
  console.log(`\nĐã cập nhật ${n}/${total} bài trong wp-content.json.`);
}

main();
