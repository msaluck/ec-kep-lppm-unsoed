'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { completePlenaryMeeting } from '@/app/actions/complete-plenary-meeting';

export function CompleteMeetingForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [minutesNotes, setMinutesNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await completePlenaryMeeting({ applicationId, minutesNotes: minutesNotes || undefined });

    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="card">
      <h2>Catat Hasil Rapat Pleno</h2>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="minutesNotes">Notulen / Hasil Klarifikasi</label>
          <textarea id="minutesNotes" rows={4} value={minutesNotes} onChange={(e) => setMinutesNotes(e.target.value)} />
        </div>
        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Selesaikan Rapat & Lanjutkan ke Keputusan Akhir'}
        </button>
      </form>
    </div>
  );
}
