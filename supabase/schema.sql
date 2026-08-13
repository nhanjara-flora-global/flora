-- Flora Global — Supabase schema (Postgres)
-- Run in Supabase SQL Editor

create extension if not exists "pgcrypto";

-- Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  parent_id uuid references public.categories(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  short_description text,
  price numeric(12,2), -- null = "Liên hệ"
  compare_at_price numeric(12,2),
  currency text not null default 'VND',
  sku text,
  stock_status text not null default 'instock' check (stock_status in ('instock', 'outofstock', 'onbackorder')),
  stock_qty int,
  image_url text,
  gallery jsonb not null default '[]'::jsonb,
  attributes jsonb not null default '{}'::jsonb, -- cong_dung, dac_diem, ...
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled', 'refunded')),
  payment_method text not null default 'cod'
    check (payment_method in ('cod', 'bank_transfer', 'vnpay', 'momo', 'stripe')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'failed', 'refunded')),
  currency text not null default 'VND',
  subtotal numeric(12,2) not null default 0,
  shipping_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null default '{}'::jsonb,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_slug text,
  unit_price numeric(12,2),
  quantity int not null check (quantity > 0),
  line_total numeric(12,2),
  created_at timestamptz not null default now()
);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text,
  source text default 'contact',
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_categories enable row level security;
alter table public.posts enable row level security;
alter table public.pages enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.contact_submissions enable row level security;

-- Public read published content
create policy "Public read published products"
  on public.products for select using (status = 'published');

create policy "Public read categories"
  on public.categories for select using (true);

create policy "Public read product_categories"
  on public.product_categories for select using (true);

create policy "Public read published posts"
  on public.posts for select using (status = 'published');

create policy "Public read published pages"
  on public.pages for select using (true);

-- Profiles: own row
create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Orders: own orders
create policy "Users read own orders"
  on public.orders for select using (auth.uid() = user_id);

create policy "Users read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- Contact: insert only via service role / server (no public select)
-- Allow anon insert for contact form (optional; prefer server action + service role)
create policy "Anyone can submit contact"
  on public.contact_submissions for insert
  with check (true);

-- Indexes
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_posts_slug on public.posts(slug);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_number on public.orders(order_number);
