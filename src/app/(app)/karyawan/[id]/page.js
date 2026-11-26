import { notFound } from 'next/navigation';
import { need } from '@/lib/auth';
import { Head, Msg, Opts } from '@/components/ui';
import Confirm from '@/components/Confirm';
import { saveEmployee, deleteEmployee } from '../actions';

export default async function FormKaryawan({ params, searchParams }) {
  const { sb } = await need('edit_data');
  const isNew = params.id === 'baru';
  const { data: deps } = await sb.from('departments').select('id,name').order('name');
  let e = { status: 'Aktif', gender: 'Laki-laki' };
  if (!isNew) {
    const { data } = await sb.from('employees').select('*').eq('id', params.id).maybeSingle();
    if (!data) notFound();
    e = data;
  }
  return (
    <>
      <Head title={isNew ? 'Tambah karyawan' : 'Ubah karyawan'} />
      <form action={saveEmployee} className="box fcard">
        {!isNew && <input type="hidden" name="id" value={e.id} />}
        <div className="g">
          <label>NIK karyawan<input name="nik" defaultValue={e.nik || ''} required /></label>
          <label>Nama lengkap<input name="full_name" defaultValue={e.full_name || ''} required /></label>
          <label>Gender<select name="gender" defaultValue={e.gender || ''}><option value="">–</option><Opts list={['Laki-laki', 'Perempuan']} /></select></label>
          <label>Departemen<select name="department_id" defaultValue={e.department_id || ''}><option value="">–</option><Opts list={(deps || []).map((d) => [d.id, d.name])} /></select></label>
          <label>Jabatan<input name="job_title" defaultValue={e.job_title || ''} /></label>
          <label>PoH<input name="poh" defaultValue={e.poh || ''} /></label>
          <label>No. telepon<input name="phone" defaultValue={e.phone || ''} /></label>
          <label>Tanggal bergabung<input name="join_date" type="date" defaultValue={e.join_date || ''} /></label>
          <label>Status karyawan<select name="status" defaultValue={e.status}><Opts list={['Aktif', 'Nonaktif', 'Resign']} /></select></label>
          <label>Lokasi kerja<input name="work_location" defaultValue={e.work_location || ''} /></label>
          <label>Perusahaan / kontraktor<input name="company" defaultValue={e.company || ''} /></label>
          <label>Catatan<input name="notes" defaultValue={e.notes || ''} /></label>
        </div>
        <Msg e={searchParams.e} />
        <div className="act">
          {!isNew && <Confirm formAction={deleteEmployee} formNoValidate msg="Hapus karyawan ini?" className="ln dg">Hapus</Confirm>}
          <span /><a className="ln" href="/karyawan">Batal</a><button className="pr">Simpan</button>
        </div>
      </form>
    </>
  );
}
