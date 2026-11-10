import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PublicShell } from '@/components/layout/public-shell';

const ROLE_DASHBOARD: Record<string, { href: string; label: string }> = {
  RESEARCHER: { href: '/applications', label: 'Dashboard Aplikasi Peneliti' },
  SECRETARIAT: { href: '/secretariat/queue', label: 'Dashboard Antrean Sekretariat' },
  CHAIRMAN: { href: '/chairman/queue', label: 'Dashboard Antrean Ketua KEP' },
  REVIEWER: { href: '/reviewer/assignments', label: 'Dashboard Penelaah' },
  ADMIN: { href: '/admin/users', label: 'Dashboard Administrasi' },
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const userDashboard = session?.user?.role ? ROLE_DASHBOARD[session.user.role] : null;

  return (
    <PublicShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-(--border) py-16 sm:py-24">
        {/* Subtle decorative background gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[900px] rounded-full bg-(--accent)/10 blur-3xl" />
          <div className="absolute top-1/2 right-0 h-[300px] w-[500px] rounded-full bg-(--success)/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-3 py-1 text-xs font-semibold text-(--muted) mb-6 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-(--success)" />
              Sistem Informasi Telaah Etik Penelitian Terpadu
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-(--text) sm:text-5xl sm:leading-tight">
              Komisi Etik Penelitian (KEP)
              <span className="block text-(--accent) mt-1">LPPM Universitas Jenderal Soedirman</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-(--muted) leading-relaxed">
              Mendukung penelitian yang berintegritas, melindungi hak dan martabat subjek penelitian, serta
              memfasilitasi penerbitan <em>Ethical Clearance</em> untuk sivitas akademika dan peneliti mandiri secara
              transparan, objektif, dan tepat waktu.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {session?.user ? (
                <>
                  {userDashboard && (
                    <Link
                      href={userDashboard.href}
                      className="inline-flex items-center gap-2 rounded-xl bg-(--accent) px-5 py-3 text-sm font-semibold text-(--accent-contrast) shadow-sm hover:bg-(--accent-hover) transition-all no-underline"
                    >
                      <span>Buka {userDashboard.label}</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  )}
                  {session.user.role === 'RESEARCHER' && (
                    <Link
                      href="/applications/new"
                      className="inline-flex items-center gap-2 rounded-xl border border-(--border) bg-(--surface) px-5 py-3 text-sm font-semibold text-(--text) hover:bg-(--surface-hover) transition-all no-underline"
                    >
                      Ajukan Protokol Baru
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-(--accent) px-5 py-3 text-sm font-semibold text-(--accent-contrast) shadow-sm hover:bg-(--accent-hover) transition-all no-underline"
                  >
                    <span>Daftar Akun Pengusul</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-(--border) bg-(--surface) px-5 py-3 text-sm font-semibold text-(--text) hover:bg-(--surface-hover) transition-all no-underline"
                  >
                    Masuk ke Sistem
                  </Link>
                </>
              )}
              <Link
                href="#alur-telaah"
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-medium text-(--muted) hover:text-(--text) transition-colors no-underline"
              >
                Pelajari Alur Telaah ↓
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / Keunggulan */}
      <section className="py-12 border-b border-(--border) bg-(--surface)/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-(--border) bg-(--surface) p-5 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--accent-soft-bg) text-(--accent-soft-text) font-bold mb-3">
                1
              </div>
              <h2 className="text-base font-bold text-(--text) mb-1">Dua Panel Spesifik</h2>
              <p className="text-sm text-(--muted) leading-relaxed">
                Menampung protokol <strong>Sains & Teknologi (SAINTEK)</strong> dan <strong>Sosial & Humaniora (SOSHUM)</strong> dengan formulir telaah terspesialisasi.
              </p>
            </div>

            <div className="rounded-xl border border-(--border) bg-(--surface) p-5 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--accent-soft-bg) text-(--accent-soft-text) font-bold mb-3">
                2
              </div>
              <h2 className="text-base font-bold text-(--text) mb-1">Kepastian Waktu (SLA)</h2>
              <p className="text-sm text-(--muted) leading-relaxed">
                Penetapan batas hari kerja terukur di setiap tahap: 2 hari kelengkapan, 3 hari klasifikasi, dan max 10 hari telaah.
              </p>
            </div>

            <div className="rounded-xl border border-(--border) bg-(--surface) p-5 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--accent-soft-bg) text-(--accent-soft-text) font-bold mb-3">
                3
              </div>
              <h2 className="text-base font-bold text-(--text) mb-1">3 Jalur Penelaahan</h2>
              <p className="text-sm text-(--muted) leading-relaxed">
                Disesuaikan dengan tingkat risiko protokol: <em>Exempted</em> (bebas telaah), <em>Expedited</em> (cepat), dan <em>Full Board</em> (sidang pleno).
              </p>
            </div>

            <div className="rounded-xl border border-(--border) bg-(--surface) p-5 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--accent-soft-bg) text-(--accent-soft-text) font-bold mb-3">
                4
              </div>
              <h2 className="text-base font-bold text-(--text) mb-1">Sertifikat Digital</h2>
              <p className="text-sm text-(--muted) leading-relaxed">
                Penerbitan surat keterangan kelaikan etik (<em>Ethical Clearance</em>) resmi bertanda tangan digital dalam format PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alur & Jalur Penelaahan */}
      <section id="alur-telaah" className="py-16 sm:py-20 border-b border-(--border)">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-(--accent)">Tahapan Prosedur</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-(--text) mt-1">
              Alur Pengajuan & Penelaahan Etik
            </h2>
            <p className="text-sm sm:text-base text-(--muted) mt-2">
              Proses evaluasi protokol penelitian dari pengajuan awal hingga penerbitan Ethical Clearance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
            <div className="relative rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-xs">
              <div className="text-xs font-bold text-(--accent) mb-1">Milestone 1</div>
              <h3 className="text-base font-bold text-(--text) mb-2">Pengajuan Protokol</h3>
              <p className="text-xs text-(--muted) leading-relaxed">
                Peneliti memilih panel (SAINTEK/SOSHUM), mengunggah berkas protokol, informed consent, dan dokumen instrumen.
              </p>
            </div>

            <div className="relative rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-xs">
              <div className="text-xs font-bold text-(--accent) mb-1">Milestone 2 (2 Hari Kerja)</div>
              <h3 className="text-base font-bold text-(--text) mb-2">Cek Kelengkapan</h3>
              <p className="text-xs text-(--muted) leading-relaxed">
                Sekretariat memeriksa kelengkapan administrasi. Berkas lengkap diteruskan ke Ketua; berkas kurang dikembalikan.
              </p>
            </div>

            <div className="relative rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-xs">
              <div className="text-xs font-bold text-(--accent) mb-1">Milestone 3 (3 Hari Kerja)</div>
              <h3 className="text-base font-bold text-(--text) mb-2">Klasifikasi Jalur</h3>
              <p className="text-xs text-(--muted) leading-relaxed">
                Ketua KEP mengklasifikasikan ke jalur <strong>Exempted</strong>, <strong>Expedited</strong>, atau <strong>Full Board</strong>.
              </p>
            </div>

            <div className="relative rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-xs">
              <div className="text-xs font-bold text-(--accent) mb-1">Milestone 4 (Max 10 Hari)</div>
              <h3 className="text-base font-bold text-(--text) mb-2">Proses Penelaahan</h3>
              <p className="text-xs text-(--muted) leading-relaxed">
                Tim penelaah independen memberikan penilaian, catatan etik, dan rekomendasi (Sepakat / Tidak Sepakat).
              </p>
            </div>

            <div className="relative rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-xs">
              <div className="text-xs font-bold text-(--accent) mb-1">Milestone 5 (5 Hari Kerja)</div>
              <h3 className="text-base font-bold text-(--text) mb-2">Keputusan Akhir</h3>
              <p className="text-xs text-(--muted) leading-relaxed">
                Ketua menetapkan status <strong>Disetujui</strong> (terbit surat etik), <strong>Perbaikan</strong> (revisi), atau <strong>Ditolak</strong>.
              </p>
            </div>
          </div>

          {/* Jalur Telaah detail */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-(--border) bg-(--surface) p-6">
              <div className="inline-block rounded-md bg-(--success-bg) px-2.5 py-1 text-xs font-bold text-(--success) mb-3">
                Jalur A: Exempted
              </div>
              <h3 className="text-lg font-bold text-(--text) mb-2">Bebas Telaah Etik</h3>
              <p className="text-sm text-(--muted) leading-relaxed mb-4">
                Untuk penelitian dengan risiko sangat rendah atau tanpa intervensi langsung, seperti studi data sekunder yang telah teranonimisasi atau evaluasi kurikulum pendidikan.
              </p>
              <ul className="text-xs text-(--muted) space-y-1.5 list-disc pl-4">
                <li>Langsung diterbitkan Surat Keterangan Pembebasan Etik</li>
                <li>Waktu proses lebih singkat</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-(--border) bg-(--surface) p-6">
              <div className="inline-block rounded-md bg-(--accent-soft-bg) px-2.5 py-1 text-xs font-bold text-(--accent-soft-text) mb-3">
                Jalur B: Expedited
              </div>
              <h3 className="text-lg font-bold text-(--text) mb-2">Telaah Cepat / Dipercepat</h3>
              <p className="text-sm text-(--muted) leading-relaxed mb-4">
                Untuk penelitian dengan risiko minimal terhadap subjek (misal: pengambilan darah vena dalam jumlah wajar, survei non-invasif, wawancara psikososial umum).
              </p>
              <ul className="text-xs text-(--muted) space-y-1.5 list-disc pl-4">
                <li>Ditelaah oleh minimal 2 penelaah independen</li>
                <li>Maksimal 10 hari kerja penelaahan</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-(--border) bg-(--surface) p-6">
              <div className="inline-block rounded-md bg-(--error-bg) px-2.5 py-1 text-xs font-bold text-(--error) mb-3">
                Jalur C: Full Board
              </div>
              <h3 className="text-lg font-bold text-(--text) mb-2">Rapat Pleno (Sidang Penuh)</h3>
              <p className="text-sm text-(--muted) leading-relaxed mb-4">
                Untuk penelitian dengan risiko lebih dari minimal, intervensi obat/tindakan invasif, subjek rentan (anak-anak, ibu hamil, narapidana), atau hewan uji spesifik.
              </p>
              <ul className="text-xs text-(--muted) space-y-1.5 list-disc pl-4">
                <li>Ditinjau dalam sidang pleno anggota komisi etik</li>
                <li>Dapat mengundang tim ahli eksternal</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-16 sm:py-20 bg-(--surface)">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-(--text)">
            Siap Mengajukan Protokol Etik Penelitian Anda?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-(--muted) max-w-xl mx-auto">
            Daftarkan diri Anda sebagai peneliti di portal EC-KEP LPPM Unsoed untuk memulai pengajuan protokol secara daring.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-xl bg-(--accent) px-6 py-3 text-sm font-semibold text-(--accent-contrast) shadow-sm hover:bg-(--accent-hover) no-underline transition-all"
            >
              Daftar Sebagai Pengusul
            </Link>
            <Link
              href="/tentang/profil"
              className="rounded-xl border border-(--border) bg-(--surface) px-6 py-3 text-sm font-semibold text-(--text) hover:bg-(--surface-hover) no-underline transition-all"
            >
              Pelajari Profil KEP
            </Link>
            <Link
              href="/kontak"
              className="rounded-xl border border-(--border) bg-(--surface) px-6 py-3 text-sm font-semibold text-(--muted) hover:text-(--text) hover:bg-(--surface-hover) no-underline transition-all"
            >
              Hubungi Sekretariat
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
