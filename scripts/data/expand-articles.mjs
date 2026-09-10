/**
 * Nội dung mở rộng cho 12 bài "seed" thuộc 2 nhóm:
 *   - chung-nhan-tieu-chuan (6 bài)
 *   - thi-truong-xu-huong (6 bài)
 *
 * Mục tiêu: 1200–1600 từ/bài, bổ sung dẫn chứng, bảng so sánh và mục
 * "Tham khảo" (link văn bản/cổng thông tin của cơ quan nhà nước VN + nguồn
 * quốc tế có thẩm quyền). Link chỉ đặt ở cuối bài, không chèn trong thân.
 *
 * Áp dụng:  node scripts/data/expand-articles.mjs           (ghi wp-content.json)
 *           DRY_RUN=1 node scripts/data/expand-articles.mjs (chỉ in số từ)
 * Sau đó:   xóa 12 slug khỏi news-cache.json + chạy scripts/translate-news.mjs
 *           rồi npm run posts:sync
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const WP_PATH = path.join(ROOT, "src/lib/data/wp-content.json");
const DRY_RUN = process.env.DRY_RUN === "1";

/** slug -> { excerpt?, content } (HTML thân bài, chỉ p/h2/h3/ul/ol/li/table/strong/em/a) */
export const EXPANDED = {
  // ═══════════════════════ CHỨNG NHẬN & TIÊU CHUẨN ═══════════════════════

  "tong-quan-cac-tieu-chuan-huu-co-quoc-te-usda-organic-eu-organic-va-jas": {
    excerpt:
      "USDA Organic, EU Organic và JAS cùng dựa trên một triết lý nhưng khác nhau ở giai đoạn chuyển đổi, ghi nhãn và cơ chế thừa nhận. Bài viết so sánh ba khung này, đối chiếu với TCVN 11041 và Nghị định 109/2018/NĐ-CP của Việt Nam.",
    content: `
<p>Khi hướng tới xuất khẩu, nhà sản xuất hữu cơ thường phải làm quen với nhiều bộ quy định cùng lúc. Ba khung được nhắc đến nhiều nhất là chương trình hữu cơ quốc gia của Hoa Kỳ (USDA Organic, vận hành theo National Organic Program – 7 CFR Part 205), quy định hữu cơ của Liên minh châu Âu (EU Organic, hiện là Quy định (EU) 2018/848 áp dụng từ ngày 1/1/2022, thay cho Quy định 834/2007) và tiêu chuẩn nông nghiệp Nhật Bản về sản phẩm hữu cơ (JAS Organic, do Bộ Nông, Lâm, Ngư nghiệp Nhật Bản quản lý). Cả ba đều tham chiếu tới bộ hướng dẫn của Codex Alimentarius (CAC/GL 32-1999) về thực phẩm hữu cơ, nên phần khung nguyên tắc rất gần nhau.</p>

<h2>Những nguyên tắc chung</h2>
<ul>
<li>Không sử dụng phân bón và thuốc bảo vệ thực vật tổng hợp, trừ một danh mục hẹp các chất được phép.</li>
<li>Không sử dụng sinh vật biến đổi gen và sản phẩm từ sinh vật biến đổi gen.</li>
<li>Có giai đoạn chuyển đổi trước khi sản phẩm được chứng nhận, tính từ lần cuối cùng sử dụng vật tư bị cấm.</li>
<li>Tách biệt rõ ràng giữa dòng hữu cơ và không hữu cơ trong toàn chuỗi sản xuất, sơ chế, bảo quản và vận chuyển.</li>
<li>Lưu trữ hồ sơ đầy đủ, có kế hoạch sản xuất hữu cơ bằng văn bản và chịu đánh giá bởi bên thứ ba được công nhận.</li>
</ul>
<p>Việt Nam cũng đi theo logic này. Bộ tiêu chuẩn quốc gia TCVN 11041 về nông nghiệp hữu cơ (bắt đầu công bố từ cuối năm 2017, gồm phần yêu cầu chung, trồng trọt, chăn nuôi và các phần cho gạo, chè, sữa, tôm…) được xây dựng hài hòa với Codex và hướng dẫn của IFOAM. Nghị định 109/2018/NĐ-CP quy định sản phẩm hữu cơ lưu thông tại Việt Nam phải được chứng nhận phù hợp TCVN về nông nghiệp hữu cơ hoặc phù hợp tiêu chuẩn quốc tế, tiêu chuẩn khu vực, tiêu chuẩn nước ngoài được áp dụng trong sản xuất sản phẩm hữu cơ.</p>

<h2>Ba khung khác nhau ở đâu</h2>
<table>
<tr><th>Tiêu chí</th><th>USDA Organic (Hoa Kỳ)</th><th>EU Organic</th><th>JAS Organic (Nhật Bản)</th></tr>
<tr><th>Văn bản gốc</th><td>7 CFR Part 205 (NOP)</td><td>Quy định (EU) 2018/848</td><td>Luật JAS và quy chuẩn kèm theo</td></tr>
<tr><th>Cơ quan quản lý</th><td>Bộ Nông nghiệp Hoa Kỳ (USDA – AMS)</td><td>Ủy ban châu Âu và cơ quan có thẩm quyền của từng nước thành viên</td><td>Bộ Nông, Lâm, Ngư nghiệp Nhật Bản (MAFF)</td></tr>
<tr><th>Giai đoạn chuyển đổi</th><td>Đất không sử dụng chất cấm trong ít nhất 36 tháng trước vụ thu hoạch hữu cơ đầu tiên</td><td>2 năm với cây hằng năm, 3 năm với cây lâu năm</td><td>Tương tự EU: 2 năm với cây hằng năm, 3 năm với cây lâu năm</td></tr>
<tr><th>Ghi nhãn</th><td>Phân hạng "100% organic", "organic" (≥95%), "made with organic…" (≥70%); được dùng con dấu USDA Organic khi đạt mức ≥95%</td><td>Gọi là "hữu cơ" khi ≥95% thành phần nông nghiệp là hữu cơ; bắt buộc dùng logo lá EU và mã số tổ chức chứng nhận</td><td>Được gắn JAS Mark khi đạt yêu cầu; sản phẩm không có JAS Mark không được ghi "有機/organic" khi bán tại Nhật</td></tr>
<tr><th>Danh mục vật tư được phép</th><td>National List (7 CFR 205.601–205.606)</td><td>Phụ lục của quy định thực thi</td><td>Danh mục kèm quy chuẩn JAS</td></tr>
</table>
<p>Ngoài chi tiết trong bảng, các hệ thống còn khác nhau về yêu cầu vùng đệm, xử lý sau thu hoạch, tỷ lệ và cách khai báo thành phần trong sản phẩm chế biến, và về quy định với bao bì tiếp xúc sản phẩm.</p>

<h2>Cơ chế thừa nhận lẫn nhau</h2>
<p>Điểm khiến nhà xuất khẩu hay nhầm là: một chứng nhận không tự động có giá trị ở mọi thị trường. Giữa một số nền kinh tế lớn có thỏa thuận tương đương (equivalence), cho phép sản phẩm được chứng nhận theo hệ này được bán như hữu cơ ở hệ kia, thường kèm điều kiện. Hoa Kỳ và EU có thỏa thuận tương đương từ năm 2012; Hoa Kỳ và Nhật Bản từ năm 2014; EU và Nhật Bản cũng công nhận lẫn nhau ở phạm vi nhất định. Với hàng từ Việt Nam, con đường phổ biến là được đánh giá bởi tổ chức chứng nhận đã được cơ quan quản lý của thị trường đích chỉ định hoặc công nhận cho tiêu chuẩn đó (ví dụ tổ chức được công nhận đánh giá theo NOP hoặc theo quy định EU).</p>

<h2>Ý nghĩa thực tế với nhà sản xuất</h2>
<p>Trên thực địa, phần lớn yêu cầu là giống nhau, nên một hệ thống quản lý tốt thường đáp ứng được nhiều tiêu chuẩn cùng lúc. Việc chọn chứng nhận nào nên xuất phát từ thị trường đích: bán đi đâu thì cần chứng nhận được nơi đó chấp nhận. Nhiều trang trại và doanh nghiệp xuất khẩu lựa chọn chứng nhận đồng thời theo hai hoặc ba tiêu chuẩn để giữ linh hoạt đầu ra, chấp nhận chi phí đánh giá cao hơn để đổi lấy khả năng bán vào nhiều thị trường.</p>

<h2>Chi phí và công sức khi chứng nhận nhiều tiêu chuẩn</h2>
<p>Chứng nhận song song không phải là nhân đôi chi phí, nhưng cũng không rẻ. Phần lớn tổ chức chứng nhận quốc tế có thể đánh giá một trang trại theo nhiều tiêu chuẩn trong cùng một chuyến đi hiện trường, nên chi phí đi lại và thời gian được chia sẻ. Khoản tăng thêm chủ yếu nằm ở phí cấp mỗi loại giấy chứng nhận, ở việc rà soát danh mục vật tư theo từng danh mục cho phép khác nhau, và ở hồ sơ ghi nhãn phải làm riêng cho từng thị trường. Doanh nghiệp nên yêu cầu tổ chức chứng nhận báo giá trọn gói cho tổ hợp tiêu chuẩn mình cần, thay vì cộng dồn từng bảng giá đơn lẻ.</p>

<h2>Những sai lầm thường gặp khi chọn tiêu chuẩn</h2>
<ul>
<li><strong>Chứng nhận trước, tìm thị trường sau:</strong> bỏ tiền lấy một chứng nhận rồi mới phát hiện người mua tiềm năng lại yêu cầu tiêu chuẩn khác.</li>
<li><strong>Nhầm "được chứng nhận" với "được chấp nhận nhập khẩu":</strong> có giấy chứng nhận theo một tiêu chuẩn không đồng nghĩa lô hàng đương nhiên thông quan như hữu cơ ở thị trường đích; còn phụ thuộc thỏa thuận tương đương và thủ tục nhập khẩu.</li>
<li><strong>Chọn tổ chức chứng nhận chưa được thị trường đích công nhận:</strong> giấy chứng nhận khi đó không có giá trị cho mục tiêu xuất khẩu ban đầu.</li>
<li><strong>Bỏ qua tiêu chuẩn trong nước:</strong> nếu vẫn bán một phần sản lượng tại Việt Nam thì phải tuân thủ Nghị định 109/2018/NĐ-CP về ghi nhãn và logo.</li>
</ul>

<h2>Chuẩn bị từ gốc</h2>
<p>Dù nhắm tới tiêu chuẩn nào, các nền tảng đều giống nhau: bản đồ và lịch sử canh tác của từng thửa trong vài năm gần nhất, nhật ký đồng ruộng, hồ sơ vật tư đầu vào kèm bằng chứng hợp lệ, quy trình kiểm soát nhiễm chéo và kế hoạch sản xuất hữu cơ bằng văn bản. Với thị trường trong nước, cần thêm việc tuân thủ Nghị định 109/2018/NĐ-CP về ghi nhãn, logo và truy xuất nguồn gốc. Xây dựng tốt những nền tảng này giúp việc mở rộng sang một tiêu chuẩn mới về sau nhẹ nhàng hơn nhiều, vì chủ yếu là bổ sung tài liệu chứ không phải thay đổi cách canh tác.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=194623" rel="noopener nofollow" target="_blank">Nghị định 109/2018/NĐ-CP ngày 29/8/2018 về Nông nghiệp hữu cơ</a> — Cơ sở dữ liệu quốc gia về văn bản pháp luật, Chính phủ.</li>
<li><a href="https://tcvn.gov.vn/gioi-thieu-tong-quan-he-thong-tieu-chuan-ve-san-pham-nong-nghiep-huu-co/13/10/2022/" rel="noopener nofollow" target="_blank">Giới thiệu hệ thống TCVN 11041 về nông nghiệp hữu cơ</a> — Ủy ban Tiêu chuẩn Đo lường Chất lượng Quốc gia.</li>
<li><a href="https://www.ams.usda.gov/about-ams/programs-offices/national-organic-program" rel="noopener nofollow" target="_blank">USDA National Organic Program (7 CFR Part 205)</a>.</li>
<li><a href="https://eur-lex.europa.eu/eli/reg/2018/848/oj" rel="noopener nofollow" target="_blank">Regulation (EU) 2018/848 on organic production and labelling</a>.</li>
<li><a href="https://www.maff.go.jp/e/policies/standard/jas/specific/organic.html" rel="noopener nofollow" target="_blank">Organic JAS — Ministry of Agriculture, Forestry and Fisheries (Japan)</a>.</li>
</ul>
`,
  },

  "quy-trinh-dat-chung-nhan-huu-co-tu-dang-ky-den-cuoc-danh-gia-dau-tien": {
    excerpt:
      "Chứng nhận hữu cơ là một quy trình có trình tự chuẩn hóa. Bài viết mô tả từng bước từ chọn tổ chức chứng nhận đến cuộc đánh giá hiện trường đầu tiên, đối chiếu với TCVN 12134:2017 và Nghị định 109/2018/NĐ-CP.",
    content: `
<p>Với nhiều nông hộ, "làm chứng nhận" nghe có vẻ phức tạp và tốn kém. Trên thực tế, đó là một quy trình có trình tự khá chuẩn hóa, được quy định trong tiêu chuẩn dành cho tổ chức chứng nhận (ở Việt Nam là TCVN 12134:2017 – Nông nghiệp hữu cơ – Yêu cầu đối với tổ chức chứng nhận) và trong Nghị định 109/2018/NĐ-CP. Hiểu trước các bước giúp nhà sản xuất chuẩn bị hồ sơ đúng và tránh kéo dài thời gian không cần thiết.</p>

<h2>Bước 1: Xác định tiêu chuẩn và chọn tổ chức chứng nhận</h2>
<p>Trước tiên phải chốt sẽ chứng nhận theo tiêu chuẩn nào — TCVN 11041 cho thị trường trong nước, hay tiêu chuẩn của thị trường xuất khẩu đích (USDA Organic, EU Organic, JAS…). Sau đó chọn một tổ chức chứng nhận được chỉ định hoặc công nhận cho tiêu chuẩn đó. Với TCVN, tổ chức chứng nhận phải được cơ quan quản lý nhà nước có thẩm quyền chỉ định và hoạt động của họ phải phù hợp TCVN 12134:2017. Ở bước này nên trao đổi rõ về phạm vi chứng nhận, biểu phí (phí đăng ký, phí đánh giá, phí giám sát hằng năm), lịch trình và danh mục tài liệu cần nộp.</p>

<h2>Bước 2: Nộp hồ sơ đăng ký và kế hoạch sản xuất hữu cơ</h2>
<p>Hồ sơ thường gồm thông tin pháp nhân/hộ sản xuất, sơ đồ và bản đồ các thửa, lịch sử sử dụng đất trong vài năm gần nhất, danh mục cây trồng và giống, danh mục vật tư dự kiến sử dụng, nguồn nước tưới, và mô tả các biện pháp kiểm soát nhiễm chéo. Trung tâm của bộ hồ sơ là kế hoạch sản xuất hữu cơ (organic system plan) — tài liệu mô tả cụ thể trang trại sẽ tuân thủ từng yêu cầu của tiêu chuẩn trên thực tế ra sao, từ cải tạo đất, luân canh, quản lý dịch hại đến thu hoạch và sơ chế.</p>

<h2>Bước 3: Đánh giá tài liệu</h2>
<p>Tổ chức chứng nhận rà soát hồ sơ, đối chiếu với yêu cầu của tiêu chuẩn và nêu các điểm cần làm rõ hoặc bổ sung. Đây là lúc phát hiện sớm những vấn đề như một loại vật tư chưa hợp lệ, một vùng đệm chưa đủ rộng, hoặc lịch sử sử dụng đất chưa đủ thời gian chuyển đổi. Xử lý ở giai đoạn giấy tờ rẻ hơn nhiều so với để lộ ra khi đánh giá viên đã xuống hiện trường.</p>

<h2>Bước 4: Đánh giá hiện trường lần đầu</h2>
<p>Một đánh giá viên đến trang trại, đi thực địa toàn bộ các thửa trong phạm vi đăng ký, kiểm tra kho vật tư và khu sơ chế, xem nhật ký đồng ruộng và chứng từ, phỏng vấn người trực tiếp canh tác, và có thể lấy mẫu đất, nước hoặc sản phẩm để kiểm nghiệm dư lượng. Mục đích là đối chiếu những gì được ghi trong hồ sơ với thực tế: hồ sơ nói trồng gì ở thửa nào, bón gì, thì ngoài ruộng phải khớp.</p>

<h2>Bước 5: Xử lý điểm không phù hợp và ra quyết định</h2>
<p>Nếu có điểm chưa phù hợp, nhà sản xuất được yêu cầu khắc phục trong thời hạn nhất định và cung cấp bằng chứng đã khắc phục. Sau khi mọi điểm được đóng, tổ chức chứng nhận ra quyết định cấp giấy chứng nhận, ghi rõ tiêu chuẩn áp dụng, phạm vi (thửa, cây trồng, sản lượng ước tính), và thời hạn hiệu lực. Phương thức đánh giá và giám sát sau chứng nhận đối với TCVN nông nghiệp hữu cơ được thực hiện theo phương thức 5 quy định tại Thông tư 28/2012/TT-BKHCN, tức là có giám sát định kỳ trong suốt thời gian hiệu lực.</p>

<h2>Thời gian và chi phí thường gặp</h2>
<p>Từ lúc nộp hồ sơ đầy đủ đến khi có chứng nhận thường mất vài tháng, chưa kể thời gian chuyển đổi đất (thường 12–36 tháng tùy tiêu chuẩn và loại cây). Nghị định 109/2018/NĐ-CP có chính sách hỗ trợ: ngân sách hỗ trợ 100% chi phí xác định vùng, khu vực đủ điều kiện sản xuất hữu cơ (điều tra cơ bản, khảo sát địa hình, phân tích mẫu đất, nước, không khí) và hỗ trợ một phần chi phí cấp giấy chứng nhận sản phẩm phù hợp TCVN về nông nghiệp hữu cơ, theo điều kiện và định mức của địa phương. Nên hỏi Sở Nông nghiệp và Môi trường hoặc phòng nông nghiệp cấp huyện về chương trình hỗ trợ đang áp dụng trên địa bàn.</p>

<h2>Sau khi có chứng nhận</h2>
<p>Chứng nhận không phải là đích đến mà là trạng thái cần duy trì. Trang trại chịu đánh giá giám sát định kỳ, thường hằng năm, và có thể bị đánh giá đột xuất khi có dấu hiệu bất thường hoặc khiếu nại. Việc giữ hồ sơ cập nhật liên tục quan trọng hơn nhiều so với việc "chuẩn bị gấp" trước mỗi kỳ đánh giá — đánh giá viên đọc được ngay một cuốn sổ chỉ được ghi dồn vài ngày trước khi họ đến.</p>

<h2>Danh mục hồ sơ nên chuẩn bị trước khi nộp</h2>
<ul>
<li>Giấy tờ pháp lý của hộ/tổ chức sản xuất; hợp đồng thuê đất nếu có.</li>
<li>Sơ đồ tổng thể và bản đồ từng thửa, có đánh số thửa và ghi rõ ranh giới, vùng đệm, nguồn nước.</li>
<li>Lịch sử sử dụng đất 2–3 năm gần nhất cho từng thửa: cây trồng, vật tư đã dùng, đặc biệt là lần cuối dùng chất cấm.</li>
<li>Danh mục vật tư dự kiến (phân bón, chế phẩm quản lý dịch hại, giống) kèm nhãn và phiếu kỹ thuật.</li>
<li>Kết quả phân tích mẫu đất, nước tưới gần nhất.</li>
<li>Kế hoạch sản xuất hữu cơ bằng văn bản: luân canh, cải tạo đất, quản lý dịch hại và cỏ dại, thu hoạch, sơ chế, kiểm soát nhiễm chéo.</li>
<li>Mẫu các biểu ghi chép sẽ sử dụng (nhật ký đồng ruộng, sổ kho, sổ thu hoạch, sổ bán hàng).</li>
</ul>

<h2>Vì sao hồ sơ hay bị trả lại nhiều lần</h2>
<p>Các nguyên nhân lặp đi lặp lại: bản đồ thửa không khớp thực địa; lịch sử sử dụng đất khai chung chung, không đủ để xác định mốc bắt đầu chuyển đổi; danh mục vật tư có sản phẩm không rõ thành phần hoặc chưa được đánh giá hợp lệ; kế hoạch sản xuất hữu cơ viết theo kiểu chép lại tiêu chuẩn chứ không mô tả cách làm cụ thể của trang trại. Mỗi vòng bổ sung hồ sơ kéo dài thêm vài tuần đến vài tháng, nên đầu tư thời gian làm kỹ ngay từ đầu thường rẻ hơn.</p>

<h2>Vai trò của tư vấn</h2>
<p>Với trang trại lần đầu làm chứng nhận, thuê một đơn vị tư vấn có kinh nghiệm để dựng hệ thống hồ sơ và kế hoạch sản xuất hữu cơ thường tiết kiệm được thời gian và số vòng bổ sung. Tuy nhiên, tổ chức tư vấn phải độc lập với tổ chức chứng nhận: một đơn vị vừa tư vấn vừa cấp chứng nhận cho cùng một khách hàng là xung đột lợi ích và không được chấp nhận theo nguyên tắc đánh giá bên thứ ba.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=194623" rel="noopener nofollow" target="_blank">Nghị định 109/2018/NĐ-CP về Nông nghiệp hữu cơ</a> — Cơ sở dữ liệu quốc gia về văn bản pháp luật.</li>
<li><a href="https://baochinhphu.vn/huong-dan-hoat-dong-chung-nhan-nong-nghiep-huu-co-102264165.htm" rel="noopener nofollow" target="_blank">Hướng dẫn hoạt động chứng nhận nông nghiệp hữu cơ</a> — Báo Chính phủ.</li>
<li><a href="https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+12134%3A2017" rel="noopener nofollow" target="_blank">TCVN 12134:2017 — Nông nghiệp hữu cơ — Yêu cầu đối với tổ chức chứng nhận</a>.</li>
<li><a href="https://www.boa.gov.vn/" rel="noopener nofollow" target="_blank">Văn phòng Công nhận Chất lượng (BoA)</a> — tra cứu tổ chức chứng nhận được công nhận.</li>
</ul>
`,
  },

  "nhat-ky-dong-ruong-va-ho-so-truy-xuat-nen-tang-cua-moi-cuoc-danh-gia": {
    excerpt:
      "Đánh giá viên chỉ có mặt tại trang trại một, hai ngày mỗi năm — phần còn lại được chứng minh bằng hồ sơ. Bài viết liệt kê các loại hồ sơ bắt buộc, cách làm phép cân đối khối lượng, và kết nối với hệ thống truy xuất nguồn gốc quốc gia.",
    content: `
<p>Có một câu thường được nhắc trong giới chứng nhận hữu cơ: "nếu không được ghi lại thì coi như không xảy ra". Đánh giá viên chỉ có mặt tại trang trại một hoặc hai ngày mỗi năm, nên toàn bộ phần còn lại của một vụ canh tác được chứng minh qua hồ sơ. TCVN 11041-1:2017 và các tiêu chuẩn quốc tế đều yêu cầu nhà sản xuất lưu trữ hồ sơ đủ để truy xuất ngược từ sản phẩm bán ra về tới thửa đất và từng lần tác động.</p>

<h2>Các loại hồ sơ cốt lõi</h2>
<ul>
<li><strong>Nhật ký hoạt động đồng ruộng:</strong> làm đất, gieo trồng, bón phân, xử lý dịch hại, làm cỏ, tưới — ghi theo thửa và theo ngày, kèm tên vật tư và liều lượng.</li>
<li><strong>Hồ sơ vật tư đầu vào:</strong> hóa đơn mua, nhãn sản phẩm, phiếu kỹ thuật, giấy xác nhận thành phần và bằng chứng về tính hợp lệ theo tiêu chuẩn (chứng nhận đầu vào hữu cơ, thư xác nhận của tổ chức chứng nhận, hoặc phiếu đánh giá vật tư).</li>
<li><strong>Hồ sơ giống:</strong> nguồn gốc hạt giống hoặc cây con, ưu tiên giống hữu cơ; nếu phải dùng giống thông thường chưa xử lý thì cần giải trình và bằng chứng đã tìm nguồn hữu cơ nhưng không có.</li>
<li><strong>Hồ sơ thu hoạch:</strong> sản lượng theo thửa và theo lô, ngày thu hoạch, mã lô.</li>
<li><strong>Hồ sơ sau thu hoạch:</strong> sơ chế, rửa, phân loại, bảo quản, đóng gói; vật liệu tiếp xúc trực tiếp với sản phẩm; chất dùng để xử lý bề mặt nếu có.</li>
<li><strong>Hồ sơ bán hàng:</strong> lô hàng bán ra, khối lượng, người mua, hóa đơn, chứng từ giao dịch hữu cơ đi kèm từng lô.</li>
</ul>

<h2>Cân đối khối lượng đầu vào và đầu ra</h2>
<p>Một phép kiểm tra quan trọng trong đánh giá là đối chiếu diện tích canh tác, năng suất hợp lý cho loại cây đó ở vùng đó, và khối lượng sản phẩm hữu cơ đã bán ra. Nếu lượng bán vượt xa năng lực sản xuất thực tế của diện tích đăng ký, đó là dấu hiệu có sản phẩm không hữu cơ được trộn vào và bán kèm nhãn hữu cơ — một trong những vi phạm bị xử lý nặng nhất. Hồ sơ thu hoạch và bán hàng rõ ràng, khớp nhau theo mã lô, giúp chứng minh sự nhất quán này qua nhiều năm.</p>
<p>Một ví dụ đơn giản: trang trại đăng ký 2 ha rau, năng suất bình quân vùng khoảng 18 tấn/ha/vụ, hai vụ một năm, hao hụt sau thu hoạch khoảng 15%. Sản lượng hữu cơ có thể bán tối đa xấp xỉ 2 × 18 × 2 × 0,85 ≈ 61 tấn/năm. Nếu hóa đơn bán hàng cộng lại ra 80 tấn, đánh giá viên sẽ yêu cầu giải thích: mua thêm từ hộ khác đã được chứng nhận? có hợp đồng và chứng từ đầu vào tương ứng không? Nếu không giải thích được bằng hồ sơ, phần chênh lệch bị coi là sản phẩm không hữu cơ bán sai nhãn.</p>

<h2>Bộ biểu ghi chép tối thiểu</h2>
<ul>
<li><strong>Nhật ký đồng ruộng theo thửa:</strong> ngày — thửa — hoạt động — vật tư và liều — người thực hiện.</li>
<li><strong>Sổ kho vật tư:</strong> ngày nhập — tên vật tư — số lượng — nhà cung cấp — số hóa đơn — ngày xuất dùng.</li>
<li><strong>Sổ thu hoạch:</strong> ngày — thửa — sản phẩm — khối lượng — mã lô.</li>
<li><strong>Sổ sơ chế/đóng gói:</strong> mã lô vào — thao tác — khối lượng ra — mã lô ra — bao bì sử dụng.</li>
<li><strong>Sổ bán hàng:</strong> ngày — mã lô — khối lượng — người mua — số hóa đơn — chứng từ giao dịch hữu cơ.</li>
</ul>
<p>Điểm mấu chốt là mã lô xuyên suốt: một mã lô phải lần được từ hóa đơn bán ngược về sổ đóng gói, sổ thu hoạch, rồi tới thửa và các dòng nhật ký đồng ruộng của thửa đó.</p>

<h2>So sánh hai cách lưu hồ sơ</h2>
<table>
<tr><th></th><th>Sổ giấy</th><th>Bảng tính / phần mềm</th></tr>
<tr><th>Ưu điểm</th><td>Ghi ngay tại ruộng, không phụ thuộc điện/thiết bị, chi phí gần bằng không</td><td>Dễ tổng hợp, tìm kiếm, làm phép cân đối khối lượng; xuất báo cáo nhanh khi đánh giá</td></tr>
<tr><th>Nhược điểm</th><td>Khó tổng hợp, dễ mất, chữ khó đọc</td><td>Dễ trì hoãn nhập liệu ("để tối về nhập") dẫn tới sai và thiếu</td></tr>
<tr><th>Phù hợp</th><td>Hộ nhỏ, ít thửa</td><td>Trang trại nhiều thửa, nhóm hộ, doanh nghiệp xuất khẩu</td></tr>
</table>
<p>Điều quan trọng không phải là hình thức mà là tính liên tục: hồ sơ được ghi ngay khi hoạt động diễn ra, đầy đủ, không có khoảng trống. Một cuốn sổ đơn giản được duy trì đều đặn có giá trị hơn nhiều so với một hệ thống phần mềm phức tạp nhưng bị bỏ trống nửa vụ.</p>

<h2>Kết nối với truy xuất nguồn gốc</h2>
<p>Hồ sơ nội bộ của trang trại là lớp nền của truy xuất nguồn gốc. Ở cấp quốc gia, Việt Nam đã có Đề án về truy xuất nguồn gốc (Quyết định 100/QĐ-TTg ngày 19/1/2019), bộ tiêu chuẩn TCVN 12850:2019 về yêu cầu chung đối với hệ thống truy xuất, và Cổng thông tin truy xuất nguồn gốc sản phẩm, hàng hóa quốc gia (vận hành từ tháng 10/2024). Doanh nghiệp muốn kết nối dữ liệu lô hàng lên hệ thống này để phục vụ xuất khẩu sẽ cần dữ liệu gốc chính là các hồ sơ nêu trên, được số hóa và gắn mã lô nhất quán. Nói cách khác, làm tốt nhật ký đồng ruộng hôm nay là chuẩn bị sẵn cho yêu cầu truy xuất điện tử ngày mai.</p>

<h2>Số hóa hồ sơ: bắt đầu từ đâu</h2>
<p>Không cần đầu tư phần mềm đắt tiền ngay. Một cách làm được nhiều nhóm hộ áp dụng: giữ ghi chép tại ruộng bằng sổ giấy hoặc biểu mẫu in sẵn, rồi mỗi tuần nhập lại vào một bảng tính dùng chung theo mẫu thống nhất. Bảng tính cho phép cộng nhanh sản lượng theo thửa, đối chiếu nhập – xuất kho vật tư, và phát hiện dòng bị thiếu. Khi quy mô lớn hơn hoặc khi người mua yêu cầu tem truy xuất, có thể chuyển sang phần mềm chuyên dụng có hỗ trợ mã QR, nhưng chất lượng dữ liệu vẫn phụ thuộc vào kỷ luật ghi chép ngoài đồng — phần mềm không tự sinh ra dữ liệu đúng.</p>

<h2>Lưu giữ trong bao lâu</h2>
<p>Các tiêu chuẩn hữu cơ thường yêu cầu lưu hồ sơ tối thiểu 5 năm; một số thị trường và một số loại chứng từ yêu cầu lâu hơn. Nên lưu cả bản gốc giấy và bản số hóa, ở hai nơi khác nhau, để không mất toàn bộ khi hỏng máy hoặc thất lạc sổ.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://truyxuatnguongoc.gov.vn/" rel="noopener nofollow" target="_blank">Cổng thông tin truy xuất nguồn gốc sản phẩm, hàng hóa quốc gia</a>.</li>
<li><a href="https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+12850%3A2019" rel="noopener nofollow" target="_blank">TCVN 12850:2019 — Truy xuất nguồn gốc — Yêu cầu chung đối với hệ thống truy xuất nguồn gốc</a>.</li>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=194623" rel="noopener nofollow" target="_blank">Nghị định 109/2018/NĐ-CP về Nông nghiệp hữu cơ</a> (quy định về truy xuất nguồn gốc sản phẩm hữu cơ).</li>
<li><a href="https://nbc.gov.vn/" rel="noopener nofollow" target="_blank">Trung tâm Mã số, Mã vạch Quốc gia</a> — đơn vị vận hành Cổng truy xuất nguồn gốc quốc gia.</li>
</ul>
`,
  },

  "vung-dem-nhiem-cheo-va-kiem-soat-rui-ro-trong-trang-trai-huu-co": {
    excerpt:
      "Một trang trại canh tác đúng vẫn có thể bị nhiễm vật tư cấm từ bên ngoài. Bài viết phân loại các nguồn nhiễm chéo, cách thiết lập vùng đệm theo mức rủi ro, và quy trình xử lý khi nghi ngờ có nhiễm.",
    content: `
<p>Chứng nhận hữu cơ đánh giá không chỉ những gì nhà sản xuất chủ động làm, mà cả những gì có thể vô tình xảy ra. Nhiễm chéo từ bên ngoài — thuốc bảo vệ thực vật trôi dạt, nước tưới ô nhiễm, thiết bị dùng chung — là một trong những rủi ro được xem xét kỹ nhất trong mọi cuộc đánh giá, và cũng là nguyên nhân phổ biến khiến một lô sản phẩm bị loại khỏi diện hữu cơ dù canh tác hoàn toàn đúng.</p>

<h2>Các nguồn nhiễm chéo phổ biến</h2>
<ul>
<li><strong>Bay hơi và trôi dạt thuốc:</strong> từ ruộng lân cận canh tác thông thường khi phun trong điều kiện gió, đặc biệt khi phun bằng thiết bị áp lực cao hoặc bằng thiết bị bay.</li>
<li><strong>Nước tưới:</strong> nguồn nước mặt chảy qua khu vực có sử dụng hóa chất, nước thải sinh hoạt hoặc công nghiệp trước khi đến ruộng hữu cơ.</li>
<li><strong>Thiết bị dùng chung:</strong> máy làm đất, bình phun, phương tiện vận chuyển chưa được làm sạch giữa khu vực hữu cơ và không hữu cơ.</li>
<li><strong>Kho và bao bì:</strong> tồn dư từ vật tư cũ trong kho, bao bì tái sử dụng từng chứa phân bón hoặc hóa chất.</li>
<li><strong>Sau thu hoạch:</strong> sơ chế, bảo quản, vận chuyển chung với sản phẩm thông thường; kho lạnh có xử lý chống nấm bằng chất không được phép.</li>
<li><strong>Đất tồn lưu:</strong> dư lượng hóa chất khó phân hủy từ lịch sử canh tác trước đây của chính thửa đất.</li>
</ul>

<h2>Vùng đệm: rộng bao nhiêu là đủ</h2>
<p>Vùng đệm là dải đất hoặc rào cản ngăn cách khu vực hữu cơ với nguồn rủi ro bên ngoài. Nguyên tắc chung của các tiêu chuẩn: sản phẩm thu hoạch trên vùng đệm không được bán là hữu cơ, và chiều rộng vùng đệm phải tương xứng với mức rủi ro thực tế chứ không có một con số cố định cho mọi trường hợp.</p>
<table>
<tr><th>Tình huống ranh giới</th><th>Mức rủi ro</th><th>Biện pháp thường dùng</th></tr>
<tr><td>Giáp ruộng hữu cơ khác hoặc đất bỏ hoang</td><td>Thấp</td><td>Không cần vùng đệm hoặc chỉ cần ranh giới rõ ràng</td></tr>
<tr><td>Giáp ruộng thường phun tay, cây thấp</td><td>Trung bình</td><td>Dải đất trống hoặc hàng rào cây; không thu hữu cơ ở mép ruộng</td></tr>
<tr><td>Giáp ruộng thường phun máy áp lực cao / phun bằng thiết bị bay</td><td>Cao</td><td>Hàng rào cây cao nhiều tầng, khoảng cách lớn hơn, thỏa thuận lịch phun với hộ bên cạnh</td></tr>
<tr><td>Giáp đường giao thông lớn, khu công nghiệp</td><td>Cao</td><td>Hàng rào chắn bụi, đánh giá bổ sung về kim loại nặng trong đất/sản phẩm</td></tr>
</table>
<p>Hàng rào cây cao nhiều tầng vừa cản trôi dạt thuốc, vừa tạo môi trường sống cho thiên địch — một biện pháp "hai trong một" mà nhiều trang trại hữu cơ lâu năm đầu tư ngay từ đầu.</p>

<h2>Vùng đệm với ruộng lúa và kênh mương</h2>
<p>Ở Đồng bằng sông Cửu Long và các vùng canh tác lúa, rủi ro lớn nhất thường không phải trôi dạt trong không khí mà là nước: kênh tưới chung đi qua nhiều ruộng canh tác thông thường trước khi đến ruộng hữu cơ. Biện pháp phổ biến gồm: bố trí ruộng hữu cơ ở đầu nguồn nước; đắp bờ bao và có cống điều tiết riêng; dùng ao lắng trước khi lấy nước vào ruộng; và kiểm nghiệm nước tưới định kỳ, đặc biệt sau đợt phun rộ của cả vùng. Khi không thể tách nguồn nước, một số nhóm hộ chuyển sang chứng nhận theo vùng tập trung, vận động cả cánh đồng cùng canh tác hữu cơ để loại bỏ nguồn nhiễm từ bên trong.</p>

<h2>Nhiễm từ lịch sử đất</h2>
<p>Một số hoạt chất bảo vệ thực vật, đặc biệt nhóm clo hữu cơ đã bị cấm từ lâu, có thể tồn lưu trong đất hàng chục năm. Nếu thửa đất từng canh tác thâm canh hoặc gần kho thuốc, khu xử lý cũ, nên phân tích đất tìm dư lượng các nhóm khó phân hủy trước khi đăng ký chứng nhận. Phát hiện sớm giúp tránh trường hợp đã đầu tư cả giai đoạn chuyển đổi rồi mới bị loại vì dư lượng nền vượt ngưỡng.</p>

<h2>Ví dụ một bản đánh giá rủi ro ranh giới</h2>
<table>
<tr><th>Vị trí</th><th>Nguồn rủi ro</th><th>Mức</th><th>Biện pháp</th><th>Người phụ trách</th></tr>
<tr><td>Thửa A, cạnh Bắc</td><td>Ruộng bắp phun thuốc cỏ, phun máy</td><td>Cao</td><td>Hàng keo 3 m + không thu hữu cơ 2 luống mép; trao đổi lịch phun</td><td>Tổ trưởng sản xuất</td></tr>
<tr><td>Thửa A, cạnh Đông</td><td>Đường đất, bụi</td><td>Thấp</td><td>Hàng cây thấp chắn bụi</td><td>—</td></tr>
<tr><td>Nguồn nước</td><td>Kênh chung qua 4 ruộng thường</td><td>Trung bình</td><td>Ao lắng + kiểm nghiệm nước 2 lần/vụ</td><td>Phụ trách kỹ thuật</td></tr>
<tr><td>Kho vật tư</td><td>Để chung với phân hóa học của khu thường</td><td>Cao</td><td>Ngăn kho riêng, khóa riêng, biển báo</td><td>Thủ kho</td></tr>
</table>
<p>Bản này ngắn nhưng đủ dùng: mỗi dòng là một rủi ro cụ thể, một biện pháp cụ thể, một người chịu trách nhiệm. Cập nhật mỗi khi có thay đổi ở ruộng bên cạnh hoặc trong trang trại.</p>

<h2>Xây dựng bản đánh giá rủi ro</h2>
<p>Trang trại nên lập một bản phân tích bằng văn bản: liệt kê từng ranh giới thửa và từng công đoạn có nguy cơ (tưới, dùng chung thiết bị, kho chung), xác định mức rủi ro, và ghi rõ biện pháp phòng ngừa tương ứng cùng người chịu trách nhiệm. Đây chính là tài liệu đánh giá viên sẽ yêu cầu xem. Trao đổi trực tiếp với các hộ canh tác lân cận về lịch phun và hướng gió là biện pháp hữu hiệu và gần như không tốn kém.</p>

<h2>Khi nghi ngờ có nhiễm</h2>
<p>Nếu phát hiện dấu hiệu nhiễm — mùi thuốc sau khi ruộng bên cạnh phun, cây có triệu chứng bất thường, kết quả kiểm nghiệm có dư lượng — cần: (1) cách ly ngay sản phẩm của thửa liên quan, không bán là hữu cơ; (2) thông báo cho tổ chức chứng nhận theo đúng thời hạn quy định trong hợp đồng; (3) lấy mẫu kiểm nghiệm để xác định phạm vi; (4) ghi lại toàn bộ sự việc và biện pháp xử lý. Chủ động khai báo và xử lý minh bạch một sự cố thường chỉ dẫn tới việc loại một lô hàng; che giấu và bị phát hiện sau có thể dẫn tới đình chỉ hoặc thu hồi chứng nhận cho cả trang trại.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=194623" rel="noopener nofollow" target="_blank">Nghị định 109/2018/NĐ-CP về Nông nghiệp hữu cơ</a>.</li>
<li><a href="https://tcvn.gov.vn/gioi-thieu-tong-quan-he-thong-tieu-chuan-ve-san-pham-nong-nghiep-huu-co/13/10/2022/" rel="noopener nofollow" target="_blank">Hệ thống TCVN 11041 về nông nghiệp hữu cơ</a> (TCVN 11041-1:2017 và 11041-2:2017 quy định về vùng đệm và kiểm soát nhiễm chéo).</li>
<li><a href="https://www.ams.usda.gov/about-ams/programs-offices/national-organic-program" rel="noopener nofollow" target="_blank">USDA National Organic Program</a> — hướng dẫn về buffer zone và ngăn ngừa nhiễm chéo.</li>
</ul>
`,
  },

  "chung-nhan-nhom-cho-nong-ho-nho-va-he-thong-kiem-soat-noi-bo": {
    excerpt:
      "Chứng nhận riêng lẻ thường quá tốn kém với nông hộ nhỏ. Bài viết giải thích cơ chế chứng nhận nhóm và hệ thống kiểm soát nội bộ (ICS), so sánh với mô hình PGS được Nghị định 109/2018/NĐ-CP khuyến khích.",
    content: `
<p>Chi phí và khối lượng thủ tục của chứng nhận hữu cơ có thể vượt quá khả năng của một nông hộ nhỏ đơn lẻ. Đây là vấn đề lớn ở Việt Nam, nơi phần lớn diện tích nông nghiệp nằm ở các hộ quy mô nhỏ. Chứng nhận nhóm ra đời để giải quyết: nhiều hộ sản xuất cùng đứng chung trong một chứng nhận, với một hệ thống quản lý chung giám sát việc tuân thủ.</p>

<h2>Hệ thống kiểm soát nội bộ (ICS) là gì</h2>
<p>Hệ thống kiểm soát nội bộ (Internal Control System – ICS) là bộ máy do chính tổ chức của nhóm — hợp tác xã, tổ hợp tác, doanh nghiệp đầu mối — vận hành để bảo đảm từng thành viên tuân thủ tiêu chuẩn hữu cơ. Nó bao gồm quy chế thành viên và chế tài, tài liệu đào tạo, danh sách nông hộ và bản đồ thửa đất được cập nhật, hợp đồng cam kết của từng hộ, và quan trọng nhất là đội ngũ kiểm tra viên nội bộ đi thăm từng hộ ít nhất một lần mỗi năm.</p>

<h2>Đánh giá hai lớp</h2>
<ul>
<li><strong>Lớp trong:</strong> kiểm tra viên nội bộ thăm 100% nông hộ thành viên, lập biên bản từng hộ, phát hiện và đề xuất xử lý vi phạm. Kiểm tra viên phải được đào tạo và không được đánh giá hộ của chính mình hoặc người thân.</li>
<li><strong>Lớp ngoài:</strong> tổ chức chứng nhận độc lập đánh giá bản thân hệ thống ICS (hồ sơ, năng lực kiểm tra viên, tính nhất quán của biên bản) và thăm một số nông hộ theo mẫu — thường theo công thức căn bậc hai của số hộ — để kiểm chứng ICS có hoạt động thật hay chỉ tồn tại trên giấy.</li>
</ul>
<p>Nếu tổ chức chứng nhận kết luận ICS đủ tin cậy, cả nhóm được chứng nhận. Nếu ICS lỏng lẻo — biên bản kiểm tra nội bộ sơ sài, phát hiện vi phạm mà không xử lý, danh sách hộ không khớp thực tế — cả nhóm có thể bị đình chỉ, kể cả những hộ làm đúng.</p>

<h2>Chứng nhận nhóm so với PGS</h2>
<table>
<tr><th></th><th>Chứng nhận nhóm (bên thứ ba + ICS)</th><th>PGS — Hệ thống bảo đảm cùng tham gia</th></tr>
<tr><th>Ai đánh giá</th><td>Tổ chức chứng nhận độc lập, được chỉ định/công nhận</td><td>Chính các bên trong hệ thống: nông dân, người bán, người tiêu dùng, chuyên gia</td></tr>
<tr><th>Giá trị pháp lý</th><td>Được công nhận cho thương mại trong nước và xuất khẩu (tùy tiêu chuẩn)</td><td>Chủ yếu phục vụ thị trường nội địa, bán trực tiếp, niềm tin cộng đồng</td></tr>
<tr><th>Chi phí</th><td>Cao hơn, nhưng chia cho cả nhóm</td><td>Thấp, dựa trên công sức tình nguyện</td></tr>
<tr><th>Vị trí trong chính sách VN</th><td>Bắt buộc để ghi nhãn "hữu cơ" theo Nghị định 109/2018/NĐ-CP</td><td>Được Nghị định 109/2018/NĐ-CP khuyến khích tham gia</td></tr>
</table>
<p>Nghị định 109/2018/NĐ-CP nêu rõ khuyến khích nông dân, tổ chức, cá nhân tham gia Hệ thống bảo đảm cùng tham gia (PGS) — một hệ thống dựa trên sự tham gia của nông dân, người bán, người tiêu dùng và các bên liên quan. PGS phù hợp với chuỗi bán trực tiếp và xây dựng niềm tin tại chỗ; còn để xuất khẩu hoặc vào siêu thị lớn, phần lớn trường hợp vẫn cần chứng nhận bên thứ ba theo nhóm.</p>

<h2>Điều kiện để mô hình nhóm hoạt động</h2>
<p>Chứng nhận nhóm phù hợp với các hộ có quy mô nhỏ tương đồng, canh tác các loại cây tương tự, ở địa bàn gần nhau. Yếu tố quyết định thành công là năng lực quản trị của tổ chức đầu mối: hồ sơ đầy đủ và cập nhật, kiểm tra viên nội bộ được đào tạo và độc lập, và chế tài với hộ vi phạm được thực thi nghiêm túc — kể cả loại hộ khỏi nhóm khi cần, để bảo vệ chứng nhận chung.</p>

<h2>Lợi ích ngoài chứng nhận</h2>
<p>Nhóm được tổ chức tốt còn mang lại lợi thế khác: mua chung vật tư đầu vào với giá tốt hơn, thương lượng chung với người mua, chia sẻ kỹ thuật, gộp sản lượng để đủ quy mô cho đơn hàng lớn, và giảm rủi ro đầu ra. Với nhiều vùng sản xuất, ICS trở thành hạ tầng tổ chức cho cả chuỗi giá trị chứ không chỉ là công cụ phục vụ đánh giá.</p>

<h2>Chi phí chứng nhận được chia sẻ ra sao</h2>
<p>Giả sử một hợp tác xã 40 hộ, tổng diện tích 30 ha. Chi phí chứng nhận nhóm một năm — gồm phí đánh giá hệ thống ICS, phí thăm mẫu một số hộ, phí cấp giấy và giám sát — nếu là một khoản cố định thì chia cho 40 hộ hoặc theo diện tích, mỗi hộ chỉ gánh một phần nhỏ so với việc tự làm chứng nhận riêng. Đổi lại, nhóm phải tự chi cho bộ máy ICS: thù lao kiểm tra viên nội bộ, in ấn biểu mẫu, đào tạo. Nhiều nơi dùng nguồn hỗ trợ theo Nghị định 109/2018/NĐ-CP và ngân sách khuyến nông địa phương để bù phần chi phí chứng nhận trong vài năm đầu.</p>

<h2>Vì sao một số nhóm tan rã</h2>
<ul>
<li>Bộ máy ICS chỉ tồn tại trên giấy để qua đánh giá, không thực sự đi kiểm tra từng hộ.</li>
<li>Không có chế tài, hoặc có mà nể nang không áp dụng, khiến hộ làm đúng mất động lực.</li>
<li>Đầu ra không ổn định: chứng nhận xong nhưng không bán được giá tốt hơn, hộ bỏ cuộc.</li>
<li>Phụ thuộc hoàn toàn vào một cán bộ dự án; khi dự án kết thúc thì ICS ngừng hoạt động.</li>
</ul>
<p>Yếu tố chung của các nhóm bền vững là ICS được vận hành như một chức năng thường xuyên của hợp tác xã, có ngân sách riêng và có người chịu trách nhiệm rõ ràng, không phải một hoạt động phụ thuộc tài trợ.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=194623" rel="noopener nofollow" target="_blank">Nghị định 109/2018/NĐ-CP về Nông nghiệp hữu cơ</a> — quy định về PGS và chính sách hỗ trợ.</li>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=200315" rel="noopener nofollow" target="_blank">Quyết định 885/QĐ-TTg ngày 23/6/2020 — Đề án phát triển nông nghiệp hữu cơ giai đoạn 2020–2030</a>.</li>
<li><a href="https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+12134%3A2017" rel="noopener nofollow" target="_blank">TCVN 12134:2017 — Yêu cầu đối với tổ chức chứng nhận</a> (bao gồm đánh giá nhóm).</li>
</ul>
`,
  },

  "duy-tri-chung-nhan-huu-co-danh-gia-dinh-ky-va-nhung-loi-thuong-gap": {
    excerpt:
      "Đạt chứng nhận đã khó, giữ được còn đòi hỏi kỷ luật liên tục. Bài viết điểm lại các lỗi hồ sơ và lỗi hiện trường phổ biến trong đánh giá giám sát hằng năm, phân loại mức độ và cách phòng ngừa.",
    content: `
<p>Chứng nhận hữu cơ có hiệu lực trong một khoảng thời gian nhất định và phụ thuộc vào việc vượt qua các cuộc đánh giá giám sát tiếp theo — theo phương thức 5 (Thông tư 28/2012/TT-BKHCN) đối với TCVN nông nghiệp hữu cơ, tức là có giám sát định kỳ, thường hằng năm, cộng khả năng đánh giá đột xuất. Phần lớn điểm không phù hợp trong đánh giá định kỳ không đến từ hành vi cố ý mà từ sự thiếu chặt chẽ trong quản lý hằng ngày.</p>

<h2>Các lỗi hồ sơ thường gặp</h2>
<ul>
<li>Nhật ký đồng ruộng bị bỏ trống trong một số giai đoạn, đặc biệt vào mùa cao điểm khi ai cũng bận ngoài đồng.</li>
<li>Thiếu chứng từ hoặc bằng chứng tính hợp lệ cho một vài lô vật tư mua ngoài.</li>
<li>Không cập nhật kế hoạch sản xuất hữu cơ khi trang trại đổi cây trồng, đổi nhà cung cấp vật tư, hoặc mở rộng diện tích.</li>
<li>Hồ sơ bán hàng không khớp hồ sơ thu hoạch về khối lượng hoặc mã lô.</li>
<li>Kết quả khắc phục điểm không phù hợp của kỳ trước không được lưu lại đầy đủ.</li>
</ul>

<h2>Các lỗi trên hiện trường</h2>
<ul>
<li>Vùng đệm bị thu hẹp do canh tác lấn dần ra mép ruộng qua các vụ.</li>
<li>Vật tư không rõ nguồn gốc, hoặc vật tư của khu vực không hữu cơ, để lẫn trong kho chung.</li>
<li>Thiết bị dùng chung giữa khu hữu cơ và không hữu cơ nhưng không có quy trình làm sạch được ghi lại.</li>
<li>Biển báo, phân khu giữa khu vực hữu cơ và không hữu cơ không rõ ràng.</li>
<li>Cây trồng hoặc giống thực tế ngoài ruộng không khớp với danh mục đã đăng ký.</li>
</ul>

<h2>Điểm không phù hợp được phân loại ra sao</h2>
<table>
<tr><th>Mức</th><th>Bản chất</th><th>Hệ quả thường gặp</th></tr>
<tr><td>Nhẹ (minor)</td><td>Sai sót đơn lẻ, không ảnh hưởng trực tiếp tính hữu cơ của sản phẩm</td><td>Yêu cầu khắc phục và nộp bằng chứng trong thời hạn; theo dõi ở kỳ sau</td></tr>
<tr><td>Nặng (major)</td><td>Lỗi hệ thống, lặp lại, hoặc có nguy cơ ảnh hưởng tính hữu cơ</td><td>Khắc phục kèm đánh giá bổ sung; có thể tạm dừng cấp chứng từ giao dịch cho tới khi đóng lỗi</td></tr>
<tr><td>Nghiêm trọng</td><td>Dùng chất cấm, gian lận khối lượng, bán hàng không hữu cơ dưới nhãn hữu cơ</td><td>Đình chỉ hoặc thu hồi chứng nhận; loại sản phẩm/lô liên quan; có thể bị xử lý theo pháp luật</td></tr>
</table>
<p>Đánh giá viên đánh giá cả hệ thống, không chỉ từng sự việc riêng lẻ. Nhiều khoảng trống nhỏ trong hồ sơ có thể bị cộng dồn thành một kết luận rằng hệ thống kiểm soát chưa vận hành ổn định, dẫn tới yêu cầu khắc phục sâu hơn hoặc tăng tần suất đánh giá — làm chi phí duy trì tăng lên.</p>

<h2>Cách phòng ngừa</h2>
<p>Giao trách nhiệm ghi hồ sơ cho một người cụ thể và có người thứ hai kiểm tra chéo. Rà soát hồ sơ theo tuần thay vì theo năm. Lưu chứng từ và bằng chứng hợp lệ của vật tư ngay khi nhận hàng, không để đến kỳ đánh giá mới đi xin lại. Mỗi năm, trước kỳ đánh giá, rà soát lại kế hoạch sản xuất hữu cơ và cập nhật mọi thay đổi về cây trồng, diện tích, nhà cung cấp. Coi việc duy trì hồ sơ như một phần của công việc canh tác, không phải một thủ tục hành chính tách rời — đó là khác biệt giữa trang trại giữ được chứng nhận nhiều năm và trang trại phải làm lại từ đầu.</p>

<h2>Lịch tự kiểm tra theo mùa vụ</h2>
<ul>
<li><strong>Đầu vụ:</strong> rà soát kế hoạch sản xuất hữu cơ; kiểm tra danh mục vật tư dự kiến và bằng chứng hợp lệ; xác nhận vùng đệm và biển báo còn nguyên.</li>
<li><strong>Giữa vụ:</strong> đối chiếu nhật ký đồng ruộng với thực tế; kiểm tra kho vật tư khớp sổ; lưu chứng từ các lô vật tư mới nhập.</li>
<li><strong>Thu hoạch:</strong> ghi sản lượng theo thửa và mã lô ngay khi thu; đối chiếu nhanh với năng suất dự kiến.</li>
<li><strong>Sau vụ:</strong> làm phép cân đối khối lượng đầu vào – đầu ra; hoàn thiện hồ sơ bán hàng; tổng hợp hồ sơ cho kỳ đánh giá.</li>
</ul>

<h2>Chuẩn bị cho ngày đánh giá</h2>
<p>Trước khi đánh giá viên đến: tập hợp toàn bộ hồ sơ theo thứ tự dễ tra; chuẩn bị bản đồ thửa cập nhật; rà lại các điểm không phù hợp của kỳ trước và bằng chứng đã khắc phục; bố trí người trực tiếp canh tác có mặt để trả lời phỏng vấn (đánh giá viên thường hỏi người làm thật, không chỉ hỏi chủ). Trong ngày đánh giá, trả lời trung thực; nếu có điểm chưa làm được thì nói rõ và nêu kế hoạch khắc phục, thay vì che giấu — đánh giá viên đánh giá cả thái độ xử lý vấn đề của hệ thống.</p>

<h2>Khi bị nêu điểm nặng hoặc bị đình chỉ</h2>
<p>Nếu nhận kết luận có điểm không phù hợp mức nặng hoặc quyết định đình chỉ, cần: (1) đọc kỹ nội dung và thời hạn khắc phục; (2) trong thời gian đình chỉ, không được bán sản phẩm kèm nhãn hữu cơ và không dùng chứng từ giao dịch hữu cơ; (3) lập kế hoạch khắc phục có mốc thời gian, thực hiện và lưu bằng chứng; (4) đề nghị đánh giá bổ sung khi đã sẵn sàng. Đình chỉ được gỡ khi tổ chức chứng nhận xác nhận đã khắc phục; nếu quá thời hạn mà không khắc phục, chứng nhận có thể bị thu hồi và trang trại phải bắt đầu lại quy trình, đôi khi kèm giai đoạn chuyển đổi mới.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=194623" rel="noopener nofollow" target="_blank">Nghị định 109/2018/NĐ-CP về Nông nghiệp hữu cơ</a>.</li>
<li><a href="https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+12134%3A2017" rel="noopener nofollow" target="_blank">TCVN 12134:2017 — Nông nghiệp hữu cơ — Yêu cầu đối với tổ chức chứng nhận</a> (quy định về giám sát và xử lý điểm không phù hợp).</li>
<li><a href="https://www.boa.gov.vn/" rel="noopener nofollow" target="_blank">Văn phòng Công nhận Chất lượng (BoA)</a>.</li>
</ul>
`,
  },

  // ═══════════════════════ THỊ TRƯỜNG & XU HƯỚNG ═══════════════════════

  "nhu-cau-thuc-pham-huu-co-toan-cau-cac-dong-luc-dai-han": {
    excerpt:
      "Nhu cầu thực phẩm hữu cơ ở nhiều thị trường phát triển được thúc đẩy bởi các yếu tố cấu trúc, không chỉ là trào lưu. Bài viết phân tích các động lực dài hạn kèm số liệu từ báo cáo FiBL–IFOAM.",
    content: `
<p>Ở nhiều thị trường có thu nhập cao, thực phẩm hữu cơ đã chuyển từ một phân khúc ngách sang một phần ổn định của ngành thực phẩm. Theo báo cáo thường niên "The World of Organic Agriculture" do Viện nghiên cứu Nông nghiệp hữu cơ (FiBL) và IFOAM – Organics International công bố đầu năm 2025, diện tích canh tác hữu cơ toàn cầu đạt khoảng 98,9 triệu ha (số liệu năm 2023), do khoảng 4,3 triệu nhà sản xuất quản lý, và doanh thu bán lẻ thực phẩm hữu cơ vượt 136 tỷ euro. Đằng sau con số đó là một số động lực mang tính cấu trúc, đáng để nhà sản xuất và nhà xuất khẩu hiểu rõ khi lập kế hoạch dài hạn.</p>

<h2>Mối quan tâm về sức khỏe</h2>
<p>Một bộ phận người tiêu dùng chọn thực phẩm hữu cơ vì muốn giảm tiếp xúc với dư lượng thuốc bảo vệ thực vật tổng hợp, đặc biệt khi mua thực phẩm cho trẻ nhỏ. Mối quan tâm này bền hơn các trào lưu ăn kiêng vì nó gắn với quyết định mua lặp lại của hộ gia đình: một khi đã chuyển sang mua rau, sữa hoặc thực phẩm cho bé loại hữu cơ, người mua thường duy trì thói quen đó nhiều năm.</p>

<h2>Quan tâm đến môi trường và khí hậu</h2>
<p>Nhiều người mua liên hệ canh tác hữu cơ với đất khỏe hơn, đa dạng sinh học cao hơn và ít ô nhiễm nguồn nước hơn. Chính sách công ở một số khu vực cũng đẩy theo hướng này: Liên minh châu Âu, trong Chiến lược "Từ trang trại đến bàn ăn", đặt mục tiêu đưa tỷ lệ đất nông nghiệp hữu cơ lên 25% vào năm 2030. Khi mục tiêu chính sách và mối quan tâm tiêu dùng cùng chiều, nhóm động lực môi trường có xu hướng mở rộng chứ không thu hẹp.</p>

<h2>Minh bạch và niềm tin</h2>
<p>Chứng nhận hữu cơ, với đánh giá bởi bên thứ ba, cung cấp một mức bảo đảm mà các tuyên bố tự công bố không có. Trong bối cảnh người tiêu dùng ngày càng hoài nghi với quảng cáo và "tẩy xanh" (greenwashing), một nhãn được kiểm chứng độc lập và có khung pháp lý đứng sau — như logo lá của EU hay con dấu USDA Organic — có giá trị riêng.</p>

<h2>Kênh phân phối mở rộng</h2>
<p>Khi các chuỗi bán lẻ lớn đưa dòng sản phẩm hữu cơ vào danh mục thường xuyên thay vì để ở góc chuyên biệt, rào cản tiếp cận với người tiêu dùng phổ thông giảm xuống. Giá chênh lệch giữa hữu cơ và thông thường ở nhiều nhóm hàng cũng thu hẹp dần khi sản lượng tăng. Đây là lý do thị trường lớn dần theo chiều rộng, không chỉ giới hạn ở cửa hàng thực phẩm hữu cơ chuyên biệt.</p>

<h2>Diễn biến không phải lúc nào cũng thẳng</h2>
<p>Cần lưu ý: nhu cầu hữu cơ nhạy với chu kỳ kinh tế. Trong giai đoạn lạm phát và sức mua yếu, một số thị trường lớn đã chứng kiến doanh thu hữu cơ chững lại hoặc giảm nhẹ trước khi phục hồi. Điều này không phủ nhận xu hướng dài hạn, nhưng nhắc nhà cung ứng rằng cần chuẩn bị cho những năm nhu cầu đi ngang.</p>

<h2>Bức tranh theo khu vực</h2>
<p>Theo số liệu tổng hợp trong báo cáo của FiBL–IFOAM, thị trường tiêu thụ tập trung chủ yếu ở Bắc Mỹ và châu Âu — hai khu vực này chiếm phần lớn doanh thu bán lẻ thực phẩm hữu cơ toàn cầu. Hoa Kỳ là thị trường đơn lẻ lớn nhất tính theo giá trị; Đức và Pháp là hai thị trường lớn nhất châu Âu. Xét mức chi tiêu bình quân đầu người cho sản phẩm hữu cơ, các nước dẫn đầu thường là Thụy Sĩ, Đan Mạch và một số nước Bắc Âu. Châu Á có tốc độ tăng nhanh nhưng xuất phát điểm thấp; đây vừa là thị trường tiêu thụ mới nổi, vừa là khu vực sản xuất — trong đó Ấn Độ, Trung Quốc và một số nước Đông Nam Á, gồm Việt Nam, nằm trong nhóm có diện tích canh tác hữu cơ lớn của châu lục.</p>

<h2>Nhóm hàng nào có dư địa cho nhà cung ứng Việt Nam</h2>
<ul>
<li><strong>Cà phê, hồ tiêu, điều, gia vị hữu cơ:</strong> Việt Nam đã có vị thế lớn ở dạng thông thường; phân khúc hữu cơ còn nhỏ và giá tốt.</li>
<li><strong>Trái cây nhiệt đới và sản phẩm chế biến từ trái cây</strong> (sấy, đông lạnh, nước ép cô đặc): nhu cầu ổn định ở EU, Nhật, Hàn.</li>
<li><strong>Gạo hữu cơ:</strong> có TCVN riêng (TCVN 11041-5:2018) và thị trường ngách ở nhiều nước.</li>
<li><strong>Nguyên liệu cho ngành thực phẩm và mỹ phẩm hữu cơ</strong> (dừa, quế, hồi, tinh dầu): người mua công nghiệp thường ký hợp đồng dài hạn.</li>
</ul>
<p>Điểm chung: các nhóm này Việt Nam có lợi thế khí hậu và kinh nghiệm canh tác, và người mua sẵn sàng trả thêm cho nguồn cung ổn định, có chứng nhận và truy xuất rõ ràng.</p>

<h2>Ý nghĩa với nhà cung ứng</h2>
<p>Các động lực trên cho thấy nhu cầu có nền tảng, nhưng cũng có tính chọn lọc: người mua sẵn sàng trả thêm để đổi lấy sự bảo đảm, nên họ đòi hỏi chất lượng ổn định giữa các lô và các vụ, hồ sơ chứng nhận và truy xuất minh bạch, và nguồn cung đủ lớn, đủ đều để họ lập kế hoạch. Đáp ứng được ba yêu cầu đó quan trọng hơn nhiều so với việc chạy theo từng xu hướng tiêu dùng nhất thời. Với Việt Nam, Đề án phát triển nông nghiệp hữu cơ giai đoạn 2020–2030 (Quyết định 885/QĐ-TTg) xác định định hướng gắn sản xuất hữu cơ với cả tiêu dùng trong nước và xuất khẩu, coi đây là hướng đi có giá trị gia tăng cao.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://www.fibl.org/en/info-centre/news/organic-market-back-on-track" rel="noopener nofollow" target="_blank">FiBL — "Global organic area nears 99 million hectares" (The World of Organic Agriculture 2025)</a>.</li>
<li><a href="https://www.ifoam.bio/news/global-organic-area-continues-grow-2025" rel="noopener nofollow" target="_blank">IFOAM – Organics International — Global organic area continues to grow (2025)</a>.</li>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=200315" rel="noopener nofollow" target="_blank">Quyết định 885/QĐ-TTg — Đề án phát triển nông nghiệp hữu cơ giai đoạn 2020–2030</a>.</li>
</ul>
`,
  },

  "huu-co-khac-gi-voi-sach-an-toan-va-tu-nhien": {
    excerpt:
      "\"Hữu cơ\", \"sạch\", \"an toàn\", \"tự nhiên\" có mức ràng buộc rất khác nhau. Bài viết đối chiếu bốn khái niệm với khung pháp lý Việt Nam: Nghị định 109/2018/NĐ-CP, VietGAP (TCVN 11892-1:2017) và Luật An toàn thực phẩm.",
    content: `
<p>Trên kệ hàng và trong quảng cáo, người tiêu dùng gặp nhiều thuật ngữ nghe có vẻ tương đương: hữu cơ, sạch, an toàn, tự nhiên, không hóa chất. Trên thực tế, chúng có mức độ ràng buộc pháp lý rất khác nhau, và sự nhầm lẫn này ảnh hưởng đến cả người mua lẫn nhà sản xuất đã đầu tư nghiêm túc.</p>

<h2>"Hữu cơ" — khái niệm được quy định chặt nhất</h2>
<p>Ở Việt Nam, theo Nghị định 109/2018/NĐ-CP, để ghi và bán một sản phẩm là "hữu cơ" thì sản phẩm đó phải được chứng nhận phù hợp TCVN về nông nghiệp hữu cơ (bộ TCVN 11041) hoặc phù hợp tiêu chuẩn quốc tế, khu vực, nước ngoài được áp dụng. Chứng nhận do một tổ chức độc lập thực hiện, bao trùm toàn bộ quá trình: đầu vào được phép, giai đoạn chuyển đổi đất, tách biệt trong chuỗi, ghi nhãn và truy xuất nguồn gốc. Đây là điểm khác biệt cốt lõi — "hữu cơ" nói về cả một hệ thống sản xuất, được bên thứ ba kiểm chứng.</p>

<h2>VietGAP — thực hành tốt, không phải hữu cơ</h2>
<p>VietGAP (Thực hành nông nghiệp tốt, tiêu chuẩn TCVN 11892-1:2017 cho trồng trọt) hướng tới an toàn thực phẩm, chất lượng sản phẩm, an toàn cho người lao động, bảo vệ môi trường và truy xuất nguồn gốc. VietGAP <strong>cho phép</strong> sử dụng phân bón và thuốc bảo vệ thực vật hóa học, nhưng phải nằm trong danh mục được phép, đúng liều, đúng thời gian cách ly. Nói cách khác, VietGAP quản lý cách dùng hóa chất cho an toàn; hữu cơ thì loại bỏ gần như toàn bộ hóa chất tổng hợp. Một sản phẩm VietGAP không được ghi là "hữu cơ".</p>

<h2>"An toàn" nói về ngưỡng, không phải phương pháp</h2>
<p>Thực phẩm "an toàn" được hiểu là đáp ứng các giới hạn về dư lượng thuốc bảo vệ thực vật, kim loại nặng và chỉ tiêu vi sinh theo quy định của Luật An toàn thực phẩm và các quy chuẩn kỹ thuật. Theo Nghị định 15/2018/NĐ-CP, phần lớn thực phẩm đã qua chế biến bao gói sẵn được doanh nghiệp <strong>tự công bố</strong> phù hợp quy định an toàn — tức là dựa trên cam kết và kết quả kiểm nghiệm của chính doanh nghiệp, không bắt buộc có đánh giá bên thứ ba như chứng nhận hữu cơ. Một sản phẩm canh tác thông thường vẫn có thể "an toàn" theo nghĩa này. "An toàn" không nói gì về việc sản phẩm được trồng bằng phương pháp nào.</p>

<h2>"Sạch" và "tự nhiên" — thường không có định nghĩa thống nhất</h2>
<p>Các từ như "rau sạch", "tự nhiên", "không hóa chất", "canh tác thuận tự nhiên" hiếm khi gắn với một tiêu chuẩn được kiểm chứng bởi bên thứ ba hay một định nghĩa trong văn bản pháp luật. Chúng có thể phản ánh nỗ lực thực sự của người sản xuất, nhưng người mua không có cách xác minh độc lập, và cách hiểu giữa các bên có thể rất khác nhau.</p>

<h2>Bốn khái niệm, đặt cạnh nhau</h2>
<table>
<tr><th>Thuật ngữ</th><th>Căn cứ</th><th>Dùng hóa chất tổng hợp?</th><th>Đánh giá bên thứ ba?</th></tr>
<tr><td>Hữu cơ</td><td>NĐ 109/2018, TCVN 11041 (hoặc tiêu chuẩn nước ngoài)</td><td>Không (trừ danh mục hẹp được phép)</td><td>Bắt buộc</td></tr>
<tr><td>VietGAP</td><td>TCVN 11892-1:2017</td><td>Có, trong danh mục và đúng quy định</td><td>Có (chứng nhận VietGAP)</td></tr>
<tr><td>An toàn</td><td>Luật ATTP, NĐ 15/2018, quy chuẩn kỹ thuật</td><td>Có, miễn dư lượng dưới ngưỡng</td><td>Thường là tự công bố</td></tr>
<tr><td>Sạch / tự nhiên</td><td>Không có định nghĩa pháp lý thống nhất</td><td>Không xác định</td><td>Thường không</td></tr>
</table>

<h2>Vì sao sự phân biệt này quan trọng</h2>
<p>Với người tiêu dùng, hiểu đúng giúp trả tiền cho đúng thứ mình muốn. Với nhà sản xuất hữu cơ đã đầu tư vào chứng nhận, việc thị trường phân biệt rõ ràng bảo vệ giá trị khoản đầu tư đó khỏi bị pha loãng bởi các tuyên bố không kiểm chứng. Nghị định 109/2018/NĐ-CP cũng quy định việc thanh tra, kiểm tra và xử lý vi phạm đối với hành vi ghi nhãn "hữu cơ" sai — đây là công cụ để giữ sân chơi công bằng.</p>

<h2>Đọc nhãn thế nào cho đúng</h2>
<p>Với sản phẩm bán tại Việt Nam ghi "hữu cơ", trên nhãn hoặc bao bì nên có: tên tiêu chuẩn được chứng nhận (TCVN 11041 hoặc tiêu chuẩn nước ngoài), tên tổ chức chứng nhận, và mã số hoặc dấu hiệu nhận biết. Với hàng nhập khẩu, thường thấy logo lá của EU kèm mã số tổ chức kiểm soát, con dấu USDA Organic, hoặc JAS Mark. Nếu bao bì chỉ ghi "organic", "rau hữu cơ" mà không dẫn tiêu chuẩn hay tổ chức chứng nhận nào, người mua có quyền đặt câu hỏi. Các cụm từ như "canh tác theo hướng hữu cơ", "hữu cơ tự nhiên" không tương đương với sản phẩm được chứng nhận hữu cơ.</p>

<h2>PGS đứng ở đâu</h2>
<p>Hệ thống bảo đảm cùng tham gia (PGS) là một hình thức bảo đảm dựa trên sự tham gia của nông dân, người bán, người tiêu dùng và các bên liên quan, được Nghị định 109/2018/NĐ-CP khuyến khích. PGS phù hợp với các chuỗi bán trực tiếp, chợ phiên, nhóm mua chung, nơi người mua có thể tự tìm hiểu và giám sát. Sản phẩm PGS thường minh bạch về quy trình nhưng không có giá trị pháp lý tương đương chứng nhận bên thứ ba khi vào siêu thị lớn hoặc xuất khẩu. Người tiêu dùng nên hiểu PGS là "niềm tin có tổ chức trong cộng đồng", còn chứng nhận bên thứ ba là "bảo đảm có thể dùng cho thương mại chính thức".</p>

<h2>Khi nào sự nhầm lẫn gây thiệt hại thật</h2>
<p>Nếu thị trường không phân biệt được bốn nhóm khái niệm, hệ quả là: người tiêu dùng trả giá cao cho sản phẩm chỉ dừng ở mức "an toàn"; nhà sản xuất đầu tư chứng nhận hữu cơ phải cạnh tranh về giá với sản phẩm tự nhận là "sạch" không tốn chi phí kiểm chứng; và niềm tin chung vào nhãn hữu cơ bị xói mòn. Đây là lý do việc thực thi quy định ghi nhãn — kiểm tra thị trường, xử lý sản phẩm gắn nhãn hữu cơ sai — quan trọng không kém việc ban hành tiêu chuẩn.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=194623" rel="noopener nofollow" target="_blank">Nghị định 109/2018/NĐ-CP về Nông nghiệp hữu cơ</a>.</li>
<li><a href="https://tieuchuan.vsqi.gov.vn/tieuchuan/view?sohieu=TCVN+11892-1%3A2017" rel="noopener nofollow" target="_blank">TCVN 11892-1:2017 — Thực hành nông nghiệp tốt (VietGAP) — Phần 1: Trồng trọt</a>.</li>
<li><a href="https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=192717" rel="noopener nofollow" target="_blank">Nghị định 15/2018/NĐ-CP hướng dẫn Luật An toàn thực phẩm</a>.</li>
</ul>
`,
  },

  "nong-nghiep-tai-tao-va-moi-lien-he-voi-canh-tac-huu-co": {
    excerpt:
      "Nông nghiệp tái tạo đang được nhắc đến nhiều trong cam kết của các tập đoàn thực phẩm. Bài viết làm rõ khái niệm, điểm giao và điểm khác so với canh tác hữu cơ được chứng nhận, và liên hệ với định hướng nông nghiệp tuần hoàn của Việt Nam.",
    content: `
<p>Thuật ngữ "nông nghiệp tái tạo" (regenerative agriculture) xuất hiện ngày càng nhiều trong cam kết của các tập đoàn thực phẩm và trong truyền thông về khí hậu. Với nhà sản xuất hữu cơ, hiểu khái niệm này giúp định vị sản phẩm và tham gia các cuộc trò chuyện với người mua một cách chủ động, thay vì bị động khi được hỏi.</p>

<h2>Nông nghiệp tái tạo là gì</h2>
<p>Nông nghiệp tái tạo là cách tiếp cận đặt trọng tâm vào việc cải thiện sức khỏe đất, tăng hàm lượng chất hữu cơ (và qua đó tăng lượng carbon lưu giữ trong đất), tăng đa dạng sinh học và cải thiện chu trình nước theo thời gian. Nó thường được mô tả qua kết quả mong muốn hơn là qua một danh mục quy tắc cố định, và tập trung vào một nhóm thực hành: giảm hoặc bỏ làm đất, giữ đất luôn có lớp phủ sống hoặc tàn dư, đa dạng cây trồng và luân canh, tích hợp vật nuôi, và hạn chế tối đa đầu vào tổng hợp.</p>

<h2>Điểm giao với canh tác hữu cơ</h2>
<p>Nhiều thực hành cốt lõi trùng nhau: xây dựng chất hữu cơ, luân canh đa dạng, cây che phủ, hạn chế xáo trộn đất, nuôi dưỡng hệ vi sinh vật đất, giữ hàng rào cây và dải hoa cho thiên địch. Một trang trại hữu cơ được quản lý tốt thường đã thực hiện phần lớn những gì được gọi là "tái tạo" — chỉ là chưa gọi tên như vậy.</p>

<h2>Điểm khác biệt</h2>
<table>
<tr><th></th><th>Canh tác hữu cơ (được chứng nhận)</th><th>Nông nghiệp tái tạo</th></tr>
<tr><th>Cơ sở</th><td>Bộ tiêu chuẩn cụ thể (TCVN 11041, EU, USDA, JAS) và đánh giá bên thứ ba</td><td>Chưa có một khung chứng nhận thống nhất toàn cầu; một số chương trình tư nhân đang hình thành</td></tr>
<tr><th>Trọng tâm</th><td>"Trồng bằng gì" — kiểm soát chặt đầu vào</td><td>"Đất và hệ sinh thái thay đổi ra sao" — đo kết quả</td></tr>
<tr><th>Đầu vào tổng hợp</th><td>Cấm gần như toàn bộ hóa chất tổng hợp</td><td>Một số cách hiểu tập trung vào kết quả đất, không cấm tuyệt đối mọi đầu vào</td></tr>
<tr><th>Đo lường</th><td>Tuân thủ quy trình, hồ sơ</td><td>Chỉ số đất: chất hữu cơ, carbon, đa dạng sinh học, thấm nước</td></tr>
</table>
<p>Vì "tái tạo" chưa có định nghĩa pháp lý, một tuyên bố "sản phẩm tái tạo" trên nhãn hiện chưa có sức nặng pháp lý như nhãn "hữu cơ". Người mua chuyên nghiệp thường yêu cầu dữ liệu đo lường đi kèm.</p>

<h2>Trả lời người mua khi được hỏi về "tái tạo"</h2>
<p>Ngày càng nhiều người mua đưa "tái tạo" vào bộ câu hỏi đánh giá nhà cung ứng. Cách trả lời chủ động: nêu chứng nhận hữu cơ đang có làm nền tảng đã được kiểm chứng; liệt kê các thực hành cải tạo đất đang áp dụng (che phủ, luân canh, giảm làm đất, phân hữu cơ tự ủ); và trình bày dữ liệu theo dõi sức khỏe đất qua vài năm nếu có. Tránh hứa hẹn vượt quá dữ liệu — nếu chưa đo carbon trong đất thì nói rõ là chưa đo, kèm kế hoạch bắt đầu. Người mua chuyên nghiệp đánh giá cao sự trung thực và một lộ trình cải thiện có thể kiểm chứng hơn là một tuyên bố hoành tráng không có số liệu.</p>

<h2>Rủi ro "tẩy xanh" và cách phòng</h2>
<p>Ở một số thị trường, cơ quan quản lý và tổ chức bảo vệ người tiêu dùng đã xử lý các tuyên bố môi trường mơ hồ hoặc không chứng minh được. Với nhà xuất khẩu, một tuyên bố "tái tạo" hoặc "trung hòa carbon" không có phương pháp và dữ liệu rõ ràng là rủi ro pháp lý và rủi ro uy tín. Nguyên tắc an toàn: chỉ nói điều gì đo được, ghi rõ phạm vi và giả định, và sẵn sàng cung cấp hồ sơ khi được hỏi.</p>

<h2>Liên hệ với chính sách Việt Nam</h2>
<p>Việt Nam chưa có quy định riêng về "nông nghiệp tái tạo", nhưng định hướng chính sách đi cùng chiều. Quyết định 885/QĐ-TTg gắn phát triển nông nghiệp hữu cơ với "kinh tế nông nghiệp tuần hoàn", thân thiện môi trường. Chiến lược phát triển nông nghiệp và nông thôn bền vững và các cam kết của Việt Nam về giảm phát thải (bao gồm mục tiêu phát thải ròng bằng 0 vào năm 2050) đều tạo bối cảnh thuận lợi cho các thực hành cải tạo đất và giữ carbon trong đất.</p>

<h2>Cách tiếp cận thực dụng</h2>
<p>Hai khung này không loại trừ nhau. Nhiều nhà sản xuất coi chứng nhận hữu cơ là nền tảng có thể kiểm chứng, còn câu chuyện tái tạo là cách truyền đạt những cải thiện dài hạn về đất và hệ sinh thái mà họ đang thực hiện. Điều kiện tiên quyết là mọi tuyên bố đều phải có dữ liệu và hồ sơ đi kèm: đo chất hữu cơ trong đất định kỳ, ghi lại thực hành, chụp ảnh hiện trạng theo mùa. Không có dữ liệu, "tái tạo" chỉ là một từ tiếp thị dễ bị đặt câu hỏi.</p>

<h2>Đo sức khỏe đất: các chỉ số thực tế</h2>
<p>Nếu muốn kể câu chuyện tái tạo có bằng chứng, nên theo dõi một số chỉ số theo thời gian trên cùng các điểm lấy mẫu cố định:</p>
<ul>
<li><strong>Hàm lượng chất hữu cơ (hoặc carbon hữu cơ) trong đất:</strong> chỉ số trung tâm, đo 1–2 năm một lần.</li>
<li><strong>Độ pH và dung tích trao đổi cation:</strong> phản ánh khả năng giữ và cung cấp dinh dưỡng.</li>
<li><strong>Kết cấu và độ nén:</strong> quan sát mặt cắt đất, tốc độ thấm nước.</li>
<li><strong>Hoạt động sinh học:</strong> mật độ giun đất, tốc độ phân hủy tàn dư.</li>
<li><strong>Độ che phủ mặt đất</strong> theo mùa: tỷ lệ thời gian đất có cây hoặc tàn dư che phủ.</li>
</ul>
<p>Không cần phòng thí nghiệm phức tạp cho tất cả: một số chỉ số quan sát được ngay tại ruộng, miễn là làm nhất quán và ghi lại.</p>

<h2>Các chương trình chứng nhận tái tạo đang hình thành</h2>
<p>Trên thị trường quốc tế đã xuất hiện một số nhãn tư nhân cho nông nghiệp tái tạo, do các tổ chức phi chính phủ hoặc liên minh doanh nghiệp xây dựng. Chúng chưa có khung pháp lý nhà nước đứng sau như nhãn hữu cơ, tiêu chí và mức độ nghiêm ngặt khác nhau, và một số chỉ áp dụng trong chuỗi cung ứng của một tập đoàn cụ thể. Nhà sản xuất được đề nghị tham gia một chương trình như vậy nên hỏi rõ: ai kiểm chứng, chi phí ra sao, nhãn đó có giúp bán được giá tốt hơn hoặc mở thêm khách hàng không, và nó chồng lấn hay bổ sung cho chứng nhận hữu cơ đang có.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=200315" rel="noopener nofollow" target="_blank">Quyết định 885/QĐ-TTg — Đề án phát triển nông nghiệp hữu cơ giai đoạn 2020–2030</a> (gắn với nông nghiệp tuần hoàn).</li>
<li><a href="https://www.fibl.org/en" rel="noopener nofollow" target="_blank">FiBL — nghiên cứu so sánh hữu cơ và các hệ canh tác cải tạo đất</a>.</li>
<li><a href="https://mae.gov.vn/" rel="noopener nofollow" target="_blank">Bộ Nông nghiệp và Môi trường</a> — chính sách nông nghiệp bền vững, giảm phát thải.</li>
</ul>
`,
  },

  "co-hoi-cho-nong-san-nhiet-doi-huu-co-cua-viet-nam-tren-thi-truong-the-gioi": {
    excerpt:
      "Khí hậu và cơ cấu cây trồng tạo cho Việt Nam lợi thế trong phân khúc nông sản nhiệt đới hữu cơ. Bài viết phân tích cơ hội, đối chiếu với mục tiêu cây trồng của Đề án 885, và các điều kiện để biến lợi thế thành đơn hàng.",
    content: `
<p>Nhiều loại cây trồng nhiệt đới có giá trị trên thị trường hữu cơ quốc tế chỉ sản xuất được ở một số vùng khí hậu nhất định — cà phê, hồ tiêu, điều, dừa, quế, hồi, trái cây nhiệt đới. Việt Nam nằm trong nhóm quốc gia có điều kiện tự nhiên phù hợp với nhiều loại trong số đó, và đã là nước xuất khẩu hàng đầu thế giới về cà phê, hồ tiêu và điều ở dạng thông thường. Đây là một lợi thế xuất phát điểm rõ ràng cho phân khúc hữu cơ.</p>

<h2>Việt Nam đang ở đâu</h2>
<p>Theo tổng hợp từ báo cáo của FiBL–IFOAM và số liệu trong nước, diện tích sản xuất nông nghiệp hữu cơ của Việt Nam đến cuối năm 2024 vào khoảng 125 nghìn ha, đưa Việt Nam vào nhóm 5 nước có diện tích hữu cơ lớn nhất châu Á, dù tỷ lệ trên tổng diện tích đất nông nghiệp mới quanh mức 1%. Sản phẩm hữu cơ của Việt Nam đã xuất hiện ở nhiều thị trường khó tính như Hoa Kỳ, EU, Nhật Bản, Hàn Quốc. Còn nhiều dư địa để mở rộng.</p>

<h2>Mục tiêu cây trồng theo Đề án 885</h2>
<p>Quyết định 885/QĐ-TTg đặt mục tiêu định lượng cho nhóm cây trồng nhiệt đới chủ lực. Đối chiếu hai mốc:</p>
<table>
<tr><th>Cây trồng</th><th>Mục tiêu diện tích hữu cơ đến 2025</th><th>Đến 2030</th></tr>
<tr><td>Lúa</td><td>50.000 – 70.000 ha</td><td>100.000 – 150.000 ha</td></tr>
<tr><td>Rau đậu các loại</td><td>khoảng 10.000 ha</td><td>trên 20.000 ha</td></tr>
<tr><td>Cây ăn quả</td><td>10.000 – 12.000 ha</td><td>20.000 – 25.000 ha</td></tr>
<tr><td>Cà phê</td><td>6.000 – 8.000 ha</td><td>12.000 – 15.000 ha</td></tr>
<tr><td>Hồ tiêu</td><td>1.500 – 2.000 ha</td><td>3.000 – 4.000 ha</td></tr>
<tr><td>Chè</td><td>1.500 – 2.000 ha</td><td>3.000 – 5.000 ha</td></tr>
<tr><td>Điều</td><td>1.000 – 1.500 ha</td><td>2.000 – 3.000 ha</td></tr>
</table>
<p>Đề án cũng đặt mục tiêu giá trị sản phẩm trên một hecta đất trồng trọt và nuôi trồng thủy sản hữu cơ cao gấp 1,3–1,5 lần so với phi hữu cơ vào năm 2025, và 1,5–1,8 lần vào năm 2030 — tức là kỳ vọng chênh lệch giá trị, chứ không phải giá bán, là động lực kinh tế chính.</p>

<h2>Những yếu tố thuận lợi</h2>
<ul>
<li>Đa dạng tiểu vùng khí hậu, từ miền núi phía Bắc, Tây Nguyên đến Đồng bằng sông Cửu Long, cho phép sản xuất nhiều loại cây khác nhau.</li>
<li>Truyền thống canh tác lâu đời và lực lượng lao động nông nghiệp có kinh nghiệm.</li>
<li>Một số vùng vốn đã canh tác ở mức đầu vào thấp, thuận lợi cho chuyển đổi.</li>
<li>Hạ tầng cảng biển và tuyến vận tải kết nối trực tiếp với các thị trường lớn.</li>
<li>Chính sách hỗ trợ theo Nghị định 109/2018/NĐ-CP và Đề án 885: hỗ trợ chi phí xác định vùng đủ điều kiện, chi phí chứng nhận, giống, đào tạo, xúc tiến thương mại.</li>
</ul>

<h2>Những điều kiện cần đáp ứng</h2>
<p>Cơ hội không tự chuyển thành đơn hàng. Người mua ở thị trường phát triển đòi hỏi ba điều đồng thời: chất lượng ổn định giữa các lô và các vụ; hồ sơ chứng nhận và truy xuất minh bạch, phù hợp tiêu chuẩn của thị trường đích; và năng lực cung ứng đủ lớn, đủ đều để họ xây dựng kế hoạch cả năm. Nhiều nhà cung ứng đáp ứng được một hoặc hai trong ba, nhưng cả ba mới tạo ra quan hệ thương mại bền vững.</p>

<h2>Vai trò của tổ chức chuỗi và cạnh tranh bằng độ tin cậy</h2>
<p>Với phần lớn nông sản nhiệt đới, sản xuất nằm ở các hộ quy mô nhỏ. Tập hợp họ thành nhóm có hệ thống kiểm soát nội bộ, chuẩn hóa kỹ thuật và gộp sản lượng là bước then chốt để đạt quy mô và độ ổn định thị trường yêu cầu. Nhiều quốc gia khác cũng có lợi thế khí hậu tương tự Việt Nam; yếu tố tạo khác biệt dài hạn thường không phải giá thấp nhất, mà là độ tin cậy: giao đúng chất lượng, đúng khối lượng, đúng hạn, với hồ sơ đầy đủ, qua nhiều năm liên tục.</p>

<h2>Lưu ý theo từng nhóm cây</h2>
<ul>
<li><strong>Cà phê:</strong> chuyển đổi vườn cà phê đã thâm canh cần nhiều năm và dễ giảm năng suất sâu ở giai đoạn đầu; nên bắt đầu ở các vườn vốn canh tác ít đầu vào, vùng cao, có bóng che. Thị trường cà phê hữu cơ thường gắn thêm yêu cầu về chất lượng thử nếm và về không phá rừng.</li>
<li><strong>Hồ tiêu:</strong> áp lực bệnh chết nhanh, chết chậm lớn; hệ thống hữu cơ phải dựa vào giống, thoát nước, trụ sống và vi sinh vật đối kháng thay cho thuốc.</li>
<li><strong>Điều:</strong> phần lớn diện tích đã canh tác ở mức đầu vào thấp, thuận lợi cho chuyển đổi; điểm cần kiểm soát là khâu sơ chế, bảo quản để tránh nhiễm nấm mốc và độc tố.</li>
<li><strong>Dừa, quế, hồi:</strong> cây lâu năm, ít phải can thiệp, phù hợp mô hình nhóm hộ; người mua công nghiệp (thực phẩm, mỹ phẩm) thường muốn hợp đồng dài hạn và hồ sơ bền vững đầy đủ.</li>
<li><strong>Rau và trái cây tươi:</strong> giá trị cao nhưng đòi hỏi chuỗi lạnh và lịch giao đều; rủi ro dịch hại lớn nên cần vùng sản xuất tập trung.</li>
</ul>

<h2>Bài học từ các nước cạnh tranh</h2>
<p>Kinh nghiệm từ các nước xuất khẩu nông sản hữu cơ nhiệt đới cho thấy vài điểm lặp lại: (1) thành công thường đến từ một vài ngành hàng được đầu tư bài bản và một vài vùng chuyên canh, không phải từ việc dàn trải; (2) doanh nghiệp đầu mối đóng vai trò tổ chức chuỗi, gánh chi phí chứng nhận nhóm và tìm thị trường, còn nông hộ tập trung vào sản xuất; (3) mất thị trường thường do sự cố chất lượng hoặc gian lận của một vài mắt xích làm hỏng uy tín cả nguồn gốc quốc gia. Vì vậy, kiểm soát nội bộ chặt và xử lý nghiêm vi phạm là điều kiện sống còn, không phải thủ tục.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=200315" rel="noopener nofollow" target="_blank">Quyết định 885/QĐ-TTg — Đề án phát triển nông nghiệp hữu cơ giai đoạn 2020–2030</a> (mục tiêu cụ thể theo cây trồng).</li>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=194623" rel="noopener nofollow" target="_blank">Nghị định 109/2018/NĐ-CP về Nông nghiệp hữu cơ</a> (chính sách hỗ trợ).</li>
<li><a href="https://www.fibl.org/en/info-centre/news/organic-market-back-on-track" rel="noopener nofollow" target="_blank">FiBL — The World of Organic Agriculture 2025</a> (số liệu diện tích và thị trường toàn cầu).</li>
<li><a href="https://mae.gov.vn/" rel="noopener nofollow" target="_blank">Bộ Nông nghiệp và Môi trường</a>.</li>
</ul>
`,
  },

  "chi-phi-va-dinh-gia-trong-san-xuat-huu-co-hieu-dung-de-khong-lo": {
    excerpt:
      "Giá bán hữu cơ cao hơn không tự động đồng nghĩa với lợi nhuận cao hơn. Bài viết phân tích cấu trúc chi phí đặc thù, cách tính giá thành từ gốc, và vì sao mục tiêu giá trị/ha trong Đề án 885 lại quan trọng.",
    content: `
<p>Một kỳ vọng phổ biến khi chuyển sang hữu cơ là bán được giá cao hơn. Điều này thường đúng, nhưng chỉ nhìn vào giá bán mà bỏ qua thay đổi trong cấu trúc chi phí là cách nhanh nhất để thất vọng về kết quả tài chính. Đề án phát triển nông nghiệp hữu cơ (Quyết định 885/QĐ-TTg) đặt mục tiêu giá trị sản phẩm trên một hecta đất hữu cơ cao gấp 1,3–1,5 lần phi hữu cơ vào năm 2025 và 1,5–1,8 lần vào năm 2030 — chú ý đây là mục tiêu về giá trị trên đơn vị diện tích, tức là kết quả của cả giá bán lẫn năng suất và chi phí, không phải mức chênh giá đơn thuần.</p>

<h2>Chi phí tăng ở đâu</h2>
<ul>
<li><strong>Lao động:</strong> làm cỏ cơ giới và thủ công thay cho thuốc diệt cỏ, quản lý dịch hại bằng nhiều biện pháp phối hợp, giám sát đồng ruộng thường xuyên hơn. Đây thường là khoản tăng lớn nhất.</li>
<li><strong>Năng suất giai đoạn đầu:</strong> thường thấp hơn trong những năm chuyển đổi, khi đất chưa phục hồi mà sản phẩm chưa được bán giá hữu cơ; với một số cây trồng, năng suất vẫn thấp hơn ngay cả sau chuyển đổi.</li>
<li><strong>Chi phí chứng nhận:</strong> phí đăng ký, phí đánh giá và giám sát hằng năm, chi phí kiểm nghiệm mẫu, và chi phí thời gian cho hồ sơ.</li>
<li><strong>Rủi ro và hao hụt:</strong> một số vụ chịu thiệt hại lớn hơn do không dùng biện pháp can thiệp nhanh khi dịch bùng phát.</li>
</ul>

<h2>Chi phí giảm ở đâu</h2>
<p>Ngược lại, chi phí phân bón và thuốc mua ngoài thường giảm khi đất khỏe lên và hệ thống tự cân bằng tốt hơn. Nhiều trang trại hữu cơ lâu năm có chi phí đầu vào tiền mặt thấp hơn đáng kể so với trước khi chuyển đổi, dù chi phí lao động cao hơn. Việc tự sản xuất phân ủ, dùng cây phân xanh và luân canh cây họ đậu cũng thay thế một phần đầu vào mua ngoài. Đây là lý do cấu trúc chi phí hữu cơ dịch chuyển từ "tiền mặt mua vật tư" sang "công lao động và quản lý".</p>

<h2>Hỗ trợ từ chính sách</h2>
<p>Nghị định 109/2018/NĐ-CP quy định một số khoản hỗ trợ giúp giảm chi phí đầu vào giai đoạn chuyển đổi: ngân sách hỗ trợ 100% kinh phí xác định vùng, khu vực đủ điều kiện sản xuất hữu cơ; hỗ trợ một phần chi phí cấp giấy chứng nhận; hỗ trợ đào tạo, tập huấn và xây dựng mô hình. Mức và điều kiện cụ thể do từng địa phương ban hành, nên cần làm việc với Sở Nông nghiệp và Môi trường hoặc phòng nông nghiệp cấp huyện để biết chương trình đang áp dụng.</p>

<h2>Tiếp cận định giá</h2>
<p>Thay vì hỏi "giá hữu cơ là bao nhiêu", nên bắt đầu từ chi phí sản xuất thực tế của chính trang trại — tính đủ cả công lao động của gia đình và khấu hao — cộng biên lợi nhuận mục tiêu, rồi so sánh với mức giá thị trường đang trả. Nếu chi phí của mình cao hơn mức thị trường chấp nhận, giải pháp nằm ở cải thiện năng suất và hiệu quả (chọn giống phù hợp, tổ chức lao động tốt hơn, giảm hao hụt), không phải ở việc kỳ vọng người mua trả bù cho sự kém hiệu quả.</p>

<h2>So sánh hai cách bán</h2>
<table>
<tr><th></th><th>Bán giao ngay theo giá thị trường</th><th>Hợp đồng dài hạn với người mua</th></tr>
<tr><th>Giá</th><td>Có thể cao vào lúc khan hàng, thấp vào lúc rộ vụ</td><td>Thường ổn định, đôi khi thấp hơn đỉnh giao ngay</td></tr>
<tr><th>Rủi ro đầu ra</th><td>Cao — không chắc bán được hết</td><td>Thấp — biết trước sản lượng cần giao</td></tr>
<tr><th>Khả năng lập kế hoạch đầu tư</th><td>Kém</td><td>Tốt</td></tr>
</table>
<p>Với nhiều nhà sản xuất, giá trị lớn nhất của kênh hữu cơ không phải mức giá cao nhất tại một thời điểm, mà là các hợp đồng dài hạn với người mua có nhu cầu rõ ràng. Giá ổn định và đầu ra chắc chắn giúp lập kế hoạch đầu tư và vay vốn tốt hơn nhiều so với việc bán theo giá giao ngay biến động.</p>

<h2>Một ví dụ tính giá thành</h2>
<p>Giả sử một hộ trồng rau hữu cơ trên 1 ha, một vụ: chi phí tiền mặt (giống, phân ủ mua thêm, chế phẩm sinh học, bao bì, phí phân bổ chứng nhận) khoảng 40 triệu đồng; công lao động quy đổi (kể cả công gia đình) khoảng 60 triệu đồng; khấu hao dụng cụ, hệ thống tưới khoảng 10 triệu đồng. Tổng giá thành khoảng 110 triệu đồng/vụ. Nếu năng suất bán được là 14 tấn/ha sau hao hụt, giá thành xấp xỉ 7.900 đồng/kg. Muốn có biên lợi nhuận 25%, giá bán cần đạt khoảng 9.900 đồng/kg tại ruộng. Đây mới là con số để so với giá thị trường — nếu thị trường trả 15.000 đồng/kg thì có lãi tốt; nếu chỉ trả 8.500 đồng/kg thì phải cải thiện năng suất hoặc giảm chi phí, không nên kỳ vọng người mua bù.</p>

<h2>Ba sai lầm định giá thường gặp</h2>
<ul>
<li>Không tính công lao động của gia đình vào giá thành, dẫn tới tưởng có lãi trong khi thực chất đang lấy công làm lãi.</li>
<li>Lấy giá bán lẻ tại cửa hàng hữu cơ ở thành phố làm mốc kỳ vọng cho giá bán tại ruộng, quên phần chi phí phân phối, hao hụt và biên của khâu trung gian.</li>
<li>Định giá một lần rồi giữ nguyên nhiều vụ, không cập nhật khi chi phí đầu vào hoặc năng suất thay đổi.</li>
</ul>

<h2>Theo dõi vài chỉ số tài chính đơn giản</h2>
<p>Không cần kế toán phức tạp. Bốn con số nên theo dõi theo vụ và theo năm: giá thành trên một kg sản phẩm bán được; tỷ lệ chi phí tiền mặt trên doanh thu; năng suất thực tế so với dự kiến; và tỷ lệ sản lượng bán được theo hợp đồng so với bán giao ngay. Theo dõi bốn con số này qua vài vụ đủ để thấy trang trại đang cải thiện hay đi lùi về hiệu quả, và để thương lượng hợp đồng trên cơ sở dữ liệu thay vì cảm tính.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=200315" rel="noopener nofollow" target="_blank">Quyết định 885/QĐ-TTg — Đề án phát triển nông nghiệp hữu cơ giai đoạn 2020–2030</a> (mục tiêu giá trị/ha).</li>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=194623" rel="noopener nofollow" target="_blank">Nghị định 109/2018/NĐ-CP về Nông nghiệp hữu cơ</a> (Chương chính sách khuyến khích phát triển).</li>
<li><a href="https://mae.gov.vn/" rel="noopener nofollow" target="_blank">Bộ Nông nghiệp và Môi trường</a> — chương trình hỗ trợ và mô hình khuyến nông.</li>
</ul>
`,
  },

  "minh-bach-chuoi-cung-ung-nhan-sinh-thai-dau-chan-carbon-va-ky-vong-moi-cua": {
    excerpt:
      "Người mua ở nhiều thị trường ngày càng yêu cầu thông tin vượt ra ngoài chứng nhận hữu cơ: dấu chân carbon, điều kiện lao động, bao bì. Bài viết điểm qua các yêu cầu mới, gắn với quy định EU về chống phá rừng và cơ chế điều chỉnh carbon biên giới.",
    content: `
<p>Chứng nhận hữu cơ trả lời câu hỏi "sản phẩm được trồng như thế nào". Nhưng người mua ở nhiều thị trường phát triển đang mở rộng danh sách câu hỏi: điều kiện lao động ra sao, phát thải trong sản xuất và vận chuyển thế nào, đất có nguồn gốc từ phá rừng không, bao bì có tái chế được không, nước được sử dụng ra sao. Một phần trong số này đang chuyển từ "yêu cầu của người mua" thành "quy định bắt buộc của thị trường".</p>

<h2>Các loại thông tin thường được hỏi</h2>
<ul>
<li><strong>Dấu chân carbon:</strong> ước tính phát thải khí nhà kính gắn với một đơn vị sản phẩm, từ canh tác đến khi giao hàng.</li>
<li><strong>Chống mất rừng:</strong> bằng chứng đất sản xuất không có nguồn gốc từ rừng bị chặt phá sau một mốc thời gian nhất định, kèm tọa độ định vị của vùng trồng.</li>
<li><strong>Sử dụng nước:</strong> lượng nước cho sản xuất, đặc biệt ở vùng khan hiếm nước.</li>
<li><strong>Đa dạng sinh học:</strong> diện tích môi trường sống tự nhiên được giữ lại, thực hành hỗ trợ loài thụ phấn.</li>
<li><strong>Điều kiện lao động:</strong> an toàn lao động, thù lao, không lao động cưỡng bức, không lao động trẻ em.</li>
<li><strong>Bao bì:</strong> khối lượng vật liệu, khả năng tái chế, tỷ lệ vật liệu tái chế.</li>
</ul>

<h2>Từ yêu cầu tự nguyện đến quy định bắt buộc</h2>
<p>Xu hướng rõ nhất đến từ Liên minh châu Âu. Quy định của EU về sản phẩm không gây mất rừng (EUDR) yêu cầu nhiều mặt hàng — trong đó có cà phê, ca cao, cao su, dầu cọ, gỗ, đậu tương, gia súc — khi nhập khẩu vào EU phải chứng minh không liên quan đến phá rừng và có dữ liệu định vị vùng sản xuất. Cơ chế điều chỉnh carbon tại biên giới (CBAM) hiện áp dụng cho một số ngành công nghiệp nhưng cho thấy hướng đi: hàng hóa có cường độ phát thải cao sẽ chịu chi phí tại cửa khẩu EU. Nông sản Việt Nam bán vào EU cần theo dõi sát các quy định này vì thời điểm áp dụng và phạm vi có thể thay đổi.</p>

<h2>Cơ hội và rủi ro với nhà sản xuất hữu cơ</h2>
<p>Với nhà sản xuất hữu cơ, phần lớn thực hành canh tác đã tạo ra kết quả tốt trên các chỉ số này: ít đầu vào tổng hợp nghĩa là phát thải từ phân bón thấp hơn; giữ hàng rào cây và đa dạng cây trồng tốt cho đa dạng sinh học và lưu giữ carbon. Thách thức là <strong>đo lường và trình bày</strong> chúng một cách nhất quán, có thể kiểm chứng. Ngược lại, đưa ra tuyên bố bền vững mà không có dữ liệu hỗ trợ là rủi ro lớn — dễ bị đặt câu hỏi, và ở một số thị trường có thể bị xử lý như quảng cáo sai.</p>

<h2>Bắt đầu từ dữ liệu sẵn có</h2>
<p>Nhiều thông tin cần thiết đã nằm trong hồ sơ canh tác: vật tư đầu vào, nhiên liệu tiêu thụ, khối lượng và quãng đường vận chuyển, diện tích và cơ cấu sử dụng đất, tọa độ các thửa. Việc tổ chức lại các dữ liệu này thành một hồ sơ bền vững cơ bản thường không đòi hỏi hệ thống mới, mà đòi hỏi kỷ luật ghi chép và một khung trình bày rõ ràng. Với truy xuất nguồn gốc, có thể kết nối dữ liệu lô hàng lên Cổng thông tin truy xuất nguồn gốc sản phẩm, hàng hóa quốc gia để phục vụ cả quản lý trong nước lẫn yêu cầu của đối tác nước ngoài.</p>

<h2>Trao đổi sớm với người mua</h2>
<p>Thay vì chờ được yêu cầu, nhà cung ứng nên chủ động hỏi người mua họ quan tâm đến chỉ số nào nhất và theo chuẩn báo cáo nào. Điều này giúp tập trung nguồn lực vào đúng thứ quan trọng với quan hệ thương mại, thay vì cố đo lường mọi thứ cùng lúc. Với các quy định bắt buộc như EUDR, nên chuẩn bị sớm vì việc thu thập tọa độ và xây dựng chuỗi bằng chứng cho hàng nghìn nông hộ nhỏ mất nhiều thời gian.</p>

<h2>EUDR: chuẩn bị cụ thể những gì</h2>
<ul>
<li>Thu thập tọa độ định vị (polygon hoặc điểm, tùy diện tích) của từng thửa sản xuất, gắn với danh sách nông hộ.</li>
<li>Chuẩn bị bằng chứng hiện trạng sử dụng đất không phải rừng bị chuyển đổi sau mốc thời gian quy định (thường dựa trên ảnh vệ tinh và hồ sơ đất).</li>
<li>Xây dựng liên kết dữ liệu từ lô hàng xuất về tới nhóm thửa: mã lô — cơ sở sơ chế — nhóm hộ — tọa độ.</li>
<li>Lưu hồ sơ để đối tác nhập khẩu lập tuyên bố trách nhiệm giải trình (due diligence) theo yêu cầu của họ.</li>
</ul>
<p>Với ngành cà phê, điều, cao su — các mặt hàng trong phạm vi EUDR — đây là công việc phải làm ở cấp vùng, thường do doanh nghiệp đầu mối hoặc hiệp hội ngành hàng điều phối, với hỗ trợ kỹ thuật từ cơ quan quản lý.</p>

<h2>Tính dấu chân carbon: cách bắt đầu đơn giản</h2>
<p>Không cần mô hình phức tạp ngay từ đầu. Một ước tính sơ bộ cho một đơn vị sản phẩm có thể dựa trên: lượng và loại phân bón, vôi; nhiên liệu cho máy móc và bơm tưới; điện tiêu thụ; quãng đường và phương thức vận chuyển tới cảng; và thay đổi carbon trong đất nếu có số liệu. Nhà sản xuất hữu cơ thường có lợi thế ở khoản phân bón tổng hợp gần bằng không. Quan trọng là dùng một phương pháp nhất quán qua các năm để thấy xu hướng, và ghi rõ giả định để người mua kiểm chứng được.</p>

<h2>Báo cáo của người mua kéo theo yêu cầu với nhà cung ứng</h2>
<p>Nhiều tập đoàn nhập khẩu ở EU nay phải báo cáo phát triển bền vững theo quy định của khối (chỉ thị CSRD và các chuẩn kèm theo), bao gồm cả phát thải và rủi ro trong chuỗi cung ứng. Hệ quả là họ chuyển một phần yêu cầu dữ liệu xuống nhà cung ứng: bảng kê phát thải, chính sách lao động, bằng chứng không phá rừng. Nhà cung ứng nào chuẩn bị sẵn bộ hồ sơ này sẽ dễ giữ và mở rộng đơn hàng hơn.</p>

<h2>Tham khảo</h2>
<ul>
<li><a href="https://truyxuatnguongoc.gov.vn/" rel="noopener nofollow" target="_blank">Cổng thông tin truy xuất nguồn gốc sản phẩm, hàng hóa quốc gia</a>.</li>
<li><a href="https://mae.gov.vn/" rel="noopener nofollow" target="_blank">Bộ Nông nghiệp và Môi trường</a> — hướng dẫn thích ứng quy định EUDR và phát triển bền vững ngành hàng.</li>
<li><a href="https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en" rel="noopener nofollow" target="_blank">EU Regulation on deforestation-free products (EUDR)</a>.</li>
<li><a href="https://vanban.chinhphu.vn/?pageid=27160&docid=194623" rel="noopener nofollow" target="_blank">Nghị định 109/2018/NĐ-CP về Nông nghiệp hữu cơ</a>.</li>
</ul>
`,
  },
};

function main() {
  const wp = JSON.parse(fs.readFileSync(WP_PATH, "utf8"));
  const stripLen = (html) =>
    html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").length;

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
    console.log(`\nDRY_RUN=1 — không ghi. ${n}/12 bài sẵn sàng.`);
    return;
  }
  fs.writeFileSync(WP_PATH, JSON.stringify(wp, null, 2) + "\n", "utf8");
  console.log(`\nĐã cập nhật ${n}/12 bài trong wp-content.json.`);
}

main();
