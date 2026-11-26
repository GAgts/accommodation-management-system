import { need } from '@/lib/auth';
import { fmt } from '@/lib/format';
import { Head, Chip, Empty } from '@/components/ui';

export default async function Cari({ searchParams }) {
  const { sb } = await need('cari');
  const nik = (searchParams.nik || '').trim();
  const { data: emps } = await sb.from('employees').select('nik,full_name').order('full_name').limit(3000);
  let emp = null, rows = [];
  if (nik) {
    const r = await sb.from('employees').select('id,nik,full_name,gender,department_id,job_title,poh,phone,join_date,status,work_location,company,notes, department:departments(name)').ilike('nik', nik).maybeSingle();
    emp = r.data;
    if (emp) rows = (await sb.from('stays_view').select('*').eq('employee_id', emp.id).order('check_in', { ascending: false })).data || [];
  }
  return (
    <>
      <Head title="Cari history penghuni" sub="Ketik atau pilih NIK untuk melihat seluruh riwayat menginap" />
      <datalist id="nl">{(emps || []).map((e) => <option key={e.nik} value={e.nik}>{e.full_name}</option>)}</datalist>
      <form className="bar"><input name="nik" list="nl" defaultValue={nik} placeholder="Masukkan NIK" /><button className="ln">Cari</button></form>
      {!nik && <Empty text="Masukkan NIK untuk memulai pencarian." />}
      {nik && !emp && <p className="note">NIK belum terdaftar di Data karyawan.</p>}
      {emp && (
        <>
          <div className="box prof">
            <div><span>NIK</span><b>{emp.nik}</b></div><div><span>Nama</span><b>{emp.full_name}</b></div>
            <div><span>Gender</span><b>{emp.gender || '–'}</b></div><div><span>Departemen</span><b>{emp.department?.name || '–'}</b></div>
            <div><span>Jabatan</span><b>{emp.job_title || '–'}</b></div><div><span>PoH</span><b>{emp.poh || '–'}</b></div>
            <div><span>No. telepon</span><b>{emp.phone || '–'}</b></div><div><span>Tanggal bergabung</span><b>{fmt(emp.join_date)}</b></div>
            <div><span>Status karyawan</span><b>{emp.status || '–'}</b></div><div><span>Lokasi kerja</span><b>{emp.work_location || '–'}</b></div>
            <div><span>Perusahaan / kontraktor</span><b>{emp.company || '–'}</b></div><div><span>Total periode menginap</span><b>{rows.length}</b></div>
            {emp.notes && <div><span>Catatan</span><b>{emp.notes}</b></div>}
          </div>
          <div className="tw">
            {rows.length ? (
              <table>
                <thead><tr>{['Blok', 'Kamar', 'Masuk', 'Keluar', 'Status', 'Lama (hari)', 'Catatan'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>{rows.map((p) => (
                  <tr key={p.id}><td>{p.block_name}</td><td>{p.room}</td><td>{fmt(p.check_in)}</td><td>{fmt(p.check_out)}</td><td><Chip s={p.status} /></td><td className="n">{p.days}</td><td>{p.notes || '–'}</td></tr>))}</tbody>
              </table>
            ) : <Empty text="Belum ada riwayat menginap." />}
          </div>
        </>
      )}
    </>
  );
}
