-- Seed from WordPress dump (flora-global.vn) — May 2026 snapshot
-- Prices from wpdg_wc_product_meta_lookup; titles/slugs from Yoast indexables

insert into public.categories (id, name, slug, description, sort_order) values
  ('11111111-1111-1111-1111-111111111101', 'Sản phẩm hữu cơ', 'san-pham-huu-co', 'Nông sản và sản phẩm hữu cơ', 1),
  ('11111111-1111-1111-1111-111111111102', 'Nguyên liệu nhập khẩu hữu cơ', 'nguyen-lieu-nhap-khau-huu-co', 'Nguyên liệu hữu cơ nhập khẩu', 2)
on conflict (slug) do nothing;

insert into public.products (id, name, slug, short_description, price, currency, stock_status, status, seo_title, image_url) values
  (
    '22222222-2222-2222-2222-222222222201',
    'Phân gà hữu cơ Nhật Bản',
    'phan-ga-huu-co-nhat-ban',
    'Phân gà hữu cơ nhập khẩu từ Nhật Bản, đã lên men và xử lý nhiệt.',
    250000,
    'VND',
    'instock',
    'published',
    'Phân gà hữu cơ Nhật Bản | Flora Global',
    '/images/products/phan-ga.jpg'
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    'Phân bón hữu cơ từ tro phân gà nung',
    'phan-bon-huu-co-tu-tro-phan-ga-nung',
    'Phân bón hỗn hợp PK hữu cơ từ tro phân gà nung.',
    125000,
    'VND',
    'instock',
    'published',
    'Phân bón hữu cơ từ tro phân gà nung | Flora Global',
    '/images/products/phan-bon.jpg'
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    'Bột Protein từ cá',
    'bot-protein-tu-ca',
    'Bột protein từ cá — nguyên liệu hữu cơ chất lượng cao.',
    125000,
    'VND',
    'instock',
    'published',
    'Bột Protein từ cá | Flora Global',
    '/images/products/bot-protein.jpg'
  ),
  (
    '22222222-2222-2222-2222-222222222204',
    'Bột hạt sen 100% nguyên chất',
    'bot-hat-sen-100-nguyen-chat',
    'Bột hạt sen nguyên chất — liên hệ để báo giá.',
    null,
    'VND',
    'instock',
    'published',
    'Bột hạt sen 100% nguyên chất | Flora Global',
    '/images/products/bot-hat-sen.jpg'
  )
on conflict (slug) do update set
  name = excluded.name,
  price = excluded.price,
  status = excluded.status,
  image_url = excluded.image_url;

insert into public.product_categories (product_id, category_id) values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111102'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111101'),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111101')
on conflict do nothing;

insert into public.pages (title, slug, content, status, seo_title) values
  ('Trang chủ', 'home', 'Flora Global — Precision Agriculture. Global Compliance. Integrated Excellence.', 'published', 'Flora Global Corporate'),
  ('Về chúng tôi', 'about-us', 'Công ty TNHH Flora Global — tư vấn chứng nhận hữu cơ và giải pháp vùng trồng hữu cơ.', 'published', 'About Us | Flora Global'),
  ('Liên hệ', 'contact', 'Liên hệ Flora Global', 'published', 'Contact | Flora Global'),
  ('Sản phẩm', 'products', 'Danh mục sản phẩm', 'published', 'Products | Flora Global')
on conflict (slug) do nothing;

insert into public.posts (id, title, slug, excerpt, content, status, published_at) values
  (
    '33333333-3333-3333-3333-333333333301',
    'CEO Lê Thị Thúy Hoa và khát vọng cùng nông dân hiện thực hóa nông nghiệp organic',
    'ceo-le-thi-thuy-hoa-va-khat-vong-cung-nong-dan-hien-thuc-hoa-nong-nghiep-organic',
    'Hành trình của Flora Global đồng hành cùng nông dân Việt Nam xây dựng chuỗi giá trị nông nghiệp hữu cơ.',
    'Công ty TNHH Flora Global tư vấn chứng nhận hữu cơ, giải pháp vùng trồng và sản phẩm nông nghiệp hữu cơ.',
    'published',
    '2025-09-04T00:00:00Z'
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    'Nông sản hữu cơ chiếm ưu thế vượt trội',
    'nong-san-huu-co-chiem-uu-the-vuot-troi',
    'Người tiêu dùng ưu tiên thành phần tự nhiên — nhu cầu nông sản hữu cơ tăng trưởng bền vững.',
    'Thị trường nông sản hữu cơ đang tăng trưởng bất chấp thách thức kinh tế.',
    'published',
    '2025-08-20T00:00:00Z'
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    'Việt Nam đẩy mạnh phát triển nông nghiệp hữu cơ',
    'viet-nam-day-manh-phat-trien-nong-nghiep-huu-co',
    'Chính sách và thực tiễn thúc đẩy chuyển đổi sang mô hình nông nghiệp hữu cơ tại Việt Nam.',
    'Việt Nam đang đẩy mạnh nông nghiệp hữu cơ thông qua chứng nhận và liên kết chuỗi giá trị.',
    'published',
    '2025-08-10T00:00:00Z'
  ),
  (
    '33333333-3333-3333-3333-333333333304',
    'Diện tích nông nghiệp hữu cơ toàn cầu đạt gần 99 triệu ha',
    'dien-tich-nong-nghiep-huu-co-toan-cau-dat-gan-99-trieu-ha',
    'Báo cáo FiBL phản ánh xu hướng phát triển tích cực của thị trường hữu cơ toàn cầu.',
    'Theo báo cáo FiBL, diện tích canh tác hữu cơ tiếp tục mở rộng trên toàn cầu.',
    'published',
    '2025-09-08T00:00:00Z'
  )
on conflict (slug) do nothing;
