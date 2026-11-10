import Link from 'next/link';
import { PublicShell } from '@/components/layout/public-shell';
import { ContactForm } from '@/components/contact/contact-form';

export const metadata = {
  title: 'Hubungi Kami - EC-KEP LPPM Unsoed',
  description: 'Alamat sekretariat, jam operasional, dan saluran bantuan Komisi Etik Penelitian LPPM Universitas Jenderal Soedirman',
};

export default function KontakPage() {
  return (
    <PublicShell>
      {/* Page Header */}
      <section className="border-b border-(--border) bg-(--surface) py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-(--muted) mb-3">
            <Link href="/" className="hover:text-(--text) no-underline">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-(--accent) font-medium">Kontak & Bantuan</span>
          </nav>

          <h1 className="text-3xl font-extrabold tracking-tight text-(--text) sm:text-4xl">
            Hubungi Sekretariat KEP
          </h1>
          <p className="mt-2 text-base text-(--muted) max-w-2xl leading-relaxed">
            Butuh bantuan mengenai persyaratan berkas, konsultasi jalur telaah etik, atau tindak lanjut pengajuan protokol Anda? Kami siap membantu.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Contact Cards & Info */}
            <div className="lg:col-span-5 space-y-6">
              {/* Alamat Fisik */}
              <div className="rounded-xl border border-(--border) bg-(--surface) p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--accent-soft-bg) text-(--accent-soft-text)">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-(--text)">Lokasi Sekretariat</h2>
                </div>
                <p className="text-xs text-(--muted) leading-relaxed">
                  Gedung LPPM Universitas Jenderal Soedirman Lantai 1<br />
                  Jl. Prof. Dr. HR Boenyamin No. 708, Grendeng, Purwokerto Utara, Kabupaten Banyumas, Jawa Tengah 53122
                </p>
                <div className="mt-3 text-[0.7rem] text-(--muted) italic border-t border-(--border) pt-2">
                  * Ruang Layanan Administrasi KEP LPPM Unsoed
                </div>
              </div>

              {/* Surel & Telepon */}
              <div className="rounded-xl border border-(--border) bg-(--surface) p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--accent-soft-bg) text-(--accent-soft-text)">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-(--text)">Email & Kontak Resmi</h2>
                </div>
                <div className="space-y-2 text-xs text-(--muted)">
                  <div>
                    <span className="font-semibold text-(--text) block">Email Sekretariat:</span>
                    <a href="mailto:kep@unsoed.ac.id" className="text-(--accent) hover:underline">
                      kep@unsoed.ac.id
                    </a>
                  </div>
                  <div>
                    <span className="font-semibold text-(--text) block">Email LPPM:</span>
                    <a href="mailto:lppm@unsoed.ac.id" className="text-(--accent) hover:underline">
                      lppm@unsoed.ac.id
                    </a>
                  </div>
                  <div>
                    <span className="font-semibold text-(--text) block">Telepon / Fax:</span>
                    <span>(0281) 625739 <span className="text-[0.7rem] text-(--muted)">(Placeholder)</span></span>
                  </div>
                  <div>
                    <span className="font-semibold text-(--text) block">Hotline WhatsApp:</span>
                    <span>+62 812-XXXX-XXXX <span className="text-[0.7rem] text-(--muted)">(Placeholder)</span></span>
                  </div>
                </div>
              </div>

              {/* Jam Layanan */}
              <div className="rounded-xl border border-(--border) bg-(--surface) p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--accent-soft-bg) text-(--accent-soft-text)">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-(--text)">Waktu & Jam Layanan</h2>
                </div>
                <ul className="text-xs text-(--muted) space-y-1.5 list-none p-0 m-0">
                  <li className="flex justify-between">
                    <span>Senin – Kamis:</span>
                    <strong className="text-(--text)">08.00 – 16.00 WIB</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Jumat:</span>
                    <strong className="text-(--text)">08.00 – 16.30 WIB</strong>
                  </li>
                  <li className="text-[0.7rem] text-(--muted) pt-1">
                    * Istirahat siang: 11.30 – 13.00 WIB (Jumat: 11.30 – 13.30 WIB)
                  </li>
                  <li className="text-[0.7rem] text-(--muted)">
                    * Sabtu, Minggu, dan Hari Libur Nasional: Tutup
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Contact Form & FAQ */}
            <div className="lg:col-span-7 space-y-8">
              {/* Form Card */}
              <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 sm:p-8 shadow-xs">
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-(--accent)">Formulir Layanan</span>
                  <h2 className="text-xl font-bold text-(--text) mt-1">Kirim Pesan / Pertanyaan</h2>
                  <p className="text-xs text-(--muted) mt-1">
                    Ajukan pertanyaan umum, kendala teknis akun, atau konsultasi awal seputar protokol penelitian Anda.
                  </p>
                </div>

                <ContactForm />
              </div>

              {/* FAQ Section */}
              <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 sm:p-8 shadow-xs">
                <h2 className="text-lg font-bold text-(--text) mb-4">Pertanyaan yang Sering Diajukan (FAQ)</h2>
                <div className="space-y-4 text-xs">
                  <div className="rounded-lg border border-(--border) bg-(--bg) p-4">
                    <h3 className="font-bold text-(--text) mb-1">
                      Berapa lama proses penerbitan Ethical Clearance?
                    </h3>
                    <p className="text-(--muted) leading-relaxed">
                      Sistem menerapkan batas hari kerja (SLA): pengecekan berkas oleh sekretariat maksimal 2 hari kerja,
                      klasifikasi oleh ketua maksimal 3 hari kerja, dan proses telaah maksimal 10 hari kerja. Total proses umumnya 10–15 hari kerja tergantung respons revisi dari pengusul.
                    </p>
                  </div>

                  <div className="rounded-lg border border-(--border) bg-(--bg) p-4">
                    <h3 className="font-bold text-(--text) mb-1">
                      Apakah mahasiswa dapat mengajukan permohonan etik sendiri?
                    </h3>
                    <p className="text-(--muted) leading-relaxed">
                      Ya. Mahasiswa jenjang Sarjana (S1), Magister (S2), dan Doktoral (S3) dapat mendaftarkan akun di portal EC-KEP,
                      dengan mencantumkan nama Dosen Pembimbing Utama sebagai bagian dari tim peneliti.
                    </p>
                  </div>

                  <div className="rounded-lg border border-(--border) bg-(--bg) p-4">
                    <h3 className="font-bold text-(--text) mb-1">
                      Berapa kali batas kesempatan perbaikan (revisi)?
                    </h3>
                    <p className="text-(--muted) leading-relaxed">
                      Sesuai SOP, kesempatan perbaikan berkas dibatasi maksimal 2 kali putaran (Revisi I: 10 hari kerja, Revisi II: 5 hari kerja).
                      Jika pada putaran kedua belum memenuhi syarat, Ketua KEP akan menetapkan keputusan akhir (Disetujui atau Ditolak).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

