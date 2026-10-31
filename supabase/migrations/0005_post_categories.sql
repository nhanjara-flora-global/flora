-- Chuyên mục bài Kiến thức sửa trong /admin/post-categories (chạy sau 0004).
-- Supabase Studio → SQL Editor → dán và chạy. Chạy lại nhiều lần vô hại.
-- Chưa chạy thì web vẫn dùng 5 chuyên mục mặc định trong code (src/lib/news-categories.ts).

create table if not exists public.post_categories (
  slug text primary key,
  -- { "vi": "Canh tác hữu cơ", "en": "Organic Farming" }
  names jsonb not null default '{}'::jsonb,
  -- Đoạn giới thiệu dưới tiêu đề trang chuyên mục + mô tả SEO, theo ngôn ngữ.
  descriptions jsonb not null default '{}'::jsonb,
  -- Slug sản phẩm gợi ý trong hộp "Sản phẩm liên quan" của bài thuộc chuyên mục.
  related_product text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.post_categories enable row level security;

-- Web đọc công khai; admin ghi bằng service role (bỏ qua RLS).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'post_categories'
      and policyname = 'Public read post_categories'
  ) then
    create policy "Public read post_categories"
      on public.post_categories for select using (true);
  end if;
end $$;

-- 5 chuyên mục đang có (giữ nguyên nếu admin đã sửa).
insert into public.post_categories (slug, names, related_product, sort_order) values
  ('canh-tac-huu-co', '{"vi": "Canh tác hữu cơ", "en": "Organic Farming"}', 'phan-ga-huu-co-nhat-ban', 10),
  ('chung-nhan-tieu-chuan', '{"vi": "Chứng nhận & Tiêu chuẩn", "en": "Certification & Standards"}', 'phan-ga-huu-co-nhat-ban', 20),
  ('xuat-khau-logistics', '{"vi": "Xuất khẩu & Logistics", "en": "Export & Logistics"}', 'bot-hat-sen-100-nguyen-chat', 30),
  ('thi-truong-xu-huong', '{"vi": "Thị trường & Xu hướng", "en": "Market & Trends"}', 'bot-hat-sen-100-nguyen-chat', 40),
  ('goc-nhin-flora', '{"vi": "Góc nhìn Flora", "en": "Flora Perspective"}', 'phan-ga-huu-co-nhat-ban', 50)
on conflict (slug) do nothing;
