import Link from 'next/link';
import { need } from '@/lib/auth';
import { fmt, clean } from '@/lib/format';
import { Head, Chip, Empty } from '@/components/ui';

export default async function Karyawan({ searchParams }) {
  const { sb, me } = await need('karyawan');
  const q = clean(searchParams.q);
  let qb = sb.from('employees').select('*, department:departments(name)').order('full_name').limit(1000);
  if (q) qb = qb.or(`nik.ilike.%${q}%,full_name.ilike.%${q}%,poh.ilike.%${q}%,job_title.ilike.%${q}%`);
  const { data } = await qb;
  const rows = data || [];
  return (
    <>
      <Head title="Data karyawan" sub="Master database karyawan">{me.access === 'semua' && <Link className="pr" href="/karyawan/baru">Tambah karyawan</Link>}</Head>
      <form className="bar"><input name="q" defaultValue={searchParams.q || ''} placeholder="Cari NIK, nama, jabatan, atau PoH" /><button className="ln">Cari</button></form>
      <div className="tw">
        {rows.length ? (
          <table>
            <thead><tr>{['No', 'NIK', 'Nama', 'Gender', 'Departemen', 'Jabatan', 'PoH', 'Telepon', 'Bergabung', 'Status', 'Perusahaan', 'Terakhir diubah', ''].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{rows.map((k, i) => (
              <tr key={k.id}>
                <td>{i + 1}</td><td>{k.nik}</td><td>{k.full_name}</td><td>{k.gender}</td><td>{k.department?.name}</td><td>{k.job_title}</td>
                <td>{k.poh}</td><td>{k.phone}</td><td>{fmt(k.join_date)}</td><td><Chip s={k.status} /></td><td>{k.company}</td>
                <td>{k.updated_by_name || <span className="sm">Data awal</span>}</td>
                <td>{me.access === 'semua' && <Link className="ln" href={`/karyawan/${k.id}`}>Ubah</Link>}</td>
              </tr>))}</tbody>
          </table>
        ) : <Empty />}
      </div>
    </>
  );
}
