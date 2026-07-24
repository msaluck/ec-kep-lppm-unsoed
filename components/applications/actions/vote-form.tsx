'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitReviewVote } from '@/app/actions/submit-review-vote';

export function VoteForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<'AGREE' | 'DISAGREE' | null>(null);

  async function handleVote(vote: 'AGREE' | 'DISAGREE') {
    setError(null);
    setIsSubmitting(vote);
    const result = await submitReviewVote({ applicationId, vote, comments: comments || undefined });
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
      <h2>Telaah Aplikasi</h2>
      {error && <div className="alert error">{error}</div>}
      <div className="field">
        <label htmlFor="comments">Komentar (opsional)</label>
        <textarea id="comments" rows={3} value={comments} onChange={(e) => setComments(e.target.value)} />
      </div>
      <div className="action-row">
        <button type="button" className="btn" disabled={busy} onClick={() => handleVote('AGREE')}>
          {isSubmitting === 'AGREE' ? 'Memproses...' : 'Sepakat'}
        </button>
        <button type="button" className="btn danger" disabled={busy} onClick={() => handleVote('DISAGREE')}>
          {isSubmitting === 'DISAGREE' ? 'Memproses...' : 'Tidak Sepakat'}
        </button>
      </div>
    </div>
  );
}
