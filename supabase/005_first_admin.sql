-- AMS: menjadikan akun pertama sebagai SPV (administrator).
-- 1) Buat dulu pengguna di Supabase > Authentication > Users > Add user,
--    dengan email  spv@ams.local  dan kata sandi pilihan Anda sendiri (centang "Auto Confirm User").
-- 2) Jalankan perintah di bawah ini. Jika ingin username lain, ganti 'spv' di KEDUA tempat.
insert into public.profiles (id, username, nickname, role, access)
select id, 'spv', 'SPV', 'SPV', 'semua' from auth.users where email = 'spv@ams.local';
