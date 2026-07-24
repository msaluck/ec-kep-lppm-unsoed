'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createUser } from '@/app/actions/create-user';

type Role = 'SECRETARIAT' | 'CHAIRMAN' | 'REVIEWER' | 'ADMIN' | 'RESEARCHER';

export function CreateUserForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('SECRETARIAT');
  const [institution, setInstitution] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await createUser({
      name,
      email,
      role,
      institution: institution || undefined,
      phone: phone || undefined,
    });

    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setTemporaryPassword(result.temporaryPassword);
  }

  if (temporaryPassword) {
    return (
      <div className="card">
        <h2>Pengguna Berhasil Dibuat</h2>
        <p>
          Kata sandi sementara untuk <strong>{email}</strong> (tampil sekali saja, catat sekarang):
        </p>
        <p>
          <code>{temporaryPassword}</code>
        </p>
        <button type="button" className="btn" onClick={() => router.push('/admin/users')}>
          Kembali ke Daftar Pengguna
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Nama Lengkap</label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="role">Peran</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="SECRETARIAT">Sekretariat</option>
            <option value="CHAIRMAN">Ketua/Sekretaris KEP</option>
            <option value="REVIEWER">Tim Penelaah</option>
            <option value="ADMIN">Admin</option>
            <option value="RESEARCHER">Peneliti</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="institution">Institusi</label>
          <input id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="phone">No. Telepon</label>
          <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? 'Membuat...' : 'Buat Pengguna'}
        </button>
      </form>
    </div>
  );
}
