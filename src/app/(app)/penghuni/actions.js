'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { needEdit } from '@/lib/auth';
import { S, DB_ERR } from '@/lib/format';

export async function saveStay(f) {
  const { sb } = await needEdit();
  const id = S(f, 'id');
  const back = `/penghuni/${id || 'baru'}`;
  const fail = (m) => redirect(`${back}?e=${encodeURIComponent(m)}`);
  const { data: emp } = await sb.from('employees').select('id').eq('nik', S(f, 'nik') || '').maybeSingle();
  if (!emp) fail('NIK belum terdaftar di Data karyawan.');
  const row = { employee_id: emp.id, block_id: S(f, 'block_id'), room: S(f, 'room'), check_in: S(f, 'check_in'), check_out: S(f, 'check_out'), notes: S(f, 'notes') };
  if (!row.block_id || !row.room || !row.check_in) fail('Blok, kamar, dan tanggal masuk wajib diisi.');
  if (row.check_out && row.check_out < row.check_in) fail('Tanggal keluar tidak boleh sebelum tanggal masuk.');
  const r = id ? await sb.from('stays').update(row).eq('id', id) : await sb.from('stays').insert(row);
  if (r.error) fail(DB_ERR(r.error));
  revalidatePath('/penghuni');
  redirect('/penghuni');
}
export async function deleteStay(f) {
  const { sb } = await needEdit();
  const id = S(f, 'id');
  const { error } = await sb.from('stays').delete().eq('id', id);
  if (error) redirect(`/penghuni/${id}?e=${encodeURIComponent(DB_ERR(error))}`);
  revalidatePath('/penghuni');
  redirect('/penghuni');
}
