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
  const [researchType, setResearchType] = useState<string>('Penelitian');
  const [customResearchType, setCustomResearchType] = useState<string>('');
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
        'proposalUrl',
        'saintekFormUrl',
        'soshumFormUrl',
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

      // Set researchType value
      if (researchType === 'Kegiatan Lainnya' && customResearchType.trim()) {
        formData.set('researchType', `Kegiatan Lainnya (${customResearchType.trim()})`);
      } else {
        formData.set('researchType', researchType);
      }

      // Helper check for uploaded file
      const hasFile = (val: FormDataEntryValue | null) => val instanceof File && val.size > 0;

      // Check all uploaded files for 25MB limit
      for (const [, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
          if (value.size > MAX_FILE_SIZE_BYTES) {
            setError(`Ukuran berkas "${value.name}" melebihi batas 25MB. Silakan kompres berkas terlebih dahulu.`);
            setIsSubmitting(false);
            topAlertRef.current?.scrollIntoView({ behavior: 'smooth' });
            return;
          }
        }
      }

      // Validate required documents (must have file OR valid URL)
      const hasProposal = hasFile(formData.get('proposal')) || Boolean(formData.get('proposalUrl'));
      if (!hasProposal) {
        setError('Proposal Penelitian wajib diunggah berkasnya atau dicantumkan tautan Google Drive / Cloud.');
        setIsSubmitting(false);
        topAlertRef.current?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (panelType === 'SAINTEK') {
        const hasSaintekForm = hasFile(formData.get('saintekForm')) || Boolean(formData.get('saintekFormUrl'));
        if (!hasSaintekForm) {
          setError('Formulir Aplikasi Saintek (Word) wajib diunggah berkasnya atau dicantumkan tautan Google Drive / Cloud.');
          setIsSubmitting(false);
          topAlertRef.current?.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      } else {
        const hasSoshumForm = hasFile(formData.get('soshumForm')) || Boolean(formData.get('soshumFormUrl'));
        if (!hasSoshumForm) {
          setError('Formulir Aplikasi Telaah Etik (Word) wajib diunggah berkasnya atau dicantumkan tautan Google Drive / Cloud.');
          setIsSubmitting(false);
          topAlertRef.current?.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }

      const hasLeaderStatement = hasFile(formData.get('leaderStatement')) || Boolean(formData.get('leaderStatementUrl'));
      if (!hasLeaderStatement) {
        setError('Formulir Pernyataan Ketua Peneliti wajib diunggah berkasnya atau dicantumkan tautan Google Drive / Cloud.');
        setIsSubmitting(false);
        topAlertRef.current?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      const hasConflict = hasFile(formData.get('conflictOfInterest')) || Boolean(formData.get('conflictOfInterestUrl'));
      if (!hasConflict) {
        setError('Formulir Pernyataan Konflik Kepentingan wajib diunggah berkasnya atau dicantumkan tautan Google Drive / Cloud.');
        setIsSubmitting(false);
        topAlertRef.current?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (panelType === 'SOSHUM') {
        const hasInstrument = hasFile(formData.get('researchInstrument')) || Boolean(formData.get('researchInstrumentUrl'));
        if (!hasInstrument) {
          setError('Instrumen Penelitian wajib diunggah berkasnya atau dicantumkan tautan Google Drive / Cloud.');
          setIsSubmitting(false);
          topAlertRef.current?.scrollIntoView({ behavior: 'smooth' });
          return;
        }
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
        {/* Section 1: Data Diri Pengusul */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-(--text) pb-2 border-b border-(--border)">
            Data Diri Pengusul (Personal Information)
          </h2>
          <p className="text-xs text-(--muted) mt-1.5 mb-4">
            Informasi identitas pengusul yang tercatat di sistem.
          </p>

          <div className="field">
            <label htmlFor="proposerName">
              Nama Pengusul / Ketua Peneliti / Kegiatan Ilmiah <span className="text-(--error)">*</span>
            </label>
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
            <label htmlFor="institution">
              Universitas / Institusi <span className="text-(--error)">*</span>
            </label>
            <input id="institution" name="institution" required defaultValue={institution} />
          </div>
        </div>

        {/* Section 2: Informasi Usulan */}
        <div className="mb-8 border-t border-(--border) pt-6">
          <h2 className="text-base font-bold text-(--text) pb-2 border-b border-(--border)">
            Informasi Usulan & Jenis Panel
          </h2>
          <p className="text-xs text-(--muted) mt-1.5 mb-4">
            Pilih jalur panel telaah dan tentukan rincian usulan penelitian/kegiatan.
          </p>

          <div className="field">
            <label htmlFor="panelType">
              Jenis Panel <span className="text-(--error)">*</span>
            </label>
            <select id="panelType" name="panelType" value={panelType} onChange={(e) => setPanelType(e.target.value as PanelType)}>
              <option value="SAINTEK">Panel Sains dan Teknologi</option>
              <option value="SOSHUM">Panel Sosial dan Humaniora</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="researchType">
              Jenis Penelitian / Kegiatan <span className="text-(--error)">*</span>
            </label>
            <select
              id="researchType"
              name="researchType"
              value={researchType}
              onChange={(e) => setResearchType(e.target.value)}
              required
            >
              <option value="Penelitian">Penelitian (Research)</option>
              <option value="Pelatihan">Pelatihan (Training)</option>
              <option value="Kegiatan Lainnya">Kegiatan Lainnya (Other Activity)</option>
            </select>
            <span className="text-[0.7rem] text-(--muted) mt-1 block">
              Pilih kategori kegiatan yang akan diajukan telaah etik.
            </span>
          </div>

          {researchType === 'Kegiatan Lainnya' && (
            <div className="field">
              <label htmlFor="customResearchType">Keterangan Kegiatan Lainnya (opsional)</label>
              <input
                id="customResearchType"
                name="customResearchType"
                value={customResearchType}
                onChange={(e) => setCustomResearchType(e.target.value)}
                placeholder="Contoh: Pengabdian Masyarakat, Pengujian Laboratorium, dll."
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="title">
              Judul {researchType === 'Pelatihan' ? 'Pelatihan' : researchType === 'Kegiatan Lainnya' ? 'Kegiatan' : 'Penelitian'} <span className="text-(--error)">*</span>
            </label>
            <input
              id="title"
              name="title"
              required
              placeholder={`Masukkan judul lengkap ${researchType === 'Pelatihan' ? 'pelatihan' : researchType === 'Kegiatan Lainnya' ? 'kegiatan' : 'usulan penelitian'}`}
            />
          </div>
        </div>

        {/* Section 3: Kelengkapan Panel */}
        <div className="border-t border-(--border) pt-6">
          <h2 className="text-base font-bold text-(--text) pb-2 border-b border-(--border)">
            Kelengkapan {panelType === 'SAINTEK' ? 'Panel Sains dan Teknologi' : 'Panel Sosial dan Humaniora'}
          </h2>
          <p className="text-xs text-(--muted) mt-1.5 mb-5">
            Lengkapi berkas persyaratan berikut. Anda dapat <strong>mengunggah berkas secara langsung</strong> (PDF/Word, maks. 25 MB) atau mencantumkan tautan Google Drive / Cloud storage jika berkas berukuran besar.
          </p>

          {/* 1. Proposal (Wajib untuk SAINTEK & SOSHUM) */}
          <div className="field rounded-xl border border-(--border) bg-(--surface) p-4 mb-4">
            <label htmlFor="proposal" className="text-sm font-semibold text-(--text) flex items-center justify-between">
              <span>1. Proposal Penelitian <span className="text-(--error)">*</span></span>
              <span className="text-[0.7rem] text-(--muted) font-normal">Wajib (.pdf / .doc / .docx)</span>
            </label>
            <div className="mt-2 space-y-2">
              <input
                id="proposal"
                name="proposal"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <input
                id="proposalUrl"
                name="proposalUrl"
                type="text"
                placeholder="Atau tautan Google Drive / Cloud (opsional jika berkas sudah diunggah)"
                onBlur={(e) => {
                  if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
                }}
              />
            </div>
          </div>

          {/* 2. Form Aplikasi (Word) (Wajib untuk SAINTEK & SOSHUM) */}
          {panelType === 'SAINTEK' ? (
            <div className="field rounded-xl border border-(--border) bg-(--surface) p-4 mb-4">
              <label htmlFor="saintekForm" className="text-sm font-semibold text-(--text) flex items-center justify-between">
                <span>2. Form Aplikasi (Word) <span className="text-(--error)">*</span></span>
                <span className="text-[0.7rem] text-(--muted) font-normal">Wajib (.doc / .docx / .pdf)</span>
              </label>
              <div className="mt-2 space-y-2">
                <input
                  id="saintekForm"
                  name="saintekForm"
                  type="file"
                  accept=".doc,.docx,.pdf"
                  onChange={handleFileChange}
                />
                <input
                  id="saintekFormUrl"
                  name="saintekFormUrl"
                  type="text"
                  placeholder="Atau tautan Google Drive / Cloud (opsional jika berkas sudah diunggah)"
                  onBlur={(e) => {
                    if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="field rounded-xl border border-(--border) bg-(--surface) p-4 mb-4">
              <label htmlFor="soshumForm" className="text-sm font-semibold text-(--text) flex items-center justify-between">
                <span>2. Form Aplikasi (Word) <span className="text-(--error)">*</span></span>
                <span className="text-[0.7rem] text-(--muted) font-normal">Wajib (.doc / .docx / .pdf)</span>
              </label>
              <div className="mt-2 space-y-2">
                <input
                  id="soshumForm"
                  name="soshumForm"
                  type="file"
                  accept=".doc,.docx,.pdf"
                  onChange={handleFileChange}
                />
                <input
                  id="soshumFormUrl"
                  name="soshumFormUrl"
                  type="text"
                  placeholder="Atau tautan Google Drive / Cloud (opsional jika berkas sudah diunggah)"
                  onBlur={(e) => {
                    if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
                  }}
                />
              </div>
            </div>
          )}

          {/* 3. Formulir Pernyataan Ketua (Wajib untuk SAINTEK & SOSHUM) */}
          <div className="field rounded-xl border border-(--border) bg-(--surface) p-4 mb-4">
            <label htmlFor="leaderStatement" className="text-sm font-semibold text-(--text) flex items-center justify-between">
              <span>3. Formulir Pernyataan Ketua Peneliti / Kegiatan Ilmiah <span className="text-(--error)">*</span></span>
              <span className="text-[0.7rem] text-(--muted) font-normal">Wajib (.pdf / .doc / .docx)</span>
            </label>
            <div className="mt-2 space-y-2">
              <input
                id="leaderStatement"
                name="leaderStatement"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <input
                id="leaderStatementUrl"
                name="leaderStatementUrl"
                type="text"
                placeholder="Atau tautan Google Drive / Cloud (opsional jika berkas sudah diunggah)"
                onBlur={(e) => {
                  if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
                }}
              />
            </div>
          </div>

          {/* 4. Formulir Pernyataan Ketua Peneliti terkait Konflik kepentingan (Wajib untuk SAINTEK & SOSHUM) */}
          <div className="field rounded-xl border border-(--border) bg-(--surface) p-4 mb-4">
            <label htmlFor="conflictOfInterest" className="text-sm font-semibold text-(--text) flex items-center justify-between">
              <span>4. Formulir Pernyataan Ketua Peneliti terkait Konflik Kepentingan <span className="text-(--error)">*</span></span>
              <span className="text-[0.7rem] text-(--muted) font-normal">Wajib (.pdf / .doc / .docx)</span>
            </label>
            <div className="mt-2 space-y-2">
              <input
                id="conflictOfInterest"
                name="conflictOfInterest"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <input
                id="conflictOfInterestUrl"
                name="conflictOfInterestUrl"
                type="text"
                placeholder="Atau tautan Google Drive / Cloud (opsional jika berkas sudah diunggah)"
                onBlur={(e) => {
                  if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
                }}
              />
            </div>
          </div>

          {/* SAINTEK Items 5 & 6 */}
          {panelType === 'SAINTEK' && (
            <>
              {/* 5. Dokumen Pendukung (opsional) */}
              <div className="field rounded-xl border border-(--border) bg-(--surface) p-4 mb-4">
                <label htmlFor="supportingDocuments" className="text-sm font-semibold text-(--text) flex items-center justify-between">
                  <span>5. Dokumen Pendukung (opsional)</span>
                  <span className="text-[0.7rem] text-(--muted) font-normal">Opsional (dapat lebih dari satu)</span>
                </label>
                <div className="mt-2 space-y-2">
                  <input
                    id="supportingDocuments"
                    name="supportingDocuments"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <input
                    id="supportingDocumentUrl"
                    name="supportingDocumentUrl"
                    type="text"
                    placeholder="Atau tautan Google Drive / Cloud (opsional)"
                    onBlur={(e) => {
                      if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
                    }}
                  />
                </div>
              </div>

              {/* 6. Informed Consent (opsional) */}
              <div className="field rounded-xl border border-(--border) bg-(--surface) p-4 mb-4">
                <label htmlFor="informedConsent" className="text-sm font-semibold text-(--text) flex items-center justify-between">
                  <span>6. Lembar Informed Consent (opsional)</span>
                  <span className="text-[0.7rem] text-(--muted) font-normal">Opsional (.pdf / .doc / .docx)</span>
                </label>
                <div className="mt-2 space-y-2">
                  <input
                    id="informedConsent"
                    name="informedConsent"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <input
                    id="informedConsentUrl"
                    name="informedConsentUrl"
                    type="text"
                    placeholder="Atau tautan Google Drive / Cloud (opsional)"
                    onBlur={(e) => {
                      if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* SOSHUM Items 5, 6, 7 */}
          {panelType === 'SOSHUM' && (
            <>
              {/* 5. Informed Consent (opsional) */}
              <div className="field rounded-xl border border-(--border) bg-(--surface) p-4 mb-4">
                <label htmlFor="informedConsent" className="text-sm font-semibold text-(--text) flex items-center justify-between">
                  <span>5. Lembar Informed Consent (opsional)</span>
                  <span className="text-[0.7rem] text-(--muted) font-normal">Opsional (.pdf / .doc / .docx)</span>
                </label>
                <div className="mt-2 space-y-2">
                  <input
                    id="informedConsent"
                    name="informedConsent"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <input
                    id="informedConsentUrl"
                    name="informedConsentUrl"
                    type="text"
                    placeholder="Atau tautan Google Drive / Cloud (opsional)"
                    onBlur={(e) => {
                      if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
                    }}
                  />
                </div>
              </div>

              {/* 6. Dokumen Pendukung (opsional) */}
              <div className="field rounded-xl border border-(--border) bg-(--surface) p-4 mb-4">
                <label htmlFor="supportingDocuments" className="text-sm font-semibold text-(--text) flex items-center justify-between">
                  <span>6. Dokumen Pendukung (opsional)</span>
                  <span className="text-[0.7rem] text-(--muted) font-normal">Opsional (dapat lebih dari satu)</span>
                </label>
                <div className="mt-2 space-y-2">
                  <input
                    id="supportingDocuments"
                    name="supportingDocuments"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <input
                    id="supportingDocumentUrl"
                    name="supportingDocumentUrl"
                    type="text"
                    placeholder="Atau tautan Google Drive / Cloud (opsional)"
                    onBlur={(e) => {
                      if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
                    }}
                  />
                </div>
              </div>

              {/* 7. Instrumen Penelitian (Wajib untuk SOSHUM) */}
              <div className="field rounded-xl border border-(--border) bg-(--surface) p-4 mb-4">
                <label htmlFor="researchInstrument" className="text-sm font-semibold text-(--text) flex items-center justify-between">
                  <span>7. Instrumen Penelitian <span className="text-(--error)">*</span></span>
                  <span className="text-[0.7rem] text-(--muted) font-normal">Wajib (.pdf / .doc / .docx)</span>
                </label>
                <div className="mt-2 space-y-2">
                  <input
                    id="researchInstrument"
                    name="researchInstrument"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <input
                    id="researchInstrumentUrl"
                    name="researchInstrumentUrl"
                    type="text"
                    placeholder="Atau tautan Google Drive / Cloud (opsional jika berkas sudah diunggah)"
                    onBlur={(e) => {
                      if (e.target.value.trim()) e.target.value = autoPrefixUrl(e.target.value);
                    }}
                  />
                </div>
              </div>
            </>
          )}
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
