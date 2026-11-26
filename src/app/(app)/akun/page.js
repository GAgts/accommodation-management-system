import Link from 'next/link';
import { need } from '@/lib/auth';
import { ACCESS } from '@/lib/format';
import { Head } from '@/components/ui';

export default async function Akun() {
  const { sb, user } = await need('akun');
  const { data } = await sb.from('profiles').select('*').order('created_at');
  return (
    <>
      <Head title="Kelola akun" sub="Nickname tampil di menu, riwayat persetujuan, dan kolom terakhir diubah."><Link className="pr" href="/akun/baru">Tambah akun</Link></Head>
      <div className="tw">
        <table>
          <thead><tr>{['Nickname', 'Username', 'Peran', 'Akses', ''].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{(data || []).map((a) => (
            <tr key={a.id}>
              <td>{a.nickname}{a.id === user.id && <> <span className="chip">Anda</span></>}</td><td>{a.username}</td><td>{a.role}</td><td>{ACCESS[a.access]}</td>
              <td><Link className="ln" href={`/akun/${a.id}`}>Ubah</Link></td>
            </tr>))}</tbody>
        </table>
      </div>
    </>
  );
}
