'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { resubmitRevision } from '@/app/actions/resubmit-revision';

export function ResubmitRevisionForm({ applicationId, round }: { applicationId: string; round: number }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;

    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(formRef.current);
    formData.set('applicationId', applicationId);
    const result = await resubmitRevision(formData);

    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="card">
      <h2>Ajukan Ulang Dokumen Revisi {round}</h2>
      {error && <div className="alert error">{error}</div>}
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="revisedProtocol">Protokol Penelitian yang Direvisi - wajib</label>
          <input id="revisedProtocol" name="revisedProtocol" type="file" required />
        </div>
        <div className="field">
          <label htmlFor="supportingDocuments">Dokumen Pendukung Lainnya (opsional)</label>
          <input id="supportingDocuments" name="supportingDocuments" type="file" multiple />
        </div>
        <div className="field">
          <label htmlFor="responseNotes">Ringkasan Perbaikan (opsional)</label>
          <textarea id="responseNotes" name="responseNotes" rows={3} />
        </div>
        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? 'Mengirim...' : 'Kirim Revisi'}
        </button>
      </form>
    </div>
  );
}
