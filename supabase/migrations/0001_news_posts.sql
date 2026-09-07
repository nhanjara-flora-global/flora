-- News posts: thêm cột cho phân loại + đa ngôn ngữ (chạy sau schema.sql).
-- Supabase Studio → SQL Editor → dán và chạy.

alter table public.posts
  add column if not exists category text,
  add column if not exists source_locale text not null default 'vi',
  add column if not exists translations jsonb not null default '{}'::jsonb;

-- published_at đóng vai trò "ngày đăng" hiển thị; mặc định = thời điểm tạo.
alter table public.posts
  alter column published_at set default now();

create index if not exists posts_status_published_at_idx
  on public.posts (status, published_at desc);

create index if not exists posts_category_idx
  on public.posts (category);

-- Cho phép đọc công khai bài đã publish (đã có trong schema.sql; tạo lại nếu thiếu).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'posts'
      and policyname = 'Public read published posts'
  ) then
    create policy "Public read published posts"
      on public.posts for select using (status = 'published');
  end if;
end $$;
