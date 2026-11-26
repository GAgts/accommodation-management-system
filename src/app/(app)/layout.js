import Link from 'next/link';
import { getMe, can } from '@/lib/auth';
import { NEED } from '@/lib/format';
import { logout } from '../login/actions';
import Nav from '@/components/Nav';

const ALL = [
  ['/', 'Dashboard', 'dashboard'], ['/penghuni', 'Data penghuni', 'penghuni'], ['/pindah', 'Pindah kamar', 'pindah'],
  ['/karyawan', 'Data karyawan', 'karyawan'], ['/blok', 'Per blok', 'blok'], ['/cari', 'Cari history', 'cari'],
  ['/master', 'Master data', 'master'], ['/akun', 'Kelola akun', 'akun'],
];

export default async function AppLayout({ children }) {
  const { sb, me } = await getMe();
  const items = ALL.filter(([, , k]) => can(me, k));
  let badge = 0;
  if (NEED[me.role] && can(me, 'pindah')) {
    const { count } = await sb.from('move_requests').select('id', { count: 'exact', head: true }).eq('status', NEED[me.role]);
    badge = count || 0;
  }
  return (
    <div className="app">
      <nav>
        <div className="brand">AMS<small>Accommodation Management System</small></div>
        <Nav items={items} badge={badge} />
        <div className="who">
          <b>{me.nickname} ({me.role})</b>
          <div>
            <Link className="ln" href="/sandi">Ubah sandi</Link>
            <form action={logout}><button className="ln">Keluar</button></form>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
