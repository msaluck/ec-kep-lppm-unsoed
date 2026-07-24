'use client';

import { useState, type FormEvent } from 'react';
import { changePassword } from '@/app/actions/change-password';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const result = await changePassword({ currentPassword, newPassword });

    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
  }

  return (
    <div className="card">
      <h2>Ubah Kata Sandi</h2>
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">Kata sandi berhasil diubah.</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="currentPassword">Kata Sandi Saat Ini</label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="newPassword">Kata Sandi Baru</label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Ubah Kata Sandi'}
        </button>
      </form>
    </div>
  );
}
