import { need } from '@/lib/auth';
import { fmt } from '@/lib/format';
import { Head, Strip, Empty, Opts } from '@/components/ui';

export default async function PerBlok({ searchParams }) {
  const { sb } = await need('blok');
  const { data: blocks } = await sb.from('blocks').select('id,name').order('sort');
  const list = blocks || [];
  const cur = list.find((b) => b.name === searchParams.b) || list[0];
  const { data } = cur ? await sb.from('stays_view').select('*').eq('block_id', cur.id).order('room') : { data: [] };
  const rows = data || [], cnt = (k) => rows.filter((r) => r.status === k).length;
  const inh = rows.filter((r) => r.status === 'In-House');
  return (
    <>
      <Head title="Penghuni per blok" sub="Daftar penghuni berstatus In-House pada blok terpilih">
        <form><select name="b" defaultValue={cur?.name} style={{ marginRight: 6 }}><Opts list={list.map((b) => b.name)} /></select><button className="ln">Tampilkan</button></form>
      </Head>
      <Strip items={[['In-House', cnt('In-House')], ['Booking', cnt('Booking')], ['Check-Out', cnt('Check-Out')]]} />
      <div className="tw">
        {inh.length ? (
          <table>
            <thead><tr>{['NIK', 'Nama', 'Gender', 'Departemen', 'PoH', 'Telepon', 'Kamar', 'Masuk', 'Keluar', 'Lama (hari)', 'Catatan'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{inh.map((p) => (
              <tr key={p.id}><td>{p.nik}</td><td>{p.full_name}</td><td>{p.gender}</td><td>{p.department}</td><td>{p.poh}</td><td>{p.phone}</td>
                <td>{p.room}</td><td>{fmt(p.check_in)}</td><td>{fmt(p.check_out)}</td><td className="n">{p.days}</td><td>{p.notes}</td></tr>))}</tbody>
          </table>
        ) : <Empty />}
      </div>
    </>
  );
}
