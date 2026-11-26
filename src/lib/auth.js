import { redirect } from 'next/navigation';
import { supabaseServer } from './supabase/server';

// Aturan menu: sama dengan aplikasi HTML lama. (Keamanan sebenarnya dijaga oleh RLS di database.)
export function can(me, view) {
  // Akses 'pindah' dapat membaca seluruh informasi operasional dan riwayat,
  // tetapi tidak dapat mengubah data master/karyawan/periode menginap.
  if (me.access === 'pindah')
    return ['pindah', 'karyawan', 'penghuni', 'blok', 'cari'].includes(view);
  if (me.access === 'dashboard') return view === 'dashboard';
  if (view === 'edit_data') return me.access === 'semua';
  return view !== 'akun' || me.role === 'SPV';
}

export async function getMe() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login');
  const { data: me } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (!me) redirect('/login?e=profil');
  return { sb, user, me };
}

export async function need(view) {
  const c = await getMe();
  if (!can(c.me, view)) redirect(c.me.access === 'pindah' ? '/pindah' : '/');
  return c;
}

// Gunakan juga di server action agar URL/form buatan tidak bisa melewati menu.
export async function needEdit() {
  const c = await getMe();
  if (!can(c.me, 'edit_data')) redirect(c.me.access === 'pindah' ? '/pindah' : '/');
  return c;
}
