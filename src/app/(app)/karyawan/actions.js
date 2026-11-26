'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { needEdit } from '@/lib/auth';
import { S, DB_ERR } from '@/lib/format';

export async function saveEmployee(f) {
  const { sb } = await needEdit();
  const id = S(f, 'id');
  const row = {
    nik: S(f, 'nik'), full_name: S(f, 'full_name'), gender: S(f, 'gender'), department_id: S(f, 'department_id'),
    job_title: S(f, 'job_title'), poh: S(f, 'poh'), phone: S(f, 'phone'), join_date: S(f, 'join_date'),
    status: S(f, 'status') || 'Aktif', work_location: S(f, 'work_location'), company: S(f, 'company'), notes: S(f, 'notes'),
  };
  const r = id ? await sb.from('employees').update(row).eq('id', id) : await sb.from('employees').insert(row);
  if (r.error) redirect(`/karyawan/${id || 'baru'}?e=${encodeURIComponent(r.error.code === '23505' ? 'NIK sudah dipakai karyawan lain.' : DB_ERR(r.error))}`);
  revalidatePath('/karyawan');
  redirect('/karyawan');
}
export async function deleteEmployee(f) {
  const { sb } = await needEdit();
  const id = S(f, 'id');
  const { error } = await sb.from('employees').delete().eq('id', id);
  if (error) redirect(`/karyawan/${id}?e=${encodeURIComponent(error.code === '23503' ? 'Karyawan ini punya riwayat menginap, jadi tidak bisa dihapus. Ubah statusnya menjadi Resign.' : DB_ERR(error))}`);
  revalidatePath('/karyawan');
  redirect('/karyawan');
}
