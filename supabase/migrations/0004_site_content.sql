-- Banner, quảng cáo và SEO đặt tay sửa trong /admin (chạy sau 0003).
-- Supabase Studio → SQL Editor → dán và chạy. Chỉ tạo bảng mới, không đụng dữ liệu cũ.
-- Chưa chạy thì web vẫn hiện nội dung mặc định trong code.

-- Mỗi ô banner / quảng cáo (khoá trong src/lib/site-slots.ts) một dòng, chỉ ghi
-- những gì admin đổi; ô trống = dùng mặc định.
create table if not exists public.site_slots (
  key text primary key,
  active boolean not null default true,
  href text,
  image_url text,
  -- { "vi": { "eyebrow", "title", "body", "cta" }, "en": { ... } }
  content jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  updated_at timestamptz not null default now()
);

-- SEO đặt tay theo đường dẫn có ngôn ngữ, không tham số: "/vi/knowledge", "/en/products/x".
create table if not exists public.seo_overrides (
  path text primary key,
  title text,
  description text,
  image_url text,
  noindex boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.site_slots enable row level security;
alter table public.seo_overrides enable row level security;

-- Web đọc công khai; admin ghi bằng service role (bỏ qua RLS).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'site_slots'
      and policyname = 'Public read site_slots'
  ) then
    create policy "Public read site_slots"
      on public.site_slots for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'seo_overrides'
      and policyname = 'Public read seo_overrides'
  ) then
    create policy "Public read seo_overrides"
      on public.seo_overrides for select using (true);
  end if;
end $$;
