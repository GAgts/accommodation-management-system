import { getMe } from '@/lib/auth';
import { Head, Msg } from '@/components/ui';
import { changePassword } from './actions';

export default async function Sandi({ searchParams }) {
  const { me } = await getMe();
  return (
    <>
      <Head title="Ubah kata sandi" sub={`Akun: ${me.nickname} (${me.username})`} />
      <form action={changePassword} className="box fcard">
        <div className="g">
          <label>Kata sandi lama<input name="a" type="password" autoComplete="current-password" required /></label>
          <label>Kata sandi baru (minimal 8 karakter)<input name="b" type="password" autoComplete="new-password" required /></label>
          <label>Ulangi kata sandi baru<input name="c" type="password" autoComplete="new-password" required /></label>
        </div>
        <Msg e={searchParams.e} />
        {searchParams.ok && <p style={{ color: 'var(--ok)' }}>Kata sandi berhasil diubah.</p>}
        <div className="act"><span /><button className="pr">Simpan</button></div>
      </form>
    </>
  );
}
