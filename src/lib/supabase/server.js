import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Koneksi ke Supabase untuk kode yang berjalan di server (membawa sesi login pengguna).
export function supabaseServer() {
  const store = cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return store.getAll(); },
      setAll(list) {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch (e) { /* diabaikan di halaman biasa */ }
      },
    },
  });
}
