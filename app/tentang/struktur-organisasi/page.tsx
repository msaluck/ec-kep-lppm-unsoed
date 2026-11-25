import Link from 'next/link';
import { PublicShell } from '@/components/layout/public-shell';
import {
  getSiteContent,
  DEFAULT_ORGANIZATION_CONTENT,
  type OrganizationContent,
} from '@/lib/site-content';

export const metadata = {
  title: 'Struktur Organisasi - EC-KEP LPPM Unsoed',
  description: 'Susunan organisasi dan anggota Komisi Etik Penelitian LPPM Universitas Jenderal Soedirman',
};

type MemberCardProps = {
  role: string;
  name: string;
  title: string;
  badge?: string;
  department?: string;
};

function MemberCard({ role, name, title, badge, department }: MemberCardProps) {
  const initials = name
    .replace(/^(\[|Dr\.|Prof\.|dr\.|Ir\.|drh\.|M\.|S\.)+\s*/i, '')
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'KP';

  return (
    <div className="rounded-xl border border-(--border) bg-(--surface) p-5 shadow-xs flex flex-col justify-between transition-all hover:border-(--accent)/50">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-(--accent)">
            {role}
          </span>
          {badge && (
            <span className="rounded-full border border-(--border) bg-(--bg) px-2 py-0.5 text-[0.65rem] font-semibold text-(--muted)">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--accent-soft-bg) text-(--accent-soft-text) font-bold text-sm">
            {initials}
          </div>
          <div>
            <h3 className="text-sm font-bold text-(--text) leading-snug">{name}</h3>
            <p className="text-xs text-(--muted) mt-0.5">{title}</p>
            {department && <p className="text-xs text-(--muted) mt-1">{department}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function StrukturOrganisasiPage() {
  const organization = await getSiteContent<OrganizationContent>(
    'organization',
    DEFAULT_ORGANIZATION_CONTENT,
  );

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
            <span className="text-(--accent) font-medium">Struktur Organisasi</span>
          </nav>

          <h1 className="text-3xl font-extrabold tracking-tight text-(--text) sm:text-4xl">
            Struktur Organisasi KEP
          </h1>
          <p className="mt-2 text-base text-(--muted) max-w-3xl leading-relaxed">
            Susunan kepengurusan, sekretariat, dan dewan penelaah etik Komisi Etik Penelitian LPPM Universitas Jenderal Soedirman.
          </p>

          {/* Sub Navigation Pills */}
          <div className="mt-6 flex items-center gap-2 border-b border-(--border) pb-0">
            <Link
              href="/tentang/profil"
              className="border-b-2 border-transparent pb-3 px-3 text-sm font-semibold text-(--muted) hover:text-(--text) no-underline transition-colors"
            >
              Profil & Visi Misi
            </Link>
            <Link
              href="/tentang/struktur-organisasi"
              className="border-b-2 border-(--accent) pb-3 px-3 text-sm font-bold text-(--accent) no-underline"
            >
              Struktur Organisasi
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
          {/* Tier 1: Penanggung Jawab & Pengarah */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-(--text)">Pelindung & Pengarah</h2>
              <span className="h-px flex-1 bg-(--border)" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <MemberCard
                role="Pelindung"
                name="Prof. Dr. Ir. Akhmad Sodiq, M.Sc., Agr., IPU."
                title="Rektor Universitas Jenderal Soedirman"
                badge="Pimpinan Universitas"
                department="Rektorat Unsoed"
              />
              <MemberCard
                role="Penanggung Jawab"
                name={organization.advisor.name}
                title={organization.advisor.title}
                badge="Pimpinan LPPM"
                department={organization.advisor.note || 'Lembaga Penelitian dan Pengabdian kepada Masyarakat'}
              />
            </div>
          </div>

          {/* Tier 2: Pimpinan KEP */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-(--text)">Pimpinan Komisi Etik Penelitian</h2>
              <span className="h-px flex-1 bg-(--border)" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <MemberCard
                role="Ketua KEP"
                name={organization.chairman.name}
                title={organization.chairman.title}
                badge="Ketua Komisi"
                department={organization.chairman.department}
              />
              <MemberCard
                role="Wakil Ketua KEP"
                name={organization.viceChairman.name}
                title={organization.viceChairman.title}
                badge="Wakil Ketua"
                department={organization.viceChairman.department}
              />
              <MemberCard
                role="Sekretaris KEP"
                name={organization.secretary.name}
                title={organization.secretary.title}
                badge="Sekretaris"
                department={organization.secretary.department}
              />
            </div>
          </div>

          {/* Tier 3: Sekretariat Pelaksana */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-(--text)">Sekretariat & Tim Administrasi</h2>
              <span className="h-px flex-1 bg-(--border)" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {organization.secretariatStaff.map((staff, idx) => (
                <MemberCard
                  key={idx}
                  role={staff.role}
                  name={staff.name}
                  title={staff.task}
                  badge="Sekretariat"
                  department="LPPM Unsoed"
                />
              ))}
            </div>
          </div>

          {/* Tier 4: Tim Penelaah Etik Berdasarkan Panel */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-(--text)">Panel Penelaah Etik</h2>
              <span className="h-px flex-1 bg-(--border)" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Panel SAINTEK */}
              <div className="rounded-2xl border border-(--border) bg-(--surface) p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-(--text)">Panel Sains dan Teknologi (SAINTEK)</h3>
                  <span className="rounded-full bg-(--accent-soft-bg) px-2.5 py-0.5 text-xs font-bold text-(--accent-soft-text)">
                    Panel A
                  </span>
                </div>
                <p className="text-xs text-(--muted) leading-relaxed mb-4">
                  Menelaah protokol penelitian eksperimen biomedis, kesehatan, farmasi, sains hayati, hewan percobaan,
                  pangan, pertanian, dan keteknikan.
                </p>

                <div className="space-y-3">
                  {organization.saintekMembers.map((member, idx) => (
                    <div key={idx} className="rounded-lg border border-(--border) bg-(--bg) p-3 text-xs">
                      <p className="font-semibold text-(--text)">{member.name}</p>
                      <p className="text-(--muted)">{member.title} • Keahlian: {member.expertise}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel SOSHUM */}
              <div className="rounded-2xl border border-(--border) bg-(--surface) p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-(--text)">Panel Sosial dan Humaniora (SOSHUM)</h3>
                  <span className="rounded-full bg-(--success-bg) px-2.5 py-0.5 text-xs font-bold text-(--success)">
                    Panel B
                  </span>
                </div>
                <p className="text-xs text-(--muted) leading-relaxed mb-4">
                  Menelaah protokol penelitian survei partisipan, studi perilaku, hukum, budaya, psikologi, pendidikan,
                  dan interaksi masyarakat rentan.
                </p>

                <div className="space-y-3">
                  {organization.soshumMembers.map((member, idx) => (
                    <div key={idx} className="rounded-lg border border-(--border) bg-(--bg) p-3 text-xs">
                      <p className="font-semibold text-(--text)">{member.name}</p>
                      <p className="text-(--muted)">{member.title} • Keahlian: {member.expertise}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

