-- AMS: penguatan integritas kamar dan tanggal. Zona waktu resmi: WIT (Asia/Jayapura).
-- Jalankan setelah 001_schema.sql sampai 004_seed_master.sql.

create extension if not exists btree_gist;

-- Satu kamar tidak boleh ditempati dua periode yang tanggalnya saling bertumpuk.
-- check_out dianggap sebagai hari terakhir menginap, sehingga batas atas range dibuat eksklusif (+ 1 hari).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'stays_room_no_overlap') then
    alter table public.stays
      add constraint stays_room_no_overlap
      exclude using gist (
        block_id with =,
        (lower(btrim(room))) with =,
        (daterange(check_in, case when check_out is null then null else check_out + 1 end, '[)')) with &&
      );
  end if;
  if not exists (select 1 from pg_constraint where conname = 'stays_employee_no_overlap') then
    alter table public.stays
      add constraint stays_employee_no_overlap
      exclude using gist (
        employee_id with =,
        (daterange(check_in, case when check_out is null then null else check_out + 1 end, '[)')) with &&
      );
  end if;
end $$;

-- Periksa kembali ketersediaan kamar pada saat permintaan diajukan dan disetujui.
create or replace function public.submit_move_request(
  p_employee uuid, p_to_block uuid, p_to_room text, p_move_date date, p_reason text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles;
  s record;
  rid uuid;
  v_room text := trim(coalesce(p_to_room, ''));
begin
  select * into me from public.profiles where id = auth.uid();
  if not found or me.role <> 'Staff' or me.access not in ('semua','pindah') then
    raise exception 'Hanya akun Staff dengan akses pindah kamar yang boleh mengajukan.';
  end if;
  if v_room = '' or coalesce(trim(p_reason), '') = '' or p_move_date is null or p_to_block is null then
    raise exception 'Blok tujuan, kamar tujuan, tanggal pindah, dan alasan wajib diisi.';
  end if;
  if p_move_date < public.today_local() then
    raise exception 'Tanggal pindah tidak boleh sebelum tanggal hari ini (WIT).';
  end if;
  select * into s from public.stays_view
    where employee_id = p_employee and status = 'In-House'
    order by check_in desc limit 1;
  if not found then
    raise exception 'Karyawan ini sedang tidak In-House, jadi belum bisa pindah kamar.';
  end if;
  if p_move_date <= s.check_in then
    raise exception 'Tanggal pindah harus setelah tanggal masuk pada periode kamar saat ini.';
  end if;
  if p_to_block = s.block_id and lower(v_room) = lower(trim(s.room)) then
    raise exception 'Kamar tujuan sama dengan kamar saat ini.';
  end if;
  if exists (
    select 1 from public.stays x
    where x.block_id = p_to_block and lower(trim(x.room)) = lower(v_room)
      and daterange(x.check_in, case when x.check_out is null then null else x.check_out + 1 end, '[)')
          && daterange(p_move_date, null, '[)')
  ) then
    raise exception 'Kamar tujuan sudah memiliki penghuni pada tanggal pindah atau setelahnya.';
  end if;
  if exists (
    select 1 from public.move_requests
    where employee_id = p_employee and status in ('Menunggu Foreman','Menunggu SPV')
  ) then
    raise exception 'Masih ada pengajuan yang menunggu persetujuan untuk karyawan ini.';
  end if;
  insert into public.move_requests(employee_id, stay_id, from_block_id, from_room, to_block_id, to_room, move_date, reason, requested_by)
  values (p_employee, s.id, s.block_id, s.room, p_to_block, v_room, p_move_date, trim(p_reason), me.id)
  returning id into rid;
  insert into public.move_request_logs(request_id, actor_id, actor_name, actor_role, action)
  values (rid, me.id, me.nickname, me.role, 'Mengajukan');
  return rid;
end $$;

create or replace function public.decide_move_request(p_id uuid, p_approve boolean, p_note text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  me public.profiles;
  r public.move_requests;
  s public.stays;
  v_note text := nullif(trim(coalesce(p_note, '')), '');
begin
  select * into me from public.profiles where id = auth.uid();
  if not found or me.access not in ('semua','pindah') then
    raise exception 'Anda tidak punya akses.';
  end if;
  select * into r from public.move_requests where id = p_id for update;
  if not found then raise exception 'Pengajuan tidak ditemukan.'; end if;
  if not ((me.role = 'Foreman' and r.status = 'Menunggu Foreman') or
          (me.role = 'SPV' and r.status = 'Menunggu SPV')) then
    raise exception 'Status pengajuan sudah berubah atau Anda tidak berwenang menyetujuinya.';
  end if;
  if not p_approve and v_note is null then
    raise exception 'Catatan wajib diisi saat menolak.';
  end if;
  if p_approve and me.role = 'SPV' then
    if r.move_date < public.today_local() then
      raise exception 'Tanggal pindah sudah lewat menurut WIT. Ajukan ulang dengan tanggal yang benar.';
    end if;
    select * into s from public.stays where id = r.stay_id for update;
    if not found or s.employee_id <> r.employee_id or s.check_out is not null then
      raise exception 'Periode kamar asal sudah berubah. Periksa data penghuni sebelum menyetujui.';
    end if;
    if r.move_date <= s.check_in then
      raise exception 'Tanggal pindah harus setelah tanggal masuk pada periode kamar saat ini.';
    end if;
    if exists (
      select 1 from public.stays x
      where x.block_id = r.to_block_id and lower(trim(x.room)) = lower(trim(r.to_room))
        and daterange(x.check_in, case when x.check_out is null then null else x.check_out + 1 end, '[)')
            && daterange(r.move_date, null, '[)')
    ) then
      raise exception 'Kamar tujuan sudah ditempati atau sudah dipesan pada tanggal pindah.';
    end if;
  end if;
  insert into public.move_request_logs(request_id, actor_id, actor_name, actor_role, action, note)
  values (r.id, me.id, me.nickname, me.role,
          case when p_approve then 'Menyetujui' else 'Menolak' end, v_note);
  if not p_approve then
    update public.move_requests set status = 'Ditolak' where id = r.id;
  elsif me.role = 'Foreman' then
    update public.move_requests set status = 'Menunggu SPV' where id = r.id;
  else
    update public.move_requests set status = 'Disetujui' where id = r.id;
    update public.stays set check_out = r.move_date - 1 where id = r.stay_id;
    insert into public.stays(employee_id, block_id, room, check_in, notes, source)
    values (r.employee_id, r.to_block_id, r.to_room, r.move_date,
            'Pindah kamar (pengajuan disetujui)', 'pindah_kamar');
  end if;
end $$;

revoke execute on function public.submit_move_request(uuid, uuid, text, date, text) from public, anon;
revoke execute on function public.decide_move_request(uuid, boolean, text) from public, anon;
grant execute on function public.submit_move_request(uuid, uuid, text, date, text) to authenticated;
grant execute on function public.decide_move_request(uuid, boolean, text) to authenticated;
