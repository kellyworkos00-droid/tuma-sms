'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { Mark } from '@/components/Illustrations';
import { BRAND } from '@/lib/brand';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      if (response.ok) { window.location.assign('/app'); return; }
      setError(((await response.json()) as { error?: string }).error ?? 'We could not sign you in.');
    } catch {
      setError('Check your connection and try again.');
    }
    setBusy(false);
  };

  return (
    <main className="login">
      <form className="login-card" onSubmit={(event) => void submit(event)}>
        <Link href="/" className="brand"><Mark /><span>{BRAND.name}</span></Link>
        <h1>Welcome back</h1>
        {error ? <p className="alert alert-bad" role="alert">{error}</p> : null}
        <label className="field"><span>Password</span>
          <input type="password" autoComplete="current-password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button className="btn btn-primary btn-wide" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  );
}
