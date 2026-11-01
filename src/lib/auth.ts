/** A signed cookie, using Web Crypto so the same code runs in middleware and API routes. */

export const COOKIE = 'tuma_session';
const WEEK_SECONDS = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

async function hmac(message: string): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error('AUTH_SECRET must be at least 32 characters.');
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function sameText(a: string, b: string) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i += 1) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}

export async function createSession() {
  const expires = Math.floor(Date.now() / 1000) + WEEK_SECONDS;
  return { token: `${expires}.${await hmac(String(expires))}`, maxAge: WEEK_SECONDS };
}

export async function validSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature || Number(expires) < Date.now() / 1000) return false;
  try {
    return sameText(signature, await hmac(expires));
  } catch (error) {
    console.error('[auth]', error instanceof Error ? error.message : error);
    return false;
  }
}

/** Compares signatures, so the time taken reveals nothing about the password. */
export async function passwordMatches(given: string): Promise<boolean> {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return false;
  return sameText(await hmac(`password:${given}`), await hmac(`password:${expected}`));
}
