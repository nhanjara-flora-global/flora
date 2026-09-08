-- Backfill mô tả chi tiết cho 4 sản phẩm seed — seed.sql cũ chỉ chèn
-- short_description nên description bị NULL, trang chi tiết không hiện gì.
-- Chạy trên Supabase SQL Editor. Idempotent (chỉ ghi khi đang trống).

update public.products set description =
  'Phân gà hữu cơ nhập khẩu từ Nhật Bản, đã lên men và xử lý nhiệt để đảm bảo độ an toàn và dinh dưỡng cao cho đất.'
where slug = 'phan-ga-huu-co-nhat-ban' and (description is null or description = '');

update public.products set description =
  'Phân bón hỗn hợp PK hữu cơ từ tro phân gà nung — giải pháp bền vững cho nông nghiệp hữu cơ.'
where slug = 'phan-bon-huu-co-tu-tro-phan-ga-nung' and (description is null or description = '');

update public.products set description =
  'Bột protein từ cá — nguyên liệu hữu cơ chất lượng cao cho dinh dưỡng và sản xuất.'
where slug = 'bot-protein-tu-ca' and (description is null or description = '');

update public.products set description =
  'Bột hạt sen 100% nguyên chất. Liên hệ để được tư vấn và báo giá.'
where slug = 'bot-hat-sen-100-nguyen-chat' and (description is null or description = '');
