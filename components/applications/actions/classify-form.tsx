'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { classifyApplication } from '@/app/actions/classify-application';

type ReviewerOption = { id: string; name: string; email: string };
type Track = 'EXEMPTED' | 'EXPEDITED' | 'FULL_BOARD';

export function ClassifyForm({ applicationId, reviewers }: { applicationId: string; reviewers: ReviewerOption[] }) {
  const router = useRouter();
  const [track, setTrack] = useState<Track>('EXEMPTED');
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleReviewer(reviewerId: string) {
    setSelectedReviewers((current) =>
      current.includes(reviewerId) ? current.filter((id) => id !== reviewerId) : [...current, reviewerId],
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await classifyApplication({
      applicationId,
      track,
      notes: notes || undefined,
      reviewerIds: track === 'EXPEDITED' ? selectedReviewers : undefined,
    });

    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="card">
      <h2>Klasifikasi Aplikasi</h2>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="track">Jalur</label>
          <select id="track" value={track} onChange={(e) => setTrack(e.target.value as Track)}>
            <option value="EXEMPTED">Exempted</option>
            <option value="EXPEDITED">Expedited</option>
            <option value="FULL_BOARD">Full Board</option>
          </select>
        </div>

        {track === 'EXPEDITED' && (
          <div className="field">
            <label>Tim Penelaah</label>
            {reviewers.length === 0 && <p>Tidak ada akun Tim Penelaah yang terdaftar.</p>}
            {reviewers.map((reviewer) => (
              <div className="checkbox-row" key={reviewer.id}>
                <input
                  type="checkbox"
                  id={`reviewer-${reviewer.id}`}
                  checked={selectedReviewers.includes(reviewer.id)}
                  onChange={() => toggleReviewer(reviewer.id)}
                />
                <label htmlFor={`reviewer-${reviewer.id}`}>
                  {reviewer.name} ({reviewer.email})
                </label>
              </div>
            ))}
          </div>
        )}

        <div className="field">
          <label htmlFor="notes">Catatan (opsional)</label>
          <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? 'Memproses...' : 'Simpan Klasifikasi'}
        </button>
      </form>
    </div>
  );
}
