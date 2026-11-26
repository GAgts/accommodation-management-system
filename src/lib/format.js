export const fmt = (d) => (d ? new Date(d + 'T00:00:00Z').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Jayapura' }) : '–');
export const fmtT = (t) => (t ? new Date(t).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jayapura' }) : '');
export const todayISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jayapura' });
export const clean = (s) => String(s || '').replace(/[,()%*\\]/g, ' ').trim();
export const S = (f, k) => { const v = f.get(k); return v == null ? null : String(v).trim() || null; };
export const NEED = { Foreman: 'Menunggu Foreman', SPV: 'Menunggu SPV' };
export const ROLES = ['SPV', 'Foreman', 'Staff', 'Crew'];
export const ACCESS = { semua: 'Semua akses', pindah: 'Hanya pindah kamar', dashboard: 'Hanya dashboard' };
export const DB_ERR = (e) => (e.code === '23505' ? 'Data dengan nilai yang sama sudah ada.'
  : e.code === '23503' ? 'Data ini masih terhubung dengan data lain (riwayat atau pengajuan), jadi tidak bisa dihapus.'
  : e.code === '23514' ? 'Isian tidak valid. Periksa tanggal dan pilihan Anda.'
  : e.code === '42501' ? 'Anda tidak punya hak untuk melakukan ini.' : e.message);
