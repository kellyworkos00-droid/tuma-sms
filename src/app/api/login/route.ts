import { NextResponse, type NextRequest } from 'next/server';

import { COOKIE, createSession, passwordMatches } from '@/lib/auth';

const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const now = Date.now();
  const record = attempts.get(ip);
  if (record && record.until > now && record.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Too many tries. Wait 15 minutes and try again.' }, { status: 429 });
  }

  if (!process.env.APP_PASSWORD || !process.env.AUTH_SECRET) {
    console.error('[auth] APP_PASSWORD or AUTH_SECRET is not set.');
    return NextResponse.json({ error: 'Sign-in is not set up on this server yet.' }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { password?: unknown };
  if (typeof body.password !== 'string' || !(await passwordMatches(body.password))) {
    const active = record && record.until > now ? record.count : 0;
    attempts.set(ip, { count: active + 1, until: now + WINDOW_MS });
    await new Promise((resolve) => setTimeout(resolve, 500));
    return NextResponse.json({ error: 'That password is not right.' }, { status: 401 });
  }

  attempts.delete(ip);
  const { token, maxAge } = await createSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE, token, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' && request.nextUrl.protocol === 'https:', path: '/', maxAge });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE);
  return response;
}
