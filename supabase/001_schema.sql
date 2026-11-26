-- AMS: struktur database. Jalankan di Supabase > SQL Editor (urutan 001 -> 005).

create or replace function public.today_local() returns date
language sql stable as $$ select (now() at time zone 'Asia/Jayapura')::date $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9._-]{3,30}$'),
  nickname text not null,
  role text not null check (role in ('SPV','Foreman','Staff','Crew')),
  access text not null default 'semua' check (access in ('semua','pindah','dashboard')),
  created_at timestamptz not null default now()
);

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  capacity integer check (capacity is null or capacity >= 0),
  sort integer not null default 0
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  nik text not null unique,
  full_name text not null,
  gender text check (gender in ('Laki-laki','Perempuan')),
  department_id uuid references public.departments(id) on delete restrict,
  job_title text, poh text, phone text, join_date date,
  status text not null default 'Aktif' check (status in ('Aktif','Nonaktif','Resign')),
  work_location text, company text, notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid, updated_by_name text
);

-- Satu baris = satu periode menginap. Riwayat tidak pernah ditimpa: pindah kamar = periode baru.
create table public.stays (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  block_id uuid not null references public.blocks(id) on delete restrict,
  room text not null,
  check_in date not null,
  check_out date,
  notes text,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid, updated_by_name text,
  constraint stays_dates_ok check (check_out is null or check_out >= check_in)
);
create index stays_employee_idx on public.stays(employee_id);
create index stays_block_idx on public.stays(block_id);
create index stays_checkin_idx on public.stays(check_in);

create table public.move_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  stay_id uuid references public.stays(id) on delete restrict,
  from_block_id uuid references public.blocks(id) on delete restrict,
  from_room text,
  to_block_id uuid not null references public.blocks(id) on delete restrict,
  to_room text not null,
  move_date date not null,
  reason text not null,
  status text not null default 'Menunggu Foreman'
    check (status in ('Menunggu Foreman','Menunggu SPV','Disetujui','Ditolak','Dibatalkan')),
  requested_by uuid not null,
  created_at timestamptz not null default now()
);

create table public.move_request_logs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.move_requests(id) on delete cascade,
  actor_id uuid, actor_name text, actor_role text,
  action text not null, note text,
  created_at timestamptz not null default now()
);

-- Mencatat siapa yang terakhir mengubah data.
create or replace function public.set_audit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  new.updated_by_name := (select nickname from public.profiles where id = auth.uid());
  return new;
end $$;
create trigger employees_audit before insert or update on public.employees for each row execute function public.set_audit();
create trigger stays_audit before insert or update on public.stays for each row execute function public.set_audit();

-- Status penghuni dihitung otomatis dari tanggal hari ini (zona waktu WIT).
create view public.stays_view with (security_invoker = true) as
select s.*, e.nik, e.full_name, e.gender, e.job_title, e.poh, e.phone,
       d.name as department, b.name as block_name,
       case when s.check_out is null or s.check_out >= public.today_local()
            then case when s.check_in <= public.today_local() then 'In-House' else 'Booking' end
            else 'Check-Out' end as status,
       greatest(0, coalesce(s.check_out, public.today_local()) - s.check_in) as days
from public.stays s
join public.employees e on e.id = s.employee_id
join public.blocks b on b.id = s.block_id
left join public.departments d on d.id = e.department_id;
