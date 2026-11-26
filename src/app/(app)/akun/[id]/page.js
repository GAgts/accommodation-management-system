import { notFound } from 'next/navigation';
import { need } from '@/lib/auth';
import { ROLES, ACCESS } from '@/lib/format';
import { Head, Msg, Opts } from '@/components/ui';
import Confirm from '@/components/Confirm';
import { saveAccount, deleteAccount } from '../actions';

export default async function FormAkun({ params, searchParams }) {
  const { sb, user } = await need('akun');
  const isNew = params.id === 'baru';
  let a = { role: 'Staff', access: 'semua' };
  if (!isNew) {
    const { data } = await sb.from('profiles').select('*').eq('id', params.id).maybeSingle();
    if (!data) notFound();
    a = data;
  }
  return (
    <>
      <Head title={isNew ? 'Tambah akun' : 'Ubah akun'} />
      <form action={saveAccount} className="box fcard">
        {!isNew && <input type="hidden" name="id" value={a.id} />}
        <div className="g">
          <label>Nickname<input name="nickname" defaultValue={a.nickname || ''} required /></label>
          <label>Username (untuk login)<input name="username" defaultValue={a.username || ''} required autoComplete="off" /></label>
          <label>Peran<select name="role" defaultValue={a.role}><Opts list={ROLES} /></select></label>
          <label>Akses halaman<select name="access" defaultValue={a.access}><Opts list={Object.entries(ACCESS)} /></select></label>
          <label>{isNew ? 'Kata sandi (minimal 8 karakter)' : 'Kata sandi baru (kosongkan jika tidak diubah)'}<input name="password" type="password" autoComplete="new-password" required={isNew} /></label>
        </div>
        <Msg e={searchParams.e} />
        <div className="act">
          {!isNew && a.id !== user.id && <Confirm formAction={deleteAccount} formNoValidate msg="Hapus akun ini?" className="ln dg">Hapus</Confirm>}
          <span /><a className="ln" href="/akun">Batal</a><button className="pr">{isNew ? 'Tambah akun' : 'Simpan'}</button>
        </div>
      </form>
    </>
  );
}
