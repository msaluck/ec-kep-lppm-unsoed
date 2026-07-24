'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { approveExemption } from '@/app/actions/approve-exemption';

export function ExemptionApprovalForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await approveExemption({ applicationId, decisionNotes: notes || undefined });

    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="card">
      <h2>Persetujuan Surat Keterangan Bebas Kaji Etik</h2>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="notes">Catatan (opsional)</label>
          <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? 'Memproses...' : 'Terbitkan Surat & Setujui'}
        </button>
      </form>
    </div>
  );
}
