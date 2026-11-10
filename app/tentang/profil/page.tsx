import Link from 'next/link';
import { PublicShell } from '@/components/layout/public-shell';

export const metadata = {
  title: 'Profil KEP - EC-KEP LPPM Unsoed',
  description: 'Profil, visi, misi, dan dasar hukum Komisi Etik Penelitian LPPM Universitas Jenderal Soedirman',
};

export default function ProfilPage() {
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
            <span className="text-(--text) font-medium">Tentang Kami</span>
            <span>/</span>
            <span className="text-(--accent) font-medium">Profil</span>
          </nav>

          <h1 className="text-3xl font-extrabold tracking-tight text-(--text) sm:text-4xl">
            Profil Komisi Etik Penelitian
          </h1>
          <p className="mt-2 text-base text-(--muted) max-w-3xl leading-relaxed">
            Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM) Universitas Jenderal Soedirman.
          </p>

          {/* Sub Navigation Pills */}
          <div className="mt-6 flex items-center gap-2 border-b border-(--border) pb-0">
            <Link
              href="/tentang/profil"
              className="border-b-2 border-(--accent) pb-3 px-3 text-sm font-bold text-(--accent) no-underline"
            >
              Profil & Visi Misi
            </Link>
            <Link
              href="/tentang/struktur-organisasi"
              className="border-b-2 border-transparent pb-3 px-3 text-sm font-semibold text-(--muted) hover:text-(--text) no-underline transition-colors"
            >
              Struktur Organisasi
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
          {/* Section: Pengantar & Kedudukan */}
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 sm:p-8">
            <h2 className="text-xl font-bold text-(--text) mb-4">Pengantar & Kedudukan</h2>
            <div className="prose prose-slate max-w-none text-sm text-(--muted) leading-relaxed space-y-4">
              <p>
                Komisi Etik Penelitian (KEP) LPPM Universitas Jenderal Soedirman dibentuk sebagai wujud komitmen universitas
                dalam menjamin bahwa seluruh penelitian yang dilaksanakan oleh sivitas akademika maupun pihak eksternal
                yang berkolaborasi dengan Unsoed memenuhi standar etika penelitian yang diakui secara nasional dan internasional.
              </p>
              <p>
                KEP LPPM Unsoed berfungsi sebagai badan penelaah independen yang mengevaluasi aspek perlindungan terhadap
                martabat, hak asasi, keamanan, dan kesejahteraan subjek penelitian, baik subjek manusia, hewan percobaan,
                maupun dampak penelitian terhadap lingkungan hidup dan masyarakat luas.
              </p>

              {/* Editable Placeholder Callout */}
              <div className="rounded-xl border border-dashed border-(--accent)/40 bg-(--accent-soft-bg)/30 p-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-(--accent) text-(--accent-contrast) px-2 py-0.5 text-xs font-bold uppercase tracking-wider shrink-0 mt-0.5">
                    Placeholder Konten
                  </div>
                  <div className="text-xs text-(--text) leading-relaxed">
                    <p className="font-semibold mb-1">Catatan Pengelola / Admin:</p>
                    <p className="text-(--muted)">
                      Bagian ini dapat disesuaikan dengan narasi sejarah pembentukan KEP LPPM Unsoed, nomor Surat Keputusan
                      (SK) Rektor terbaru, akreditasi KEPPKN, dan dokumen profil resmi institusi lainnya.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Visi & Misi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 sm:p-8 flex flex-col">
              <div className="inline-flex items-center gap-2 rounded-lg bg-(--accent-soft-bg) px-3 py-1 text-xs font-bold text-(--accent-soft-text) mb-4 self-start">
                Visi KEP
              </div>
              <h2 className="text-lg font-bold text-(--text) mb-3">Visi Komisi Etik</h2>
              <p className="text-sm text-(--muted) leading-relaxed flex-1">
                Menjadi komisi etik penelitian yang kredibel, independen, dan berintegritas tinggi dalam menjamin
                perlindungan harkat, martabat, dan hak-hak subjek penelitian guna mendukung riset berkualitas global
                berlandaskan kearifan lokal.
              </p>
              <div className="mt-4 pt-3 border-t border-(--border) text-xs text-(--muted) italic">
                * Teks visi dapat diperbarui sewaktu-waktu sesuai renstra LPPM Unsoed.
              </div>
            </div>

            <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 sm:p-8 flex flex-col">
              <div className="inline-flex items-center gap-2 rounded-lg bg-(--success-bg) px-3 py-1 text-xs font-bold text-(--success) mb-4 self-start">
                Misi KEP
              </div>
              <h2 className="text-lg font-bold text-(--text) mb-3">Misi Komisi Etik</h2>
              <ul className="text-sm text-(--muted) space-y-2.5 list-disc pl-4 flex-1">
                <li>
                  Menyelenggarakan penelaahan protokol etik penelitian secara objektif, transparan, dan akuntabel.
                </li>
                <li>
                  Menegakkan prinsip-prinsip universal kelaikan etik (<em>Respect for persons</em>, <em>Beneficence</em>, dan <em>Justice</em>).
                </li>
                <li>
                  Mendampingi peneliti dalam pemenuhan persyaratan standar etika penelitian nasional dan internasional.
                </li>
                <li>
                  Mengoptimalkan sistem layanan berbasis digital untuk kepastian waktu telaah dan kemudahan akses bagi peneliti.
                </li>
              </ul>
              <div className="mt-4 pt-3 border-t border-(--border) text-xs text-(--muted) italic">
                * Butir misi dapat disesuaikan dengan sasaran kerja KEP.
              </div>
            </div>
          </div>

          {/* Section: Tugas Pokok & Fungsi (Tupoksi) */}
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 sm:p-8">
            <h2 className="text-xl font-bold text-(--text) mb-4">Tugas Pokok & Fungsi (Tupoksi)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="rounded-xl border border-(--border) bg-(--bg) p-5">
                <div className="text-xs font-bold text-(--accent) mb-1">Fungsi 1</div>
                <h3 className="text-sm font-bold text-(--text) mb-2">Penelaahan Protokol</h3>
                <p className="text-xs text-(--muted) leading-relaxed">
                  Menelaah kelayakan etik usulan penelitian yang menggunakan subjek manusia, bahan biologis tersimpan,
                  rekam medik, survei sosial, maupun hewan percobaan.
                </p>
              </div>

              <div className="rounded-xl border border-(--border) bg-(--bg) p-5">
                <div className="text-xs font-bold text-(--accent) mb-1">Fungsi 2</div>
                <h3 className="text-sm font-bold text-(--text) mb-2">Penerbitan Ethical Clearance</h3>
                <p className="text-xs text-(--muted) leading-relaxed">
                  Menerbitkan Surat Keterangan Kelaikan Etik (<em>Ethical Clearance</em>), Surat Bebas Telaah (<em>Exemption</em>),
                  atau rekomendasi perbaikan berkas bagi protokol yang ditelaah.
                </p>
              </div>

              <div className="rounded-xl border border-(--border) bg-(--bg) p-5">
                <div className="text-xs font-bold text-(--accent) mb-1">Fungsi 3</div>
                <h3 className="text-sm font-bold text-(--text) mb-2">Monitoring & Edukasi</h3>
                <p className="text-xs text-(--muted) leading-relaxed">
                  Melakukan pemantauan keberlanjutan pelaksanaan riset yang telah disetujui serta memberikan pembinaan
                  dan sosialisasi integritas etik kepada peneliti.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Dasar Regulasi & Standar Etik */}
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 sm:p-8">
            <h2 className="text-xl font-bold text-(--text) mb-4">Dasar Hukum & Acuan Regulasi</h2>
            <div className="space-y-3 text-sm text-(--muted)">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-(--border) bg-(--bg)">
                <span className="font-bold text-(--accent)">•</span>
                <p className="m-0 leading-relaxed">
                  <strong className="text-(--text)">SK Rektor Universitas Jenderal Soedirman:</strong> Surat Keputusan
                  tentang Pembentukan dan Susunan Anggota Komisi Etik Penelitian LPPM Universitas Jenderal Soedirman.
                  <span className="text-xs text-(--muted) block mt-0.5">*(Nomor SK dapat dicantumkan di sini)*</span>
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-(--border) bg-(--bg)">
                <span className="font-bold text-(--accent)">•</span>
                <p className="m-0 leading-relaxed">
                  <strong className="text-(--text)">Pedoman KEPPKN Kemenkes RI:</strong> Pedoman dan Standar Etik Penelitian
                  dan Pengembangan Kesehatan Nasional oleh Komite Etik Penelitian dan Pengembangan Kesehatan Nasional.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-(--border) bg-(--bg)">
                <span className="font-bold text-(--accent)">•</span>
                <p className="m-0 leading-relaxed">
                  <strong className="text-(--text)">WMA Declaration of Helsinki:</strong> Deklarasi Asosiasi Medis Dunia
                  tentang Prinsip Etis untuk Riset Medis yang Melibatkan Subjek Manusia.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-(--border) bg-(--bg)">
                <span className="font-bold text-(--accent)">•</span>
                <p className="m-0 leading-relaxed">
                  <strong className="text-(--text)">Pedoman Internasional CIOMS:</strong> Council for International
                  Organizations of Medical Sciences - International Ethical Guidelines for Health-related Research Involving Humans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

