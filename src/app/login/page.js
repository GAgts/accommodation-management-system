import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { login, logout } from './actions';

export default async function Login({ searchParams }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (user) {
    const { data: me } = await sb.from('profiles').select('id').eq('id', user.id).maybeSingle();
    if (me) redirect('/');
    return (
      <div className="lg"><form action={logout}>
        <h1>AMS</h1>
        <p>Akun ini belum memiliki profil. Hubungi SPV atau administrator untuk menyelesaikan pendaftaran akun.</p>
        <button className="pr">Keluar</button>
      </form></div>
    );
  }
  const e = searchParams.e === 'salah' ? 'Username atau kata sandi salah.' : searchParams.e === 'profil' ? 'Akun belum memiliki profil.' : '';
  return (
    <div className="lg">
      <form action={login}>
        <div><h1>AMS</h1><p>Accommodation Management System</p></div>
        <label>Username<input name="username" autoComplete="username" required autoFocus /></label>
        <label>Kata sandi<input name="password" type="password" autoComplete="current-password" required /></label>
        {e && <p className="err">{e}</p>}
        <button className="pr">Masuk</button>
      </form>
    </div>
  );
}
