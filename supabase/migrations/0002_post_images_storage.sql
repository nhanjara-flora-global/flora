-- Storage cho ảnh bài viết (chèn trong nội dung + ảnh bìa).
-- Supabase Studio → SQL Editor → dán và chạy. Chạy sau 0001_news_posts.sql.

-- Bucket công khai: URL getPublicUrl xem được không cần đăng nhập.
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do update set public = true;

-- Đọc công khai. (Bucket public đã đủ; policy này để chắc chắn khi RLS bật.)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Public read post-images'
  ) then
    create policy "Public read post-images"
      on storage.objects for select
      using (bucket_id = 'post-images');
  end if;
end $$;

-- Không cần policy insert/update/delete: admin tải lên qua service role (bỏ qua RLS).
