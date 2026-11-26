-- AMS: fungsi dashboard dan alur persetujuan pindah kamar (dijalankan aman di database).

create or replace function public.dashboard_data() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare r jsonb;
begin
  if coalesce(public.my_access(), '') not in ('semua','dashboard') then
    raise exception 'Anda tidak punya akses ke dashboard.';
  end if;
  select jsonb_build_object(
    'stays_total', (select count(*) from stays),
    'status', (select coalesce(jsonb_object_agg(status, c), '{}'::jsonb) from (select status, count(*) c from stays_view group by status) x),
    'gender_inhouse', (select coalesce(jsonb_object_agg(g, c), '{}'::jsonb) from (select coalesce(gender,'Tidak diisi') g, count(*) c from stays_view where status = 'In-House' group by 1) x),
    'blocks', (select coalesce(jsonb_agg(jsonb_build_object('name', b.name, 'capacity', b.capacity,
        'inhouse', coalesce(x.i,0), 'booking', coalesce(x.bk,0), 'checkout', coalesce(x.co,0)) order by b.sort, b.name), '[]'::jsonb)
      from blocks b left join (select block_id,
          count(*) filter (where status='In-House') i, count(*) filter (where status='Booking') bk, count(*) filter (where status='Check-Out') co
          from stays_view group by block_id) x on x.block_id = b.id),
    'emp_status', (select coalesce(jsonb_object_agg(status, c), '{}'::jsonb) from (select status, count(*) c from employees group by status) x),
    'emp_dept', (select coalesce(jsonb_agg(jsonb_build_object('name', n, 'count', c) order by n), '[]'::jsonb)
      from (select d.name n, count(*) c from employees e join departments d on d.id = e.department_id group by d.name) x),
    'emp_gender_aktif', (select coalesce(jsonb_object_agg(g, c), '{}'::jsonb) from (select coalesce(gender,'Tidak diisi') g, count(*) c from employees where status = 'Aktif' group by 1) x)
  ) into r;
  return r;
end $$;

create or replace function public.submit_move_request(p_employee uuid, p_to_block uuid, p_to_room text, p_move_date date, p_reason text)
returns uuid language plpgsql security definer set search_path = public as $$
declare me profiles; s record; rid uuid; v_room text := trim(coalesce(p_to_room, ''));
begin
  select * into me from profiles where id = auth.uid();
  if not found or me.role <> 'Staff' or me.access not in ('semua','pindah') then
    raise exception 'Hanya akun Staff yang boleh mengajukan pindah kamar.';
  end if;
  if v_room = '' or coalesce(trim(p_reason), '') = '' or p_move_date is null or p_to_block is null then
    raise exception 'Blok tujuan, kamar tujuan, tanggal pindah, dan alasan wajib diisi.';
  end if;
  select * into s from stays_view where employee_id = p_employee and status = 'In-House' order by check_in desc limit 1;
  if not found then raise exception 'Karyawan ini sedang tidak In-House, jadi belum bisa pindah kamar.'; end if;
  if p_to_block = s.block_id and v_room = s.room then raise exception 'Kamar tujuan sama dengan kamar saat ini.'; end if;
  if p_move_date < s.check_in then raise exception 'Tanggal pindah tidak boleh sebelum tanggal masuk saat ini.'; end if;
  if exists (select 1 from move_requests where employee_id = p_employee and status in ('Menunggu Foreman','Menunggu SPV')) then
    raise exception 'Masih ada pengajuan yang menunggu persetujuan untuk karyawan ini.';
  end if;
  insert into move_requests(employee_id, stay_id, from_block_id, from_room, to_block_id, to_room, move_date, reason, requested_by)
  values (p_employee, s.id, s.block_id, s.room, p_to_block, v_room, p_move_date, trim(p_reason), me.id) returning id into rid;
  insert into move_request_logs(request_id, actor_id, actor_name, actor_role, action) values (rid, me.id, me.nickname, me.role, 'Mengajukan');
  return rid;
end $$;

create or replace function public.decide_move_request(p_id uuid, p_approve boolean, p_note text)
returns void language plpgsql security definer set search_path = public as $$
declare me profiles; r move_requests; s record; v_note text := nullif(trim(coalesce(p_note, '')), '');
begin
  select * into me from profiles where id = auth.uid();
  if not found or me.access not in ('semua','pindah') then raise exception 'Anda tidak punya akses.'; end if;
  select * into r from move_requests where id = p_id for update;
  if not found then raise exception 'Pengajuan tidak ditemukan.'; end if;
  if not ((me.role = 'Foreman' and r.status = 'Menunggu Foreman') or (me.role = 'SPV' and r.status = 'Menunggu SPV')) then
    raise exception 'Status pengajuan sudah berubah atau Anda tidak berwenang menyetujuinya.';
  end if;
  if not p_approve and v_note is null then raise exception 'Catatan wajib diisi saat menolak.'; end if;
  insert into move_request_logs(request_id, actor_id, actor_name, actor_role, action, note)
  values (r.id, me.id, me.nickname, me.role, case when p_approve then 'Menyetujui' else 'Menolak' end, v_note);
  if not p_approve then
    update move_requests set status = 'Ditolak' where id = r.id;
  elsif me.role = 'Foreman' then
    update move_requests set status = 'Menunggu SPV' where id = r.id;
  else
    update move_requests set status = 'Disetujui' where id = r.id;
    select * into s from stays where id = r.stay_id for update;
    -- periode lama ditutup sehari sebelum tanggal pindah, periode baru dibuat di kamar tujuan
    update stays set check_out = greatest(r.move_date - 1, check_in) where id = r.stay_id;
    insert into stays(employee_id, block_id, room, check_in, notes, source)
    values (r.employee_id, r.to_block_id, r.to_room, r.move_date, 'Pindah kamar (pengajuan disetujui)', 'pindah_kamar');
  end if;
end $$;

create or replace function public.cancel_move_request(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare me profiles; r move_requests;
begin
  select * into me from profiles where id = auth.uid();
  select * into r from move_requests where id = p_id for update;
  if not found or me.id is null or r.requested_by <> me.id or r.status <> 'Menunggu Foreman' then
    raise exception 'Pengajuan ini tidak bisa dibatalkan.';
  end if;
  update move_requests set status = 'Dibatalkan' where id = r.id;
  insert into move_request_logs(request_id, actor_id, actor_name, actor_role, action) values (r.id, me.id, me.nickname, me.role, 'Dibatalkan');
end $$;

revoke execute on function public.dashboard_data() from public, anon;
revoke execute on function public.submit_move_request(uuid, uuid, text, date, text) from public, anon;
revoke execute on function public.decide_move_request(uuid, boolean, text) from public, anon;
revoke execute on function public.cancel_move_request(uuid) from public, anon;
grant execute on function public.dashboard_data() to authenticated;
grant execute on function public.submit_move_request(uuid, uuid, text, date, text) to authenticated;
grant execute on function public.decide_move_request(uuid, boolean, text) to authenticated;
grant execute on function public.cancel_move_request(uuid) to authenticated;
