import { need } from '@/lib/auth';
import { Head, Msg } from '@/components/ui';
import Confirm from '@/components/Confirm';
import { saveBlock, deleteBlock, saveDept, deleteDept } from './actions';

export default async function Master({ searchParams }) {
  const { sb } = await need('master');
  const [{ data: blocks }, { data: deps }] = await Promise.all([
    sb.from('blocks').select('*').order('sort').order('name'),
    sb.from('departments').select('*').order('name'),
  ]);
  return (
    <>
      <Head title="Master data" sub="Daftar blok (beserta kapasitas maksimal penghuni) dan departemen menjadi sumber pilihan di semua formulir." />
      <Msg e={searchParams.e} />
      <div className="two">
        <div className="box">
          <h3>Blok dan kapasitas maksimal penghuni</h3>
          {(blocks || []).map((b) => (
            <form key={b.id} action={saveBlock} className="inl" style={{ margin: '6px 0' }}>
              <input type="hidden" name="id" value={b.id} />
              <input name="name" defaultValue={b.name} required />
              <input name="capacity" type="number" min="0" defaultValue={b.capacity ?? ''} placeholder="Kapasitas" style={{ width: 100 }} />
              <input name="sort" type="number" defaultValue={b.sort} title="Urutan" style={{ width: 70 }} />
              <button className="ln">Simpan</button>
              <Confirm formAction={deleteBlock} formNoValidate msg={`Hapus ${b.name}?`} className="ln dg">Hapus</Confirm>
            </form>))}
          <form action={saveBlock} className="inl" style={{ marginTop: 12 }}>
            <input name="name" placeholder="Blok baru" required />
            <input name="capacity" type="number" min="0" placeholder="Kapasitas" style={{ width: 100 }} />
            <input name="sort" type="number" defaultValue="0" style={{ width: 70 }} />
            <button className="pr">Tambah</button>
          </form>
          <p className="note">Kolom ketiga adalah urutan tampil. Kapasitas kosong berarti belum diatur.</p>
        </div>
        <div className="box">
          <h3>Departemen</h3>
          {(deps || []).map((d) => (
            <form key={d.id} action={saveDept} className="inl" style={{ margin: '6px 0' }}>
              <input type="hidden" name="id" value={d.id} />
              <input name="name" defaultValue={d.name} required style={{ flex: 1 }} />
              <button className="ln">Simpan</button>
              <Confirm formAction={deleteDept} formNoValidate msg={`Hapus ${d.name}?`} className="ln dg">Hapus</Confirm>
            </form>))}
          <form action={saveDept} className="inl" style={{ marginTop: 12 }}>
            <input name="name" placeholder="Departemen baru" required style={{ flex: 1 }} />
            <button className="pr">Tambah</button>
          </form>
        </div>
      </div>
    </>
  );
}
