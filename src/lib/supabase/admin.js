import { createClient } from '@supabase/supabase-js';

// HANYA dipakai di server (Kelola Akun). Kunci service role melewati RLS, jadi jangan pernah dipakai di komponen browser.
export function supabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
