-- AMS: hak akses (Row Level Security). Aturan ini dijaga oleh database, bukan hanya tampilan.

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$ select role from public.profiles where id = auth.uid() $$;
create or replace function public.my_access() returns text
language sql stable security definer set search_path = public as $$ select access from public.profiles where id = auth.uid() $$;
create or replace function public.can_edit() returns boolean
language sql stable security definer set search_path = public as $$ select coalesce(my_access() = 'semua', false) $$;
create or replace function public.can_read() returns boolean
language sql stable security definer set search_path = public as $$ select coalesce(my_access() in ('semua','pindah'), false) $$;

alter table public.profiles          enable row level security;
alter table public.blocks            enable row level security;
alter table public.departments       enable row level security;
alter table public.employees         enable row level security;
alter table public.stays             enable row level security;
alter table public.move_requests     enable row level security;
alter table public.move_request_logs enable row level security;

-- Profil: setiap orang melihat profilnya sendiri; SPV (akses penuh) melihat semua. Tidak ada tulis dari browser:
-- akun dibuat/diubah/dihapus hanya lewat server (Kelola Akun).
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or (public.my_role() = 'SPV' and public.my_access() = 'semua'));

-- Data utama: baca untuk akses "semua" dan "pindah"; ubah hanya akses "semua".
create policy blocks_read on public.blocks for select to authenticated using (public.can_read());
create policy blocks_write on public.blocks for all to authenticated using (public.can_edit()) with check (public.can_edit());
create policy departments_read on public.departments for select to authenticated using (public.can_read());
create policy departments_write on public.departments for all to authenticated using (public.can_edit()) with check (public.can_edit());
create policy employees_read on public.employees for select to authenticated using (public.can_read());
create policy employees_write on public.employees for all to authenticated using (public.can_edit()) with check (public.can_edit());
create policy stays_read on public.stays for select to authenticated using (public.can_read());
create policy stays_write on public.stays for all to authenticated using (public.can_edit()) with check (public.can_edit());

-- Pengajuan pindah kamar: hanya bisa dibaca. Perubahan hanya lewat fungsi di 003_functions.sql.
create policy requests_read on public.move_requests for select to authenticated using (public.can_read());
create policy logs_read on public.move_request_logs for select to authenticated using (public.can_read());
