# AMS – Accommodation Management System

Aplikasi web untuk mengelola akomodasi (mess) karyawan: Dashboard, Data Karyawan, Data Penghuni, Pindah Kamar (persetujuan Foreman lalu SPV), Penghuni Per Blok, Cari History berdasarkan NIK, Master Data, dan Kelola Akun.

Zona waktu operasional AMS: **WIT (Asia/Jayapura, UTC+9)**. Tanggal status penghuni dan tanggal pindah dihitung berdasarkan WIT.

Teknologi: **Next.js** (aplikasi web), **Supabase** (database PostgreSQL, login, dan hak akses RLS), **GitHub** (menyimpan kode), **Vercel** (hosting).

> Folder ini adalah **proyek baru**. File HTML lama (`akomodasi-karyawan.html`) tidak diubah dan tidak dihapus.
> Tidak ada data pribadi dan tidak ada kata sandi di dalam kode ini.

---

## Langkah 1 – Pasang program di Windows (sekali saja)

1. Unduh dan pasang **Node.js versi LTS** dari https://nodejs.org (klik Next sampai selesai).
2. Pasang **Visual Studio Code** dari https://code.visualstudio.com (opsional, untuk membuka file).
3. Pasang **GitHub Desktop** dari https://desktop.github.com (untuk Langkah 6).
4. Ekstrak file `ams.zip` ke folder, misalnya `C:\ams`.

Cek Node.js: tekan tombol Windows, ketik `cmd`, Enter, lalu ketik `node -v`. Jika muncul nomor versi, berarti berhasil.

## Langkah 2 – Buat database di Supabase

1. Daftar gratis di https://supabase.com, klik **New project**. Isi nama `ams`, buat *Database Password* (simpan di tempat aman), pilih region terdekat (Singapore), lalu **Create**. Tunggu 1–2 menit.
2. Buka menu **SQL Editor** > **New query**.
3. Buka file di folder `supabase`, salin seluruh isinya, tempel, lalu klik **Run**. Lakukan **berurutan**, satu file satu kali:
   1. `001_schema.sql`
   2. `002_rls.sql`
   3. `003_functions.sql`
   4. `004_seed_master.sql`
   5. `006_integrity_wit.sql` (pengamanan bentrok kamar/periode dan validasi pindah kamar; zona waktu WIT).
   (File `005_first_admin.sql` dijalankan di Langkah 4.)
   Setiap file harus berakhir dengan tulisan *Success*.

## Langkah 3 – Hubungkan aplikasi ke Supabase

1. Di Supabase buka **Project Settings** > **API**. Catat tiga nilai: **Project URL**, **anon public key**, dan **service_role key**.
2. Di folder `C:\ams`, salin file `.env.local.example` lalu ubah nama salinannya menjadi `.env.local`.
3. Buka `.env.local` dengan Notepad dan isi:
   ```
   NEXT_PUBLIC_SUPABASE_URL=(Project URL)
   NEXT_PUBLIC_SUPABASE_ANON_KEY=(anon public key)
   SUPABASE_SERVICE_ROLE_KEY=(service_role key)
   ```
   **service_role key bersifat rahasia.** Jangan dibagikan dan jangan diunggah ke GitHub (file `.env.local` sudah dikecualikan otomatis).

## Langkah 4 – Buat akun SPV pertama

1. Di Supabase buka **Authentication** > **Users** > **Add user** > **Create new user**.
2. Isi email `spv@ams.local`, isi kata sandi pilihan Anda sendiri (minimal 8 karakter), **centang Auto Confirm User**, lalu **Create user**.
3. Buka **SQL Editor**, salin isi `supabase/005_first_admin.sql`, lalu **Run**.
4. Login nanti memakai username `spv` dan kata sandi yang Anda buat tadi. Akun lain dibuat dari menu **Kelola akun**.

## Langkah 5 – Jalankan di komputer

1. Buka folder `C:\ams`, klik kolom alamat folder, ketik `cmd`, lalu Enter.
2. Ketik `npm install` lalu Enter. Tunggu sampai selesai (hanya sekali).
3. Ketik `npm run dev` lalu Enter.
4. Buka browser ke http://localhost:3000 lalu login.
5. Untuk menghentikan: tekan `Ctrl + C` di jendela hitam tadi.

## Langkah 6 – Simpan ke GitHub

1. Daftar di https://github.com, lalu buka **GitHub Desktop** dan login.
2. **File** > **Add local repository** > pilih `C:\ams`. Jika diminta, klik *create a repository*.
3. Klik **Commit to main**, lalu **Publish repository**. Pilih **Keep this code private** (tetap pribadi).

## Langkah 7 – Terbitkan di Vercel

1. Daftar di https://vercel.com memakai akun GitHub.
2. **Add New** > **Project** > pilih repository `ams` > **Import**.
3. Buka bagian **Environment Variables** dan masukkan tiga nilai yang sama seperti di `.env.local` (tiga nama dan tiga nilainya).
4. Klik **Deploy**. Setelah selesai, Anda mendapat alamat seperti `ams-xxxx.vercel.app`.

## Langkah 8 – Pakai domain sendiri

1. Di Vercel buka project > **Settings** > **Domains** > masukkan domain Anda (misalnya `ams.namaperusahaan.com`).
2. Vercel menampilkan data DNS yang harus dibuat. Masukkan ke pengelola domain Anda, lalu tunggu aktif (beberapa menit sampai beberapa jam).

---

## Struktur proyek

| Lokasi | Isi |
|---|---|
| `supabase/001_schema.sql` | Tabel, relasi, pencatatan perubahan, dan tampilan status penghuni |
| `supabase/002_rls.sql` | Hak akses di database (Row Level Security) |
| `supabase/003_functions.sql` | Dashboard dan alur persetujuan pindah kamar |
| `supabase/004_seed_master.sql` | Daftar blok dan departemen awal |
| `supabase/006_integrity_wit.sql` | Mencegah bentrok kamar/periode dan memperkuat validasi pindah kamar (WIT) |
| `src/app/login` | Halaman login |
| `src/app/(app)/` | Dashboard, karyawan, penghuni, pindah, blok, cari, master, akun, sandi |
| `src/lib` | Koneksi Supabase, aturan menu, format tanggal |
| `src/components` | Komponen kecil (menu, tombol konfirmasi, tampilan umum) |
| `src/app/globals.css` | Desain (diambil dari file HTML lama) |

## Tabel database

`profiles` (akun) · `blocks` (blok dan kapasitas) · `departments` · `employees` (karyawan) · `stays` (setiap periode menginap, riwayat tidak pernah ditimpa) · `move_requests` dan `move_request_logs` (pengajuan dan riwayat persetujuan).

## Hak akses (dijaga database)

- **Akses "Semua"**: boleh melihat dan mengubah data utama. **"Hanya pindah kamar"**: dapat melihat seluruh data operasional karyawan (termasuk telepon, PoH, data pribadi pada master karyawan), seluruh periode/riwayat menginap, data penghuni per blok, dan pengajuan/riwayat persetujuan pindah kamar. Akun ini bersifat baca-saja untuk data karyawan, periode menginap, dan master blok/departemen; tidak dapat menambah, mengubah, atau menghapusnya. **"Hanya dashboard"**: hanya angka ringkasan Dashboard; tidak bisa membaca tabel lain.
- **Menu akses "Hanya pindah kamar"**: Dashboard tidak ditampilkan; menu Data Karyawan, Data Penghuni, Pindah Kamar, Per Blok, dan Cari History tersedia dalam mode baca-saja. Pencarian NIK menampilkan profil karyawan dan seluruh periode menginap.
- **Pindah kamar**: hanya Staff yang bisa mengajukan, hanya Foreman yang bisa menyetujui tahap 1, hanya SPV yang bisa menyetujui tahap akhir. Aturan ini ada di fungsi database, bukan di tampilan.
- **Kelola akun**: hanya SPV dengan akses penuh, dan dikerjakan di server.

## Perbedaan dengan file HTML lama

- Login memakai **username** (huruf kecil tanpa spasi, misalnya `spv`), bukan memilih dari daftar akun. Di Supabase username dipetakan ke email `username@ams.local`.
- Kata sandi minimal **8 karakter**. Batas percobaan login diatur oleh Supabase, bukan lagi kunci 30 detik buatan sendiri.
- Tombol "Kembalikan data awal dari Excel" **dihapus** karena berbahaya pada data produksi.
- Konfirmasi hapus memakai kotak konfirmasi browser. Karyawan yang punya riwayat menginap tidak bisa dihapus; ubah statusnya menjadi Resign.
- Perubahan dari pengguna lain terlihat setelah halaman dimuat ulang (belum real-time).
- Data contoh (nama, NIK, telepon) tidak dibawa. Data lama perlu dimasukkan ulang atau diimpor (rencana tahap berikutnya).

## Catatan keamanan

- Jangan pernah memasukkan `SUPABASE_SERVICE_ROLE_KEY` ke GitHub atau membagikannya.
- Segera ganti kata sandi awal, dan beri akses hanya kepada orang yang perlu.
- Di Supabase > Authentication > Providers, pastikan pendaftaran mandiri (*Allow new users to sign up*) **dimatikan**, supaya orang luar tidak bisa membuat akun sendiri.
