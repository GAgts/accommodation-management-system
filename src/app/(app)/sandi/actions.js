'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { getMe } from '@/lib/auth';

export async function changePassword(f) {
  const { sb, me } = await getMe();
  const fail = (m) => redirect(`/sandi?e=${encodeURIComponent(m)}`);
  const a = String(f.get('a') || ''), b = String(f.get('b') || ''), c = String(f.get('c') || '');
  if (b.length < 8) fail('Kata sandi baru minimal 8 karakter.');
  if (b !== c) fail('Pengulangan kata sandi tidak cocok.');
  // Periksa kata sandi lama memakai koneksi terpisah agar sesi saat ini tidak terganggu.
  const check = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { error: e1 } = await check.auth.signInWithPassword({ email: `${me.username}@ams.local`, password: a });
  if (e1) fail('Kata sandi lama salah.');
  const { error } = await sb.auth.updateUser({ password: b });
  if (error) fail(error.message);
  redirect('/sandi?ok=1');
}
