'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { submitApplication } from '@/app/actions/submit-application';

type PanelType = 'SAINTEK' | 'SOSHUM';

type NewApplicationFormProps = {
  proposerName: string;
  email: string;
  phone: string;
  institution: string;
};

export function NewApplicationForm({ proposerName, email, phone, institution }: NewApplicationFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [panelType, setPanelType] = useState<PanelType>('SAINTEK');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;

    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(formRef.current);
    const result = await submitApplication(formData);

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(`/applications/${result.applicationId}`);
  }

  return (
    <div className="card">
      {error && <div className="alert error">{error}</div>}

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="panelType">Jenis Panel</label>
          <select id="panelType" name="panelType" value={panelType} onChange={(e) => setPanelType(e.target.value as PanelType)}>
            <option value="SAINTEK">Panel Sains dan Teknologi</option>
            <option value="SOSHUM">Panel Sosial dan Humaniora</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="title">Judul Penelitian</label>
          <input id="title" name="title" required />
        </div>
        <div className="field">
          <label htmlFor="researchType">Jenis Penelitian</label>
          <input id="researchType" name="researchType" placeholder="Contoh: Klinis, Observasional, dll." />
        </div>
        <div className="field">
          <label htmlFor="researchProtocol">Protokol Penelitian (PP) - wajib</label>
          <input id="researchProtocol" name="researchProtocol" type="file" required />
        </div>
        <div className="field">
          <label htmlFor="informedConsent">Informed Consent (opsional)</label>
          <input id="informedConsent" name="informedConsent" type="file" />
        </div>
        <div className="field">
          <label htmlFor="cvResearcher">CV Peneliti (opsional)</label>
          <input id="cvResearcher" name="cvResearcher" type="file" />
        </div>
        <div className="field">
          <label htmlFor="supportingDocuments">Dokumen Pendukung Lainnya (opsional, dapat lebih dari satu)</label>
          <input id="supportingDocuments" name="supportingDocuments" type="file" multiple />
        </div>

        <h2 style={{ marginTop: 24 }}>
          Kelengkapan {panelType === 'SAINTEK' ? 'Panel Sains dan Teknologi' : 'Panel Sosial dan Humaniora'}
        </h2>

        <div className="field">
          <label htmlFor="proposerName">Nama Pengusul/Ketua Peneliti/Kegiatan Ilmiah</label>
          <input id="proposerName" name="proposerName" required defaultValue={proposerName} />
        </div>
        <div className="field">
          <label htmlFor="email">Alamat Email</label>
          <input id="email" value={email} disabled />
        </div>
        <div className="field">
          <label htmlFor="phone">No. HP (WhatsApp)</label>
          <input id="phone" value={phone} disabled placeholder={phone ? undefined : 'Belum diisi di Profil'} />
        </div>
        <div className="field">
          <label htmlFor="institution">Universitas/Institusi</label>
          <input id="institution" name="institution" required defaultValue={institution} />
        </div>

        {panelType === 'SAINTEK' ? (
          <div className="field">
            <label htmlFor="saintekFormUrl">Formulir Aplikasi Saintek (Word) - tautan (mis. Google Drive)</label>
            <input id="saintekFormUrl" name="saintekFormUrl" type="url" required placeholder="https://drive.google.com/..." />
          </div>
        ) : (
          <div className="field">
            <label htmlFor="soshumFormUrl">Formulir Aplikasi Telaah Etik (Word) - tautan (mis. Google Drive)</label>
            <input id="soshumFormUrl" name="soshumFormUrl" type="url" required placeholder="https://drive.google.com/..." />
          </div>
        )}

        <div className="field">
          <label htmlFor="proposalUrl">Proposal Penelitian (Pdf) - tautan</label>
          <input id="proposalUrl" name="proposalUrl" type="url" required placeholder="https://drive.google.com/..." />
        </div>
        <div className="field">
          <label htmlFor="leaderStatementUrl">Formulir Pernyataan Ketua Peneliti/Kegiatan Ilmiah (Pdf) - tautan</label>
          <input id="leaderStatementUrl" name="leaderStatementUrl" type="url" required placeholder="https://drive.google.com/..." />
        </div>
        <div className="field">
          <label htmlFor="conflictOfInterestUrl">
            Formulir Pernyataan Ketua Peneliti/Kegiatan Ilmiah terkait Konflik Kepentingan (Pdf) - tautan
          </label>
          <input
            id="conflictOfInterestUrl"
            name="conflictOfInterestUrl"
            type="url"
            required
            placeholder="https://drive.google.com/..."
          />
        </div>

        {panelType === 'SOSHUM' && (
          <>
            <div className="field">
              <label htmlFor="informedConsentUrl">Lembar Informed Consent (Pdf) - tautan</label>
              <input id="informedConsentUrl" name="informedConsentUrl" type="url" required placeholder="https://drive.google.com/..." />
            </div>
            <div className="field">
              <label htmlFor="researchInstrumentUrl">Instrumen Penelitian - tautan</label>
              <input
                id="researchInstrumentUrl"
                name="researchInstrumentUrl"
                type="url"
                required
                placeholder="https://drive.google.com/..."
              />
            </div>
          </>
        )}

        <div className="field">
          <label htmlFor="supportingDocumentUrl">Dokumen Pendukung (Apabila diperlukan, Pdf) - tautan (opsional)</label>
          <input id="supportingDocumentUrl" name="supportingDocumentUrl" type="url" placeholder="https://drive.google.com/..." />
        </div>

        <button type="submit" className="btn" disabled={isSubmitting} style={{ marginTop: 16 }}>
          {isSubmitting ? 'Mengirim...' : 'Ajukan Aplikasi'}
        </button>
      </form>
    </div>
  );
}
