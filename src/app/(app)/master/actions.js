'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { needEdit } from '@/lib/auth';
import { S, DB_ERR } from '@/lib/format';

const done = (err) => { revalidatePath('/master'); redirect('/master' + (err ? `?e=${encodeURIComponent(err)}` : '')); };

export async function saveBlock(f) {
  const { sb } = await needEdit();
  const id = S(f, 'id');
  const cap = S(f, 'capacity');
  const row = { name: S(f, 'name'), capacity: cap === null ? null : parseInt(cap, 10), sort: parseInt(S(f, 'sort') || '0', 10) };
  if (!row.name) done('Nama blok wajib diisi.');
  const r = id ? await sb.from('blocks').update(row).eq('id', id) : await sb.from('blocks').insert(row);
  done(r.error ? DB_ERR(r.error) : '');
}
export async function deleteBlock(f) {
  const { sb } = await needEdit();
  const { error } = await sb.from('blocks').delete().eq('id', S(f, 'id'));
  done(error ? DB_ERR(error) : '');
}
export async function saveDept(f) {
  const { sb } = await needEdit();
  const id = S(f, 'id');
  const row = { name: S(f, 'name') };
  if (!row.name) done('Nama departemen wajib diisi.');
  const r = id ? await sb.from('departments').update(row).eq('id', id) : await sb.from('departments').insert(row);
  done(r.error ? DB_ERR(r.error) : '');
}
export async function deleteDept(f) {
  const { sb } = await needEdit();
  const { error } = await sb.from('departments').delete().eq('id', S(f, 'id'));
  done(error ? DB_ERR(error) : '');
}
