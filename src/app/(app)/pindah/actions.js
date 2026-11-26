'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getMe } from '@/lib/auth';
import { S } from '@/lib/format';

export async function createMove(f) {
  const { sb } = await getMe();
  const fail = (m) => redirect(`/pindah/baru?e=${encodeURIComponent(m)}`);
  const { data: emp } = await sb.from('employees').select('id').eq('nik', S(f, 'nik') || '').maybeSingle();
  if (!emp) fail('NIK belum terdaftar di Data karyawan.');
  const { error } = await sb.rpc('submit_move_request', {
    p_employee: emp.id, p_to_block: S(f, 'to_block'), p_to_room: S(f, 'to_room'), p_move_date: S(f, 'move_date'), p_reason: S(f, 'reason'),
  });
  if (error) fail(error.message);
  revalidatePath('/pindah');
  redirect('/pindah?s=');
}
export async function decideMove(f) {
  const { sb } = await getMe();
  const { error } = await sb.rpc('decide_move_request', { p_id: S(f, 'id'), p_approve: S(f, 'aksi') === 'ok', p_note: S(f, 'note') });
  if (error) redirect(`/pindah?s=&e=${encodeURIComponent(error.message)}`);
  revalidatePath('/pindah');
  redirect('/pindah?s=');
}
export async function cancelMove(f) {
  const { sb } = await getMe();
  const { error } = await sb.rpc('cancel_move_request', { p_id: S(f, 'id') });
  if (error) redirect(`/pindah?s=&e=${encodeURIComponent(error.message)}`);
  revalidatePath('/pindah');
  redirect('/pindah?s=');
}
