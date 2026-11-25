import Link from 'next/link';
import { PublicShell } from '@/components/layout/public-shell';
import { getSiteContent, DEFAULT_PROFILE_CONTENT, type ProfileContent } from '@/lib/site-content';

export const metadata = {
  title: 'Profil KEP - EC-KEP LPPM Unsoed',
  description: 'Profil, visi, misi, dan dasar hukum Komisi Etik Penelitian LPPM Universitas Jenderal Soedirman',
};

export default async function ProfilPage() {
  const profile = await getSiteContent<ProfileContent>('profile', DEFAULT_PROFILE_CONTENT);

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
              <p className="whitespace-pre-line">
                {profile.leadText}
              </p>
            </div>
          </div>

          {/* Section: Visi & Misi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 sm:p-8 flex flex-col">
              <div className="inline-flex items-center gap-2 rounded-lg bg-(--accent-soft-bg) px-3 py-1 text-xs font-bold text-(--accent-soft-text) mb-4 self-start">
                Visi KEP
              </div>
              <h2 className="text-lg font-bold text-(--text) mb-3">Visi Komisi Etik</h2>
              <p className="text-sm text-(--muted) leading-relaxed flex-1 whitespace-pre-line">
                {profile.vision}
              </p>
            </div>

            <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 sm:p-8 flex flex-col">
              <div className="inline-flex items-center gap-2 rounded-lg bg-(--success-bg) px-3 py-1 text-xs font-bold text-(--success) mb-4 self-start">
                Misi KEP
              </div>
              <h2 className="text-lg font-bold text-(--text) mb-3">Misi Komisi Etik</h2>
              <ul className="text-sm text-(--muted) space-y-2.5 list-disc pl-4 flex-1">
                {profile.missions.map((mission, idx) => (
                  <li key={idx}>{mission}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section: Tugas Pokok & Fungsi (Tupoksi) */}
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 sm:p-8">
            <h2 className="text-xl font-bold text-(--text) mb-4">Tugas Pokok & Fungsi (Tupoksi)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.duties.map((duty, idx) => (
                <div key={idx} className="rounded-xl border border-(--border) bg-(--bg) p-5">
                  <div className="text-xs font-bold text-(--accent) mb-1">Fungsi {idx + 1}</div>
                  <h3 className="text-sm font-bold text-(--text) mb-2">{duty.title}</h3>
                  <p className="text-xs text-(--muted) leading-relaxed">
                    {duty.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Dasar Regulasi & Standar Etik */}
          <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 sm:p-8">
            <h2 className="text-xl font-bold text-(--text) mb-4">Dasar Hukum & Acuan Regulasi</h2>
            <div className="space-y-3 text-sm text-(--muted)">
              {profile.legalBases.map((lb, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-(--border) bg-(--bg)">
                  <span className="font-bold text-(--accent)">•</span>
                  <p className="m-0 leading-relaxed">
                    <strong className="text-(--text)">{lb.title}:</strong> {lb.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

