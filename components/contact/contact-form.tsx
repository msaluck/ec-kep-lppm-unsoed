'use client';

import { useState, type FormEvent } from 'react';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [category, setCategory] = useState('DOKUMEN');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending message to secretariat
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 700);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-(--success) bg-(--success-bg) p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--success) text-(--accent-contrast) mb-3">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-(--success)">Pesan Anda Telah Terkirim</h3>
        <p className="mt-2 text-xs sm:text-sm text-(--success)/90 leading-relaxed max-w-md mx-auto">
          Terima kasih <strong>{name}</strong>. Pesan Anda mengenai kategori <strong>{category}</strong> telah kami terima.
          Sekretariat KEP LPPM Unsoed akan menghubungi Anda melalui email <strong>{email}</strong> pada hari dan jam kerja.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setName('');
            setEmail('');
            setInstitution('');
            setMessage('');
          }}
          className="mt-5 inline-flex items-center justify-center rounded-lg border border-(--success) bg-(--surface) px-4 py-2 text-xs font-semibold text-(--success) hover:bg-(--surface-hover) cursor-pointer"
        >
          Kirim Pesan Lainnya
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className="block text-xs font-semibold text-(--text) mb-1.5">
            Nama Lengkap <span className="text-(--error)">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Dr. Budi Santoso, M.Si."
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-xs font-semibold text-(--text) mb-1.5">
            Alamat Email Aktif <span className="text-(--error)">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@unsoed.ac.id"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-inst" className="block text-xs font-semibold text-(--text) mb-1.5">
            Universitas / Fakultas / Lembaga
          </label>
          <input
            id="contact-inst"
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Contoh: Fakultas Kedokteran Unsoed"
          />
        </div>

        <div>
          <label htmlFor="contact-category" className="block text-xs font-semibold text-(--text) mb-1.5">
            Kategori Pertanyaan <span className="text-(--error)">*</span>
          </label>
          <select
            id="contact-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="DOKUMEN">Kelengkapan Berkas & Format Dokumen</option>
            <option value="JALUR">Konsultasi Penentuan Jalur Telaah (Exempted/Expedited)</option>
            <option value="STATUS">Pengecekan Status Pengajuan Protokol</option>
            <option value="AKUN">Kendala Teknis Akun / Pendaftaran</option>
            <option value="LAINNYA">Pertanyaan / Saran Lainnya</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-xs font-semibold text-(--text) mb-1.5">
          Pesan / Pertanyaan Detail <span className="text-(--error)">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tuliskan pertanyaan atau kendala yang Anda hadapi secara rinci..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-semibold text-(--accent-contrast) hover:bg-(--accent-hover) transition-colors cursor-pointer disabled:opacity-60"
      >
        {isSubmitting ? 'Mengirim Pesan...' : 'Kirim Pesan ke Sekretariat'}
      </button>

      <p className="text-[0.7rem] text-(--muted) text-center mt-2">
        Sekretariat KEP akan merespons pesan Anda dalam 1–2 hari kerja melalui surel yang tercantum.
      </p>
    </form>
  );
}
