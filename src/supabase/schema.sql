-- ============================================================
--  NOBIL LABORATORIES — BLOG SCHEMA
--  Run this in your Supabase SQL Editor
-- ============================================================

-- ── 1. ENUM for post status ──────────────────────────────────
create type post_status as enum ('draft', 'published', 'archived');

-- ── 2. AUTHORS table ─────────────────────────────────────────
create table public.authors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text,
  avatar_url  text,
  bio         text,
  created_at  timestamptz default now()
);

-- ── 3. CATEGORIES table ──────────────────────────────────────
create table public.categories (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique,
  slug  text not null unique,
  color text default '#5BA3C4'
);

-- ── 4. POSTS table ───────────────────────────────────────────
create table public.posts (
  id            uuid primary key default gen_random_uuid(),

  -- Content
  title         text        not null,
  slug          text        not null unique,
  excerpt       text,
  content       text        not null,          -- HTML or Markdown
  cover_url     text,

  -- Meta
  status        post_status not null default 'draft',
  featured      boolean     not null default false,
  read_time     int         default 5,          -- minutes

  -- Relations
  author_id     uuid references public.authors(id) on delete set null,
  category_id   uuid references public.categories(id) on delete set null,

  -- SEO
  meta_title       text,
  meta_description text,

  -- Timestamps
  published_at  timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── 5. TAGS (many-to-many) ───────────────────────────────────
create table public.tags (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique,
  slug  text not null unique
);

create table public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id  uuid references public.tags(id)  on delete cascade,
  primary key (post_id, tag_id)
);

-- ── 6. AUTO-UPDATE updated_at ────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_updated_at
  before update on public.posts
  for each row execute procedure update_updated_at();

-- ── 7. INDEXES for performance ───────────────────────────────
create index idx_posts_slug        on public.posts(slug);
create index idx_posts_status      on public.posts(status);
create index idx_posts_published   on public.posts(published_at desc);
create index idx_posts_featured    on public.posts(featured) where featured = true;
create index idx_posts_author      on public.posts(author_id);
create index idx_posts_category    on public.posts(category_id);

-- ============================================================
--  ROW LEVEL SECURITY (RLS)
--  CRITICAL — enables security at the database level
-- ============================================================

-- Enable RLS on all tables
alter table public.posts      enable row level security;
alter table public.authors    enable row level security;
alter table public.categories enable row level security;
alter table public.tags       enable row level security;
alter table public.post_tags  enable row level security;

-- ── PUBLIC can only read PUBLISHED posts ─────────────────────
create policy "Public can read published posts"
  on public.posts for select
  using (status = 'published');

-- ── PUBLIC can read authors, categories, tags ─────────────────
create policy "Public can read authors"
  on public.authors for select using (true);

create policy "Public can read categories"
  on public.categories for select using (true);

create policy "Public can read tags"
  on public.tags for select using (true);

create policy "Public can read post_tags"
  on public.post_tags for select using (true);

-- ── SERVICE ROLE (your admin backend) can do everything ──────
--  (Supabase service_role key bypasses RLS by default — use it
--   only on the server side NEVER in the browser)

-- ============================================================
--  SAMPLE SEED DATA
-- ============================================================
insert into public.authors (name, role, bio) values
  ('Dr. Aryan Shah',    'Chief Research Officer', 'Leading innovation in distributed systems and applied ML.'),
  ('Priya Mehta',       'Product Lead',           'Building products that bridge research and real-world impact.'),
  ('Nobil Laboratories','Editorial Team',         'Official communications from the Nobil Laboratories team.');

insert into public.categories (name, slug, color) values
  ('Engineering',   'engineering',   '#2C4A5C'),
  ('Research',      'research',      '#5BA3C4'),
  ('Product',       'product',       '#16A34A'),
  ('Company',       'company',       '#7C3AED'),
  ('Security',      'security',      '#DC2626');

insert into public.tags (name, slug) values
  ('AI',              'ai'),
  ('Infrastructure',  'infrastructure'),
  ('Open Source',     'open-source'),
  ('Case Study',      'case-study'),
  ('Announcement',    'announcement');