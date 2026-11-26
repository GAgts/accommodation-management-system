import Link from 'next/link';
import { need, can } from '@/lib/auth';
import { fmt, todayISO } from '@/lib/format';
import { Head, Strip, Bars } from '@/components/ui';

export default async function Dashboard() {
  const { sb, me } = await need('dashboard');
  const { data: d, error } = await sb.rpc('dashboard_data');
  if (error || !d) return (<><Head title="Dashboard akomodasi" /><p className="empty">Data belum bisa dimuat. {error?.message}</p></>);
  const st = d.status || {}, c = (k) => st[k] || 0;
  const es = d.emp_status || {}, eg = d.emp_gender_aktif || {}, gi = d.gender_inhouse || {};
  const empTotal = Object.values(es).reduce((a, b) => a + b, 0);
  const mx = Math.max(1, ...d.blocks.map((b) => b.inhouse));
  const G = ['Laki-laki', 'Perempuan'];
  return (
    <>
      <Head title="Dashboard akomodasi" sub={`Per ${fmt(todayISO())}, dihitung otomatis dari tanggal hari ini`} />
      <Strip items={[['Total data penghuni', d.stays_total], ['In-House saat ini', c('In-House')], ['Booking', c('Booking')], ['Sudah check-out', c('Check-Out')]]} />
      <div className="sec"><h2>Penghuni In-House per blok</h2><span>Klik blok untuk melihat daftar penghuni</span></div>
      <div className="tiles">
        {d.blocks.map((b) => {
          const kp = b.capacity || 0;
          const bar = { width: (kp ? Math.min(100, (b.inhouse / kp) * 100) : (b.inhouse / mx) * 100) + '%', ...(kp && b.inhouse > kp ? { background: 'var(--bad)' } : {}) };
          const body = (<>
            <h3>{b.name}</h3>
            <b>{b.inhouse}<span className="mx"> / {kp || '–'}</span></b>
            <small>Maks. {kp ? kp + ' penghuni' : 'belum diatur'}<br />{b.booking} booking, {b.checkout} keluar</small>
            <i style={bar} />
          </>);
          return can(me, 'blok')
            ? <Link key={b.name} className="tile" href={'/blok?b=' + encodeURIComponent(b.name)}>{body}</Link>
            : <div key={b.name} className="tile">{body}</div>;
        })}
      </div>
      <div className="sec"><h2>Komposisi</h2></div>
      <div className="two">
        <div className="box"><h3>Status penghuni</h3><Bars items={['In-House', 'Booking', 'Check-Out'].map((k) => [k, c(k)])} total={d.stays_total} /></div>
        <div className="box"><h3>Gender penghuni In-House</h3><Bars items={G.map((g) => [g, gi[g] || 0])} total={c('In-House')} /></div>
      </div>
      <div className="sec"><h2>Dashboard karyawan</h2><span>Berdasarkan Data karyawan</span></div>
      <Strip items={[['Total karyawan', empTotal], ['Karyawan aktif', es['Aktif'] || 0], ['Nonaktif', es['Nonaktif'] || 0], ['Resign', es['Resign'] || 0]]} />
      <div className="two">
        <div className="box"><h3>Karyawan per departemen</h3>
          {d.emp_dept.length ? <Bars items={d.emp_dept.map((x) => [x.name, x.count])} total={empTotal} /> : <p className="empty">Belum ada data.</p>}
        </div>
        <div className="box"><h3>Gender karyawan aktif</h3><Bars items={G.map((g) => [g, eg[g] || 0])} total={es['Aktif'] || 0} /></div>
      </div>
    </>
  );
}
