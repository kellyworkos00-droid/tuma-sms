import { NextResponse, type NextRequest } from 'next/server';

import { COOKIE, validSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  if (await validSession(request.cookies.get(COOKIE)?.value)) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  }
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = { matcher: ['/app', '/app/:path*', '/api/send'] };
