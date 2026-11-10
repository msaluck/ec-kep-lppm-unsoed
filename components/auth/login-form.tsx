'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

const ROLE_HOME_PATH: Record<string, string> = {
  RESEARCHER: '/applications',
  SECRETARIAT: '/secretariat/queue',
  CHAIRMAN: '/chairman/queue',
  REVIEWER: '/reviewer/assignments',
  ADMIN: '/admin/users',
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn('credentials', { email, password, redirect: false });

    setIsSubmitting(false);

    if (!result || result.error) {
      setError('Invalid email or password.');
      return;
    }

    const sessionResponse = await fetch('/api/auth/session');
    const session = await sessionResponse.json();
    const role = session?.user?.role as string | undefined;

    router.push((role && ROLE_HOME_PATH[role]) || '/');
    router.refresh();
  }

  return (
    <main id="main-content" className="auth-shell">
      <div className="auth-card">
        <h1>Masuk ke EC-KEP</h1>
        <p className="subtitle">Komisi Etik Penelitian - LPPM Universitas Jenderal Soedirman</p>

        {justRegistered && !error && (
          <div className="alert success">Pendaftaran berhasil. Silakan masuk dengan akun Anda.</div>
        )}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Kata Sandi</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="auth-switch">
          Belum punya akun (Peneliti)? <Link href="/register">Daftar di sini</Link>
        </p>

        <div className="mt-4 pt-4 border-t border-(--border) text-center">
          <Link href="/" className="text-xs text-(--muted) hover:text-(--text) no-underline transition-colors">
            ← Kembali ke Beranda Utama
          </Link>
        </div>
      </div>
    </main>
  );
}
