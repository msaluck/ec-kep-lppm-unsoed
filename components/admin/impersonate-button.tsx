'use client';

import { useState } from 'react';

export function ImpersonateButton({
  targetUserId,
  targetUserName,
  targetUserRole,
}: {
  targetUserId: string;
  targetUserName: string;
  targetUserRole: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleImpersonate() {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin masuk (impersonate) sebagai "${targetUserName}" (${targetUserRole})?`,
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'impersonate', targetUserId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal melakukan impersonasi.');
        setIsLoading(false);
        return;
      }
      window.location.href = data.redirectUrl || '/';
    } catch (err) {
      console.error(err);
      alert('Terjadi kendala saat melakukan impersonasi.');
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleImpersonate}
      disabled={isLoading}
      className="btn secondary text-xs py-1 px-2.5 inline-flex items-center gap-1.5 cursor-pointer font-medium"
      title={`Masuk sebagai ${targetUserName} (${targetUserRole})`}
    >
      <span className="text-sm">👤</span>
      <span>{isLoading ? 'Masuk...' : 'Impersonate'}</span>
    </button>
  );
}
