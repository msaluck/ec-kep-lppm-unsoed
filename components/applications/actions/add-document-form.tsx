'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { addDocument } from '@/app/actions/add-document';

export function AddDocumentForm({ applicationId }: { applicationId: string }) {
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
    const result = await addDocument(formData);

    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    formRef.current.reset();
    router.refresh();
  }

  return (
    <div className="card">
      <h2>Tambah / Ganti Dokumen</h2>
      {error && <div className="alert error">{error}</div>}
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="documentType">Jenis Dokumen</label>
          <select id="documentType" name="documentType" defaultValue="SUPPORTING_DOCUMENT">
            <option value="RESEARCH_PROTOCOL">Protokol Penelitian</option>
            <option value="INFORMED_CONSENT">Informed Consent</option>
            <option value="CV_RESEARCHER">CV Peneliti</option>
            <option value="SUPPORTING_DOCUMENT">Dokumen Pendukung Lainnya</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="file">Berkas</label>
          <input id="file" name="file" type="file" required />
        </div>
        <button type="submit" className="btn secondary" disabled={isSubmitting}>
          {isSubmitting ? 'Mengunggah...' : 'Unggah Dokumen'}
        </button>
      </form>
    </div>
  );
}
