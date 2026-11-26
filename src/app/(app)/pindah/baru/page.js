import { redirect } from 'next/navigation';
import { need } from '@/lib/auth';
import { todayISO } from '@/lib/format';
import { Head, Msg, Opts } from '@/components/ui';
import { createMove } from '../actions';

export default async function BaruPindah({ searchParams }) {
  const { sb, me } = await need('pindah');
  if (me.role !== 'Staff') redirect('/pindah');
  const [{ data: blocks }, { data: emps }] = await Promise.all([
    sb.from('blocks').select('id,name').order('sort'),
    sb.from('employees').select('nik,full_name').order('full_name').limit(3000),
  ]);
  return (
    <>
      <Head title="Ajukan pindah kamar" sub="Blok dan kamar asal terisi otomatis dari periode In-House saat ini." />
      <datalist id="nl">{(emps || []).map((e) => <option key={e.nik} value={e.nik}>{e.full_name}</option>)}</datalist>
      <form action={createMove} className="box fcard">
        <div className="g">
          <label>NIK karyawan<input name="nik" list="nl" required /></label>
          <label>Pindah ke blok<select name="to_block" required><option value="">–</option><Opts list={(blocks || []).map((b) => [b.id, b.name])} /></select></label>
          <label>No. kamar tujuan<input name="to_room" required /></label>
          <label>Tanggal pindah<input name="move_date" type="date" defaultValue={todayISO()} required /></label>
          <label>Alasan pindah<input name="reason" required /></label>
        </div>
        <Msg e={searchParams.e} />
        <div className="act"><span /><a className="ln" href="/pindah">Batal</a><button className="pr">Kirim pengajuan</button></div>
      </form>
    </>
  );
}
