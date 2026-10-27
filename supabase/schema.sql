-- ============================================================================
-- maybee · Supabase schema (Fase 1 + Fase 5)
-- Jalankan sekali di Supabase Dashboard → SQL Editor (project oalqwgtvietxvoqsvsif).
-- Aman dijalankan ulang: semua pakai "if not exists" / "drop policy if exists".
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROFILES — cermin ringan dari auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: baca sendiri" on public.profiles;
create policy "profiles: baca sendiri"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles: ubah sendiri" on public.profiles;
create policy "profiles: ubah sendiri"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Bikin profil otomatis tiap ada user baru (Google OAuth / magic link).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. FRAMES — master katalog (opsional; app baca src/data/frames.json)
--    Tabel ini buat administrasi bingkai Canva Pro di Fase 6.
-- ---------------------------------------------------------------------------
create table if not exists public.frames (
  id text primary key,
  title text not null,
  category text not null default 'strip',
  overlay_url text not null,
  canvas_width integer not null,
  canvas_height integer not null,
  slots_data jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.frames enable row level security;

drop policy if exists "frames: katalog publik" on public.frames;
create policy "frames: katalog publik"
  on public.frames for select
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- 3. PHOTO_STRIPS — galeri cloud (versi WebP ~200 KB)
-- ---------------------------------------------------------------------------
create table if not exists public.photo_strips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  -- sengaja tanpa FK ke frames: bingkai Canva Pro (Fase 6) boleh masuk lewat
  -- src/data/frames.json tanpa wajib seed ulang tabel master.
  frame_id text,
  image_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index if not exists photo_strips_user_created_idx
  on public.photo_strips (user_id, created_at desc);

alter table public.photo_strips enable row level security;

drop policy if exists "strips: baca milik sendiri" on public.photo_strips;
create policy "strips: baca milik sendiri"
  on public.photo_strips for select
  using (auth.uid() = user_id);

drop policy if exists "strips: simpan milik sendiri" on public.photo_strips;
create policy "strips: simpan milik sendiri"
  on public.photo_strips for insert
  with check (auth.uid() = user_id);

drop policy if exists "strips: hapus milik sendiri" on public.photo_strips;
create policy "strips: hapus milik sendiri"
  on public.photo_strips for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. STORAGE — bucket publik buat <img src>, tapi nulis cuma di folder sendiri
--    Path di app: user_gallery/<user_id>/<uuid>.webp
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user_gallery',
  'user_gallery',
  true,
  524288, -- 512 KB, cukup buat WebP ~200 KB + cadangan
  array['image/webp', 'image/png', 'image/jpeg']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "gallery: baca publik" on storage.objects;
create policy "gallery: baca publik"
  on storage.objects for select
  using (bucket_id = 'user_gallery');

drop policy if exists "gallery: unggah ke folder sendiri" on storage.objects;
create policy "gallery: unggah ke folder sendiri"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user_gallery'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "gallery: hapus milik sendiri" on storage.objects;
create policy "gallery: hapus milik sendiri"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'user_gallery'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- 5. SEED katalog awal (sesuai src/data/frames.json)
-- ---------------------------------------------------------------------------
insert into public.frames (id, title, category, overlay_url, canvas_width, canvas_height, slots_data)
values
  ('honey-classic',  'Honey Classic',  'strip',     '/frames/honey-classic.png',  1200, 3600, '[{"index":1},{"index":2},{"index":3},{"index":4}]'::jsonb),
  ('midnight-seoul', 'Midnight Seoul', 'strip',     '/frames/midnight-seoul.png', 1200, 3600, '[{"index":1},{"index":2},{"index":3},{"index":4}]'::jsonb),
  ('sage-morning',   'Sage Morning',   'strip',     '/frames/sage-morning.png',   1200, 3600, '[{"index":1},{"index":2},{"index":3},{"index":4}]'::jsonb),
  ('honey-trio',     'Honey Trio',     'strip',     '/frames/honey-trio.png',     1200, 3000, '[{"index":1},{"index":2},{"index":3}]'::jsonb),
  ('butter-grid',    'Butter Grid',    'grid',      '/frames/butter-grid.png',    2400, 3000, '[{"index":1},{"index":2},{"index":3},{"index":4}]'::jsonb),
  ('polaroid-duo',   'Polaroid Duo',   'polaroid',  '/frames/polaroid-duo.png',   1200, 1800, '[{"index":1},{"index":2}]'::jsonb)
on conflict (id) do update
  set title = excluded.title,
      category = excluded.category,
      overlay_url = excluded.overlay_url,
      canvas_width = excluded.canvas_width,
      canvas_height = excluded.canvas_height,
      slots_data = excluded.slots_data;

-- ---------------------------------------------------------------------------
-- Catatan operasional
-- ---------------------------------------------------------------------------
-- 1. Auth → Providers: aktifkan Google. Redirect URL:
--    http://localhost:5173/galeri  dan  https://domain-maybee/galeri
-- 2. Auth → URL Configuration → Site URL: domain produksi DomaiNesia.
-- 3. Free tier Supabase cuma 1 GB storage; 1 strip ~200 KB → ±5.000 strip.
--    Kalau mulai penuh, hapus strip lama lewat galeri (user bisa hapus sendiri).
