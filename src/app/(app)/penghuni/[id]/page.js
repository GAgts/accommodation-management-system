import { notFound } from 'next/navigation';
import { need } from '@/lib/auth';
import { Head, Msg, Opts } from '@/components/ui';
import Confirm from '@/components/Confirm';
import { saveStay, deleteStay } from '../actions';

export default async function FormPenghuni({ params, searchParams }) {
  const { sb } = await need('edit_data');
  const isNew = params.id === 'baru';
  const [{ data: blocks }, { data: emps }] = await Promise.all([
    sb.from('blocks').select('id,name').order('sort'),
    sb.from('employees').select('nik,full_name').order('full_name').limit(3000),
  ]);
  let s = {};
  if (!isNew) {
    const { data } = await sb.from('stays_view').select('*').eq('id', params.id).maybeSingle();
    if (!data) notFound();
    s = data;
  }
  return (
    <>
      <Head title={isNew ? 'Tambah periode menginap' : 'Ubah periode menginap'} />
      <datalist id="nl">{(emps || []).map((e) => <option key={e.nik} value={e.nik}>{e.full_name}</option>)}</datalist>
      <form action={saveStay} className="box fcard">
        {!isNew && <input type="hidden" name="id" value={s.id} />}
        <div className="g">
          <label>NIK karyawan<input name="nik" list="nl" defaultValue={s.nik || ''} required /></label>
          <label>Blok<select name="block_id" defaultValue={s.block_id || ''} required><option value="">–</option><Opts list={(blocks || []).map((b) => [b.id, b.name])} /></select></label>
          <label>No. kamar<input name="room" defaultValue={s.room || ''} required /></label>
          <label>Tanggal masuk<input name="check_in" type="date" defaultValue={s.check_in || ''} required /></label>
          <label>Tanggal keluar (kosongkan jika belum)<input name="check_out" type="date" defaultValue={s.check_out || ''} /></label>
          <label>Catatan<input name="notes" defaultValue={s.notes || ''} /></label>
        </div>
        <Msg e={searchParams.e} />
        <div className="act">
          {!isNew && <Confirm formAction={deleteStay} formNoValidate msg="Hapus periode menginap ini?" className="ln dg">Hapus</Confirm>}
          <span /><a className="ln" href="/penghuni">Batal</a><button className="pr">Simpan</button>
        </div>
      </form>
    </>
  );
}
