'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setUserActive } from '@/app/actions/set-user-active';
import { resetUserPassword } from '@/app/actions/reset-user-password';

export function UserDetailActions({
  userId,
  isActive,
  isSelf,
}: {
  userId: string;
  isActive: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleToggleActive() {
    setError(null);
    setIsSubmitting(true);
    const result = await setUserActive({ userId, isActive: !isActive });
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleResetPassword() {
    if (!confirm('Reset kata sandi pengguna ini?')) return;
    setError(null);
    setIsSubmitting(true);
    const result = await resetUserPassword({ userId });
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setTemporaryPassword(result.temporaryPassword);
  }

  return (
    <div className="card">
      <h2>Kelola Akun</h2>
      {error && <div className="alert error">{error}</div>}
      {temporaryPassword && (
        <div className="alert success">
          Kata sandi baru (tampil sekali saja, catat sekarang): <code>{temporaryPassword}</code>
        </div>
      )}
      <div className="action-row">
        <button type="button" className="btn secondary" disabled={isSubmitting} onClick={handleResetPassword}>
          Reset Kata Sandi
        </button>
        <button
          type="button"
          className={isActive ? 'btn danger' : 'btn'}
          disabled={isSubmitting || (isSelf && isActive)}
          onClick={handleToggleActive}
          title={isSelf && isActive ? 'Anda tidak dapat menonaktifkan akun sendiri' : undefined}
        >
          {isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
        </button>
      </div>
    </div>
  );
}
