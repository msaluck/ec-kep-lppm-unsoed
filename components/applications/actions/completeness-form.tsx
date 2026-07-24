'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { reviewCompleteness } from '@/app/actions/review-completeness';

export function CompletenessForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleDecision(event: FormEvent, decision: 'COMPLETE' | 'INCOMPLETE') {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await reviewCompleteness({ applicationId, decision, notes: notes || undefined });

    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="card">
      <h2>Pemeriksaan Kelengkapan Berkas</h2>
      {error && <div className="alert error">{error}</div>}
      <form>
        <div className="field">
          <label htmlFor="notes">Catatan (wajib jika tidak lengkap)</label>
          <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="action-row">
          <button type="button" className="btn" disabled={isSubmitting} onClick={(e) => handleDecision(e, 'COMPLETE')}>
            Berkas Lengkap
          </button>
          <button
            type="button"
            className="btn danger"
            disabled={isSubmitting}
            onClick={(e) => handleDecision(e, 'INCOMPLETE')}
          >
            Berkas Tidak Lengkap
          </button>
        </div>
      </form>
    </div>
  );
}
