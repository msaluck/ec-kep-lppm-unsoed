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

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

function autoPrefixUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function NewApplicationForm({ proposerName, email, phone, institution }: NewApplicationFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const topAlertRef = useRef<HTMLDivElement>(null);
  const [panelType, setPanelType] = useState<PanelType>('SAINTEK');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(
          `Ukuran berkas "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) melebihi batas 25MB. Harap kompres berkas PDF Anda terlebih dahulu.`,
        );
        event.target.value = '';
        topAlertRef.current?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(formRef.current);

      // Pre-normalize URL fields in FormData before sending to server action
      const urlFields = [
        'saintekFormUrl',
        'soshumFormUrl',
        'proposalUrl',
        'leaderStatementUrl',
        'conflictOfInterestUrl',
        'informedConsentUrl',
        'researchInstrumentUrl',
        'supportingDocumentUrl',
      ];
      for (const field of urlFields) {
        const val = formData.get(field);
        if (typeof val === 'string' && val.trim().length > 0) {
          formData.set(field, autoPrefixUrl(val));
        }
      }

      // Check protocol file existence and size
      const protocol = formData.get('researchProtocol') as File | null;
      if (!protocol || !(protocol instanceof File) || protocol.size === 0) {
        setError('Berkas Protokol Penelitian (PP) wajib diunggah.');
        setIsSubmitting(false);
        topAlertRef.current?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (protocol.size > MAX_FILE_SIZE_BYTES) {
        setError('Ukuran berkas Protokol Penelitian melebihi 25MB. Silakan kompres berkas terlebih dahulu.');
        setIsSubmitting(false);
        topAlertRef.current?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      const result = await submitApplication(formData);

      if (!result.success) {
        setError(result.error);
        setIsSubmitting(false);
        topAlertRef.current?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // Show immediate positive feedback before redirecting
      setSuccessMessage('Pengajuan berhasil! Mengalihkan ke halaman detail aplikasi Anda...');
      router.push(`/applications/${result.applicationId}?submitted=1`);
    } catch (err) {
      console.error('Submission error:', err);
      setError(
        err instanceof Error
          ? `Gagal mengirim pengajuan: ${err.message}`
          : 'Terjadi kendala saat mengirim pengajuan. Silakan periksa koneksi internet Anda dan coba lagi.',
      );
      setIsSubmitting(false);
      topAlertRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <div className="card">
      <div ref={topAlertRef}>
        {error && <div className="alert error mb-4">{error}</div>}
        {successMessage && <div className="alert success mb-4">{successMessage}</div>}
      </div>

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
          <input id="title" name="title" required placeholder="Masukkan judul lengkap usulan penelitian" />
        </div>
        <div className="field">
          <label htmlFor="researchType">Jenis Penelitian</label>
          <input id="researchType" name="researchType" placeholder="Contoh: Klinis, Observasional, Eksperimen Hewan, Survei, dll." />
        </div>
        <div className="field">
          <label htmlFor="researchProtocol">Protokol Penelitian (PP) - wajib (.pdf)</label>
          <input
            id="researchProtocol"
            name="researchProtocol"
            type="file"
            accept=".pdf,.doc,.docx"
            required
            onChange={handleFileChange}
          />
          <span className="text-[0.7rem] text-(--muted) mt-1 block">Format PDF disarankan (maks. 25 MB).</span>
        </div>
        <div className="field">
          <label htmlFor="informedConsent">Informed Consent (opsional)</label>
          <input id="informedConsent" name="informedConsent" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
        </div>
        <div className="field">
          <label htmlFor="cvResearcher">CV Peneliti (opsional)</label>
          <input id="cvResearcher" name="cvResearcher" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
        </div>
        <div className="field">
          <label htmlFor="supportingDocuments">Dokumen Pendukung Lainnya (opsional, dapat lebih dari satu)</label>
          <input id="supportingDocuments" name="supportingDocuments" type="file" multiple onChange={handleFileChange} />
        </div>

        <h2 className="mt-6 mb-3 border-t border-(--border) pt-6 text-base font-bold text-(--text)">
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
            <input
              id="saintekFormUrl"
              name="saintekFormUrl"
              type="text"
              required
              placeholder="https://drive.google.com/..."
              onBlur={(e) => {
                if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
              }}
            />
          </div>
        ) : (
          <div className="field">
            <label htmlFor="soshumFormUrl">Formulir Aplikasi Telaah Etik (Word) - tautan (mis. Google Drive)</label>
            <input
              id="soshumFormUrl"
              name="soshumFormUrl"
              type="text"
              required
              placeholder="https://drive.google.com/..."
              onBlur={(e) => {
                if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
              }}
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="proposalUrl">Proposal Penelitian (Pdf) - tautan</label>
          <input
            id="proposalUrl"
            name="proposalUrl"
            type="text"
            required
            placeholder="https://drive.google.com/..."
            onBlur={(e) => {
              if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="leaderStatementUrl">Formulir Pernyataan Ketua Peneliti/Kegiatan Ilmiah (Pdf) - tautan</label>
          <input
            id="leaderStatementUrl"
            name="leaderStatementUrl"
            type="text"
            required
            placeholder="https://drive.google.com/..."
            onBlur={(e) => {
              if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="conflictOfInterestUrl">
            Formulir Pernyataan Ketua Peneliti/Kegiatan Ilmiah terkait Konflik Kepentingan (Pdf) - tautan
          </label>
          <input
            id="conflictOfInterestUrl"
            name="conflictOfInterestUrl"
            type="text"
            required
            placeholder="https://drive.google.com/..."
            onBlur={(e) => {
              if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
            }}
          />
        </div>

        {panelType === 'SOSHUM' && (
          <>
            <div className="field">
              <label htmlFor="informedConsentUrl">Lembar Informed Consent (Pdf) - tautan</label>
              <input
                id="informedConsentUrl"
                name="informedConsentUrl"
                type="text"
                required
                placeholder="https://drive.google.com/..."
                onBlur={(e) => {
                  if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
                }}
              />
            </div>
            <div className="field">
              <label htmlFor="researchInstrumentUrl">Instrumen Penelitian - tautan</label>
              <input
                id="researchInstrumentUrl"
                name="researchInstrumentUrl"
                type="text"
                required
                placeholder="https://drive.google.com/..."
                onBlur={(e) => {
                  if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
                }}
              />
            </div>
          </>
        )}

        <div className="field">
          <label htmlFor="supportingDocumentUrl">Dokumen Pendukung (Apabila diperlukan, Pdf) - tautan (opsional)</label>
          <input
            id="supportingDocumentUrl"
            name="supportingDocumentUrl"
            type="text"
            placeholder="https://drive.google.com/..."
            onBlur={(e) => {
              if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
            }}
          />
        </div>

        {/* Bottom Error & Success Notification (Visible right above submit button) */}
        {error && <div className="alert error mt-4 mb-2">{error}</div>}
        {successMessage && <div className="alert success mt-4 mb-2">{successMessage}</div>}

        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            type="submit"
            className="btn w-full sm:w-auto"
            disabled={isSubmitting || Boolean(successMessage)}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Sedang Mengunggah & Mengirim...
              </span>
            ) : successMessage ? (
              '✓ Berhasil Dikirim'
            ) : (
              'Ajukan Aplikasi'
            )}
          </button>

          <span className="text-xs text-(--muted)">
            Pastikan seluruh dokumen wajib telah lengkap sebelum menekan tombol pengajuan.
          </span>
        </div>
      </form>
    </div>
  );
}
