import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Menyegarkan sesi login dan mengarahkan pengunjung yang belum login ke halaman login.
export async function middleware(request) {
  let res = NextResponse.next({ request });
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        res = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await sb.auth.getUser();
  if (!user && request.nextUrl.pathname !== '/login') return NextResponse.redirect(new URL('/login', request.url));
  return res;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
