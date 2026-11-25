'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export function ImpersonationBanner() {
  const { data: session } = useSession();
  const [isStopping, setIsStopping] = useState(false);

  if (!session?.user?.impersonator) {
    return null;
  }

  async function handleStop() {
    setIsStopping(true);
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        window.location.href = '/admin/users';
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghentikan impersonasi.');
      setIsStopping(false);
    }
  }

  return (
    <aside
      aria-label="Notifikasi Mode Impersonasi"
      className="bg-amber-400 text-slate-900 px-4 py-2 text-xs sm:text-sm font-medium shadow-sm flex items-center justify-between gap-3 sticky top-0 z-50 border-b border-amber-500"
    >
      <div className="flex items-center gap-2">
        <span className="text-base">⚠️</span>
        <span>
          <strong>Mode Impersonasi:</strong> Mengakses sebagai <strong>{session.user.name}</strong> ({session.user.role}) via Admin {session.user.impersonator.name}.
        </span>
      </div>
      <button
        type="button"
        onClick={handleStop}
        disabled={isStopping}
        className="shrink-0 bg-slate-900 text-white hover:bg-slate-800 px-3 py-1 rounded-md font-semibold text-xs shadow-xs transition-colors cursor-pointer"
      >
        {isStopping ? 'Mengalihkan...' : 'Kembali ke Admin'}
      </button>
    </aside>
  );
}
