'use server';
import { redirect } from 'next/navigation';
import { getMe } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ROLES, ACCESS } from '@/lib/format';

const emailOf = (u) => `${u}@ams.local`;
const bad = (path, m) => redirect(`${path}?e=${encodeURIComponent(m)}`);

// Setiap tindakan memeriksa dulu bahwa yang meminta adalah SPV dengan akses penuh.
async function onlySPV() {
  const c = await getMe();
  if (c.me.role !== 'SPV' || c.me.access !== 'semua') redirect('/');
  return c;
}
async function fullSpvCount(ad) {
  const { count } = await ad.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'SPV').eq('access', 'semua');
  return count || 0;
}

export async function saveAccount(f) {
  await onlySPV();
  const ad = supabaseAdmin();
  const id = String(f.get('id') || '');
  const back = '/akun/' + (id || 'baru');
  const username = String(f.get('username') || '').trim().toLowerCase();
  const nickname = String(f.get('nickname') || '').trim();
  const role = String(f.get('role') || '');
  const access = String(f.get('access') || '');
  const pw = String(f.get('password') || '');
  if (!/^[a-z0-9._-]{3,30}$/.test(username)) bad(back, 'Username 3 sampai 30 karakter: huruf kecil, angka, titik, garis bawah, atau strip. Tanpa spasi.');
  if (!nickname) bad(back, 'Nickname wajib diisi.');
  if (!ROLES.includes(role)) bad(back, 'Pilih peran akun.');
  if (!ACCESS[access]) bad(back, 'Pilih akses akun.');
  if (pw && pw.length < 8) bad(back, 'Kata sandi minimal 8 karakter.');
  const { data: dup } = await ad.from('profiles').select('id').eq('username', username).neq('id', id || '00000000-0000-0000-0000-000000000000').maybeSingle();
  if (dup) bad(back, 'Username sudah dipakai akun lain.');

  if (!id) {
    if (!pw) bad(back, 'Kata sandi wajib diisi untuk akun baru.');
    const { data, error } = await ad.auth.admin.createUser({ email: emailOf(username), password: pw, email_confirm: true });
    if (error) bad(back, error.message);
    const { error: e2 } = await ad.from('profiles').insert({ id: data.user.id, username, nickname, role, access });
    if (e2) { await ad.auth.admin.deleteUser(data.user.id); bad(back, e2.message); }
  } else {
    const { data: cur } = await ad.from('profiles').select('*').eq('id', id).single();
    if (cur.role === 'SPV' && cur.access === 'semua' && !(role === 'SPV' && access === 'semua') && (await fullSpvCount(ad)) < 2)
      bad(back, 'Harus tersisa minimal satu akun SPV dengan akses penuh.');
    const { error } = await ad.from('profiles').update({ username, nickname, role, access }).eq('id', id);
    if (error) bad(back, error.message);
    const au = {};
    if (username !== cur.username) au.email = emailOf(username);
    if (pw) au.password = pw;
    if (Object.keys(au).length) {
      const { error: e3 } = await ad.auth.admin.updateUserById(id, au);
      if (e3) bad(back, e3.message);
    }
  }
  redirect('/akun');
}

export async function deleteAccount(f) {
  const { user } = await onlySPV();
  const id = String(f.get('id') || '');
  if (id === user.id) bad('/akun/' + id, 'Akun sendiri tidak boleh dihapus.');
  const { error } = await supabaseAdmin().auth.admin.deleteUser(id);
  if (error) bad('/akun/' + id, error.message);
  redirect('/akun');
}
