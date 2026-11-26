import Link from 'next/link';
import { need } from '@/lib/auth';
import { fmt, fmtT, NEED } from '@/lib/format';
import { Head, Chip, Empty, Msg, Opts } from '@/components/ui';
import { decideMove, cancelMove } from './actions';

const STATUSES = ['Menunggu Foreman', 'Menunggu SPV', 'Disetujui', 'Ditolak', 'Dibatalkan'];

export default async function Pindah({ searchParams }) {
  const { sb, me, user } = await need('pindah');
  const nd = NEED[me.role];
  const s = searchParams.s === undefined ? nd || '' : searchParams.s;
  let qb = sb.from('move_requests')
    .select('*, employee:employees(nik,full_name), from_block:blocks!from_block_id(name), to_block:blocks!to_block_id(name), logs:move_request_logs(actor_name,actor_role,action,note,created_at)')
    .order('created_at', { ascending: false }).limit(500);
  if (s) qb = qb.eq('status', s);
  const { data } = await qb;
  const rows = data || [];
  return (
    <>
      <Head title="Pengajuan pindah kamar" sub="Staff mengajukan, Foreman menyetujui, lalu SPV memberi persetujuan akhir.">
        {me.role === 'Staff' && <Link className="pr" href="/pindah/baru">Ajukan pindah kamar</Link>}
      </Head>
      <form className="bar">
        <select name="s" defaultValue={s}><option value="">Semua status</option><Opts list={STATUSES} /></select>
        <button className="ln">Terapkan</button>
      </form>
      <Msg e={searchParams.e} />
      <div className="tw">
        {rows.length ? (
          <table>
            <thead><tr>{['Diajukan', 'NIK', 'Nama', 'Dari', 'Ke', 'Tgl pindah', 'Alasan', 'Status', 'Riwayat', 'Aksi'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{rows.map((x) => {
              const logs = [...(x.logs || [])].sort((a, b) => a.created_at.localeCompare(b.created_at));
              return (
                <tr key={x.id}>
                  <td>{fmtT(x.created_at)}</td><td>{x.employee?.nik}</td><td>{x.employee?.full_name}</td>
                  <td>{x.from_block?.name} / {x.from_room}</td><td>{x.to_block?.name} / {x.to_room}</td><td>{fmt(x.move_date)}</td>
                  <td style={{ whiteSpace: 'normal', minWidth: 180 }}>{x.reason}</td><td><Chip s={x.status} /></td>
                  <td>{logs.map((l, i) => <div key={i}>{l.actor_name} ({l.actor_role}): {l.action}{l.note ? ` (${l.note})` : ''}</div>)}</td>
                  <td>
                    {x.status === nd && (
                      <form action={decideMove} className="inl">
                        <input type="hidden" name="id" value={x.id} />
                        <input name="note" placeholder="Catatan (wajib jika menolak)" />
                        <button className="pr" name="aksi" value="ok">Setujui</button>
                        <button className="ln dg" name="aksi" value="no">Tolak</button>
                      </form>)}
                    {me.role === 'Staff' && x.status === 'Menunggu Foreman' && x.requested_by === user.id && (
                      <form action={cancelMove}><input type="hidden" name="id" value={x.id} /><button className="ln">Batalkan</button></form>)}
                  </td>
                </tr>);
            })}</tbody>
          </table>
        ) : <Empty />}
      </div>
    </>
  );
}
