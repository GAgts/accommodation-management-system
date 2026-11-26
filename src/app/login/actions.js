'use server';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

// Pengguna masuk dengan username; di Supabase username dipetakan ke email "<username>@ams.local".
export async function login(f) {
  const u = String(f.get('username') || '').trim().toLowerCase();
  const sb = supabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email: `${u}@ams.local`, password: String(f.get('password') || '') });
  if (error) redirect('/login?e=salah');
  redirect('/');
}
export async function logout() {
  await supabaseServer().auth.signOut();
  redirect('/login');
}
