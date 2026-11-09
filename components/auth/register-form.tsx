'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { registerResearcher } from '@/app/actions/register-researcher';

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await registerResearcher({
      name,
      email,
      password,
      institution: institution || undefined,
      phone: phone || undefined,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push('/login?registered=1');
  }

  return (
    <main id="main-content" className="auth-shell">
      <div className="auth-card">
        <h1>Daftar sebagai Peneliti</h1>
        <p className="subtitle">Pendaftaran akun Pengusul untuk pengajuan Kaji Etik Penelitian</p>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Nama Lengkap</label>
            <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
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
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="institution">Institusi</label>
            <input id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="phone">No. Telepon</label>
            <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <button type="submit" className="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="auth-switch">
          Sudah punya akun? <a href="/login">Masuk di sini</a>
        </p>
      </div>
    </main>
  );
}
