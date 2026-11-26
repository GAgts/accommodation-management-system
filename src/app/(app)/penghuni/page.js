import Link from 'next/link';
import { need } from '@/lib/auth';
import { fmt, clean } from '@/lib/format';
import { Head, Chip, Empty, Opts } from '@/components/ui';

export default async function Penghuni({ searchParams }) {
  const { sb, me } = await need('penghuni');
  const q = clean(searchParams.q), st = searchParams.st || '', bl = searchParams.b || '';
  let qb = sb.from('stays_view').select('*').order('check_in', { ascending: false }).limit(1000);
  if (st) qb = qb.eq('status', st);
  if (bl) qb = qb.eq('block_name', bl);
  if (q) qb = qb.or(`nik.ilike.%${q}%,full_name.ilike.%${q}%,department.ilike.%${q}%`);
  const [{ data }, { data: blocks }] = await Promise.all([qb, sb.from('blocks').select('name').order('sort')]);
  const rows = data || [];
  return (
    <>
      <Head title="Data penghuni" sub="Satu baris untuk setiap periode menginap. Nama, departemen, dan PoH ditarik dari NIK.">{me.access === 'semua' && <Link className="pr" href="/penghuni/baru">Tambah periode</Link>}</Head>
      <form className="bar">
        <input name="q" defaultValue={searchParams.q || ''} placeholder="Cari NIK, nama, atau departemen" />
        <select name="st" defaultValue={st}><option value="">Semua status</option><Opts list={['In-House', 'Booking', 'Check-Out']} /></select>
        <select name="b" defaultValue={bl}><option value="">Semua blok</option><Opts list={(blocks || []).map((b) => b.name)} /></select>
        <button className="ln">Terapkan</button>
      </form>
      <div className="tw">
        {rows.length ? (
          <table>
            <thead><tr>{['No', 'NIK', 'Nama', 'Gender', 'Departemen', 'PoH', 'Blok', 'Kamar', 'Masuk', 'Keluar', 'Status', 'Lama (hari)', 'Catatan', 'Terakhir diubah', ''].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{rows.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td><td>{p.nik}</td><td>{p.full_name}</td><td>{p.gender}</td><td>{p.department}</td><td>{p.poh}</td>
                <td>{p.block_name}</td><td>{p.room}</td><td>{fmt(p.check_in)}</td><td>{fmt(p.check_out)}</td><td><Chip s={p.status} /></td>
                <td className="n">{p.days}</td><td>{p.notes}</td><td>{p.updated_by_name || <span className="sm">Data awal</span>}</td>
                <td>{me.access === 'semua' && <Link className="ln" href={`/penghuni/${p.id}`}>Ubah</Link>}</td>
              </tr>))}</tbody>
          </table>
        ) : <Empty />}
      </div>
    </>
  );
}
