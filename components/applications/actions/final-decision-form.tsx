'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveApplication } from '@/app/actions/approve-application';
import { decideFinalOutcome } from '@/app/actions/decide-final-outcome';

export function FinalDecisionForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<'APPROVE' | 'REVISION' | 'REJECT' | null>(null);

  async function handleApprove() {
    setError(null);
    setIsSubmitting('APPROVE');
    const result = await approveApplication({ applicationId, decisionNotes: notes || undefined });
    setIsSubmitting(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleRevisionOrReject(decisionType: 'REVISION_NEEDED' | 'REJECTED') {
    if (!notes.trim()) {
      setError('Catatan wajib diisi untuk keputusan ini.');
      return;
    }
    setError(null);
    setIsSubmitting(decisionType === 'REVISION_NEEDED' ? 'REVISION' : 'REJECT');
    const result = await decideFinalOutcome({ applicationId, decisionType, decisionNotes: notes });
    setIsSubmitting(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  const busy = isSubmitting !== null;

  return (
    <div className="card">
      <h2>Keputusan Akhir</h2>
      {error && <div className="alert error">{error}</div>}
      <div className="field">
        <label htmlFor="notes">Catatan (wajib untuk Revisi / Tidak Disetujui)</label>
        <textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="action-row">
        <button type="button" className="btn" disabled={busy} onClick={handleApprove}>
          {isSubmitting === 'APPROVE' ? 'Memproses...' : 'Setujui (Persetujuan Etik)'}
        </button>
        <button
          type="button"
          className="btn secondary"
          disabled={busy}
          onClick={() => handleRevisionOrReject('REVISION_NEEDED')}
        >
          {isSubmitting === 'REVISION' ? 'Memproses...' : 'Perlu Revisi'}
        </button>
        <button
          type="button"
          className="btn danger"
          disabled={busy}
          onClick={() => handleRevisionOrReject('REJECTED')}
        >
          {isSubmitting === 'REJECT' ? 'Memproses...' : 'Tidak Disetujui'}
        </button>
      </div>
    </div>
  );
}
