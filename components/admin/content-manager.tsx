'use client';

import { useState } from 'react';
import { updateSiteContent } from '@/app/actions/update-site-content';
import type {
  HomeContent,
  ProfileContent,
  OrganizationContent,
  ContactContent,
} from '@/lib/site-content';

type TabKey = 'home' | 'profile' | 'organization' | 'contact';

export function ContentManager({
  initialHome,
  initialProfile,
  initialOrganization,
  initialContact,
}: {
  initialHome: HomeContent;
  initialProfile: ProfileContent;
  initialOrganization: OrganizationContent;
  initialContact: ContactContent;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  // Form states
  const [home, setHome] = useState<HomeContent>(initialHome);
  const [profile, setProfile] = useState<ProfileContent>(initialProfile);
  const [organization, setOrganization] = useState<OrganizationContent>(initialOrganization);
  const [contact, setContact] = useState<ContactContent>(initialContact);

  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSave(key: TabKey) {
    setIsSubmitting(true);
    setStatusMessage(null);

    let payload: unknown;
    if (key === 'home') payload = home;
    else if (key === 'profile') payload = profile;
    else if (key === 'organization') payload = organization;
    else if (key === 'contact') payload = contact;

    const res = await updateSiteContent({ key, data: payload });
    setIsSubmitting(false);

    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: `Konten "${getTabLabel(key)}" berhasil diperbarui dan dipublikasikan!`,
      });
      // Scroll to top of form smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Gagal menyimpan konten.',
      });
    }
  }

  function getTabLabel(key: TabKey): string {
    switch (key) {
      case 'home':
        return 'Beranda & Info Terkini';
      case 'profile':
        return 'Profil KEP';
      case 'organization':
        return 'Struktur Organisasi';
      case 'contact':
        return 'Kontak & Sekretariat';
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-(--border) pb-3">
        {(['home', 'profile', 'organization', 'contact'] as TabKey[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setStatusMessage(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-(--accent) text-(--accent-contrast) shadow-xs'
                : 'bg-(--surface) text-(--muted) hover:text-(--text) hover:bg-(--surface-hover) border border-(--border)'
            }`}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      {/* Status Feedback */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? '✓ ' : '✕ '}
          {statusMessage.text}
        </div>
      )}

      {/* Tab 1: Beranda */}
      {activeTab === 'home' && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between border-b border-(--border) pb-4">
            <div>
              <h2 className="text-lg font-bold text-(--text)">Kelola Konten Beranda & Informasi</h2>
              <p className="text-xs text-(--muted)">Ubah judul utama, ringkasan pengantar, dan papan pengumuman publik.</p>
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave('home')}
              className="btn"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Beranda'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-(--text) mb-1">Judul Utama (Hero Title)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                value={home.heroTitle}
                onChange={(e) => setHome({ ...home, heroTitle: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-(--text) mb-1">Subjudul / Deskripsi Utama</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                value={home.heroSubtitle}
                onChange={(e) => setHome({ ...home, heroSubtitle: e.target.value })}
              />
            </div>

            <div className="p-4 rounded-xl border border-(--border) bg-(--bg) space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-(--text)">Papan Pengumuman / Info Terkini</h3>
                  <p className="text-xs text-(--muted)">Tampilkan pengumuman resmi di halaman beranda.</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-(--text)">
                  <input
                    type="checkbox"
                    checked={home.announcementEnabled}
                    onChange={(e) => setHome({ ...home, announcementEnabled: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Tampilkan Pengumuman</span>
                </label>
              </div>

              {home.announcementEnabled && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-(--muted) mb-1">Label / Periode</label>
                      <input
                        type="text"
                        className="w-full px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                        value={home.announcementDate ?? ''}
                        placeholder="Contoh: Tahun Akademik Aktif"
                        onChange={(e) => setHome({ ...home, announcementDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-(--muted) mb-1">Judul Pengumuman</label>
                      <input
                        type="text"
                        className="w-full px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                        value={home.announcementTitle}
                        onChange={(e) => setHome({ ...home, announcementTitle: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-(--muted) mb-1">Isi Pengumuman</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                      value={home.announcementText}
                      onChange={(e) => setHome({ ...home, announcementText: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-(--text) mb-1">Deskripsi Singkat KEP (Bagian Alur Telaah)</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                value={home.aboutBrief}
                onChange={(e) => setHome({ ...home, aboutBrief: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-(--text) mb-1">Catatan Layanan & SLA</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                value={home.notice}
                onChange={(e) => setHome({ ...home, notice: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-(--border) flex justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave('home')}
              className="btn"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Beranda'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Profil KEP */}
      {activeTab === 'profile' && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between border-b border-(--border) pb-4">
            <div>
              <h2 className="text-lg font-bold text-(--text)">Kelola Profil, Visi, Misi & Dasar Hukum</h2>
              <p className="text-xs text-(--muted)">Ubah pengantar kedudukan komisi etik, visi misi, serta regulasi rujukan.</p>
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave('profile')}
              className="btn"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-(--text) mb-1">Pengantar & Kedudukan Komisi Etik</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                value={profile.leadText}
                onChange={(e) => setProfile({ ...profile, leadText: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-(--text) mb-1">Visi Komisi Etik</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                value={profile.vision}
                onChange={(e) => setProfile({ ...profile, vision: e.target.value })}
              />
            </div>

            {/* Missions List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-(--text)">Daftar Misi</label>
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, missions: [...profile.missions, ''] })}
                  className="btn secondary text-xs py-1 px-2.5"
                >
                  + Tambah Misi
                </button>
              </div>
              {profile.missions.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-(--muted) w-5">{idx + 1}.</span>
                  <input
                    type="text"
                    className="flex-1 px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={m}
                    onChange={(e) => {
                      const updated = [...profile.missions];
                      updated[idx] = e.target.value;
                      setProfile({ ...profile, missions: updated });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = profile.missions.filter((_, i) => i !== idx);
                      setProfile({ ...profile, missions: updated });
                    }}
                    className="text-red-500 hover:text-red-700 text-xs px-2 py-1 font-medium"
                    title="Hapus Misi"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>

            {/* Legal Bases */}
            <div className="space-y-3 pt-4 border-t border-(--border)">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-bold text-(--text)">Dasar Hukum & Regulasi Acuan</label>
                  <p className="text-xs text-(--muted)">Peraturan perundang-undangan dan pedoman etik internasional.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      legalBases: [...profile.legalBases, { title: '', desc: '' }],
                    })
                  }
                  className="btn secondary text-xs py-1 px-2.5"
                >
                  + Tambah Regulasi
                </button>
              </div>
              {profile.legalBases.map((lb, idx) => (
                <div key={idx} className="p-3 border rounded-xl bg-(--bg) border-(--border) space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-(--text)">Regulasi #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = profile.legalBases.filter((_, i) => i !== idx);
                        setProfile({ ...profile, legalBases: updated });
                      }}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Judul / Nama Regulasi (contoh: Undang-Undang No. 17 Tahun 2023)"
                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={lb.title}
                    onChange={(e) => {
                      const updated = [...profile.legalBases];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      setProfile({ ...profile, legalBases: updated });
                    }}
                  />
                  <textarea
                    rows={2}
                    placeholder="Deskripsi singkat keterkaitan regulasi"
                    className="w-full px-3 py-1.5 text-xs border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={lb.desc}
                    onChange={(e) => {
                      const updated = [...profile.legalBases];
                      updated[idx] = { ...updated[idx], desc: e.target.value };
                      setProfile({ ...profile, legalBases: updated });
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Duties */}
            <div className="space-y-3 pt-4 border-t border-(--border)">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-bold text-(--text)">Tugas Pokok & Fungsi (Tupoksi)</label>
                  <p className="text-xs text-(--muted)">Fungsi kerja utama komisi etik penelitian.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setProfile({
                      ...profile,
                      duties: [...profile.duties, { title: '', desc: '' }],
                    })
                  }
                  className="btn secondary text-xs py-1 px-2.5"
                >
                  + Tambah Tupoksi
                </button>
              </div>
              {profile.duties.map((duty, idx) => (
                <div key={idx} className="p-3 border rounded-xl bg-(--bg) border-(--border) space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-(--text)">Tupoksi #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = profile.duties.filter((_, i) => i !== idx);
                        setProfile({ ...profile, duties: updated });
                      }}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Nama Tugas (contoh: Penelaahan Protokol)"
                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={duty.title}
                    onChange={(e) => {
                      const updated = [...profile.duties];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      setProfile({ ...profile, duties: updated });
                    }}
                  />
                  <textarea
                    rows={2}
                    placeholder="Rincian pelaksanaan tugas"
                    className="w-full px-3 py-1.5 text-xs border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={duty.desc}
                    onChange={(e) => {
                      const updated = [...profile.duties];
                      updated[idx] = { ...updated[idx], desc: e.target.value };
                      setProfile({ ...profile, duties: updated });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-(--border) flex justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave('profile')}
              className="btn"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Struktur Organisasi */}
      {activeTab === 'organization' && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between border-b border-(--border) pb-4">
            <div>
              <h2 className="text-lg font-bold text-(--text)">Kelola Struktur Organisasi KEP</h2>
              <p className="text-xs text-(--muted)">Atur susunan pengarah, pimpinan komisi, penelaah SAINTEK & SOSHUM, dan sekretariat.</p>
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave('organization')}
              className="btn"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Struktur'}
            </button>
          </div>

          <div className="space-y-6">
            {/* Advisor */}
            <div className="p-4 rounded-xl border border-(--border) bg-(--bg) space-y-3">
              <h3 className="text-sm font-bold text-(--text)">Penanggung Jawab / Pengarah (Ketua LPPM)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-(--muted) mb-1">Nama & Gelar Lengkap</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={organization.advisor.name}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        advisor: { ...organization.advisor, name: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-(--muted) mb-1">Jabatan Formal</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={organization.advisor.title}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        advisor: { ...organization.advisor, title: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-(--muted) mb-1">Peran di KEP</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={organization.advisor.note ?? ''}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        advisor: { ...organization.advisor, note: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Chairman, Vice Chairman, Secretary */}
            <div className="p-4 rounded-xl border border-(--border) bg-(--bg) space-y-4">
              <h3 className="text-sm font-bold text-(--text)">Pimpinan Inti Komisi Etik Penelitian</h3>

              {/* Ketua */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-(--muted) mb-1">Nama Ketua KEP</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={organization.chairman.name}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        chairman: { ...organization.chairman, name: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-(--muted) mb-1">Jabatan</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={organization.chairman.title}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        chairman: { ...organization.chairman, title: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-(--muted) mb-1">Fakultas / Unit Asal</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={organization.chairman.department ?? ''}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        chairman: { ...organization.chairman, department: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              {/* Wakil Ketua */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-(--muted) mb-1">Nama Wakil Ketua KEP</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={organization.viceChairman.name}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        viceChairman: { ...organization.viceChairman, name: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-(--muted) mb-1">Jabatan</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={organization.viceChairman.title}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        viceChairman: { ...organization.viceChairman, title: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-(--muted) mb-1">Fakultas / Unit Asal</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={organization.viceChairman.department ?? ''}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        viceChairman: { ...organization.viceChairman, department: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              {/* Sekretaris */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-(--muted) mb-1">Nama Sekretaris KEP</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={organization.secretary.name}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        secretary: { ...organization.secretary, name: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-(--muted) mb-1">Jabatan</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={organization.secretary.title}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        secretary: { ...organization.secretary, title: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-(--muted) mb-1">Fakultas / Unit Asal</label>
                  <input
                    type="text"
                    className="w-full px-3 py-1.5 text-sm border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                    value={organization.secretary.department ?? ''}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        secretary: { ...organization.secretary, department: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Saintek Members */}
            <div className="space-y-3 pt-4 border-t border-(--border)">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-(--text)">Anggota Penelaah Panel SAINTEK</h3>
                  <p className="text-xs text-(--muted)">Daftar penelaah bidang kedokteran, kesehatan, hayati, sains & teknologi.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setOrganization({
                      ...organization,
                      saintekMembers: [
                        ...organization.saintekMembers,
                        { name: '', title: 'Anggota Penelaah Panel SAINTEK', expertise: '' },
                      ],
                    })
                  }
                  className="btn secondary text-xs py-1 px-2.5"
                >
                  + Tambah Penelaah Saintek
                </button>
              </div>

              {organization.saintekMembers.map((member, idx) => (
                <div key={idx} className="p-3 border rounded-xl bg-(--bg) border-(--border) space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-(--text)">Penelaah Saintek #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = organization.saintekMembers.filter((_, i) => i !== idx);
                        setOrganization({ ...organization, saintekMembers: updated });
                      }}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Nama Lengkap & Gelar"
                      className="px-3 py-1.5 text-xs border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                      value={member.name}
                      onChange={(e) => {
                        const updated = [...organization.saintekMembers];
                        updated[idx] = { ...updated[idx], name: e.target.value };
                        setOrganization({ ...organization, saintekMembers: updated });
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Gelar / Peran Panel"
                      className="px-3 py-1.5 text-xs border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                      value={member.title}
                      onChange={(e) => {
                        const updated = [...organization.saintekMembers];
                        updated[idx] = { ...updated[idx], title: e.target.value };
                        setOrganization({ ...organization, saintekMembers: updated });
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Keahlian (contoh: Biomedik, Farmakologi)"
                      className="px-3 py-1.5 text-xs border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                      value={member.expertise}
                      onChange={(e) => {
                        const updated = [...organization.saintekMembers];
                        updated[idx] = { ...updated[idx], expertise: e.target.value };
                        setOrganization({ ...organization, saintekMembers: updated });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Soshum Members */}
            <div className="space-y-3 pt-4 border-t border-(--border)">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-(--text)">Anggota Penelaah Panel SOSHUM</h3>
                  <p className="text-xs text-(--muted)">Daftar penelaah bidang sosial, hukum, humaniora, dan psikologi.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setOrganization({
                      ...organization,
                      soshumMembers: [
                        ...organization.soshumMembers,
                        { name: '', title: 'Anggota Penelaah Panel SOSHUM', expertise: '' },
                      ],
                    })
                  }
                  className="btn secondary text-xs py-1 px-2.5"
                >
                  + Tambah Penelaah Soshum
                </button>
              </div>

              {organization.soshumMembers.map((member, idx) => (
                <div key={idx} className="p-3 border rounded-xl bg-(--bg) border-(--border) space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-(--text)">Penelaah Soshum #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = organization.soshumMembers.filter((_, i) => i !== idx);
                        setOrganization({ ...organization, soshumMembers: updated });
                      }}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Nama Lengkap & Gelar"
                      className="px-3 py-1.5 text-xs border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                      value={member.name}
                      onChange={(e) => {
                        const updated = [...organization.soshumMembers];
                        updated[idx] = { ...updated[idx], name: e.target.value };
                        setOrganization({ ...organization, soshumMembers: updated });
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Gelar / Peran Panel"
                      className="px-3 py-1.5 text-xs border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                      value={member.title}
                      onChange={(e) => {
                        const updated = [...organization.soshumMembers];
                        updated[idx] = { ...updated[idx], title: e.target.value };
                        setOrganization({ ...organization, soshumMembers: updated });
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Keahlian (contoh: Psikologi Sosial, Etika Hukum)"
                      className="px-3 py-1.5 text-xs border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                      value={member.expertise}
                      onChange={(e) => {
                        const updated = [...organization.saintekMembers];
                        updated[idx] = { ...updated[idx], expertise: e.target.value };
                        setOrganization({ ...organization, soshumMembers: updated });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Secretariat Staff */}
            <div className="space-y-3 pt-4 border-t border-(--border)">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-(--text)">Staf Sekretariat KEP LPPM</h3>
                  <p className="text-xs text-(--muted)">Petugas verifikasi administrasi dan pelayanan operasional.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setOrganization({
                      ...organization,
                      secretariatStaff: [
                        ...organization.secretariatStaff,
                        { name: '', role: 'Sekretariat KEP LPPM', task: '' },
                      ],
                    })
                  }
                  className="btn secondary text-xs py-1 px-2.5"
                >
                  + Tambah Staf Sekretariat
                </button>
              </div>

              {organization.secretariatStaff.map((staff, idx) => (
                <div key={idx} className="p-3 border rounded-xl bg-(--bg) border-(--border) space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-(--text)">Staf Sekretariat #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = organization.secretariatStaff.filter((_, i) => i !== idx);
                        setOrganization({ ...organization, secretariatStaff: updated });
                      }}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Nama Staf / Jabatan"
                      className="px-3 py-1.5 text-xs border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                      value={staff.name}
                      onChange={(e) => {
                        const updated = [...organization.secretariatStaff];
                        updated[idx] = { ...updated[idx], name: e.target.value };
                        setOrganization({ ...organization, secretariatStaff: updated });
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Peran (contoh: Sekretariat KEP LPPM)"
                      className="px-3 py-1.5 text-xs border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                      value={staff.role}
                      onChange={(e) => {
                        const updated = [...organization.secretariatStaff];
                        updated[idx] = { ...updated[idx], role: e.target.value };
                        setOrganization({ ...organization, secretariatStaff: updated });
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Tugas Utama (contoh: Verifikasi Berkas)"
                      className="px-3 py-1.5 text-xs border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                      value={staff.task}
                      onChange={(e) => {
                        const updated = [...organization.secretariatStaff];
                        updated[idx] = { ...updated[idx], task: e.target.value };
                        setOrganization({ ...organization, secretariatStaff: updated });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-(--border) flex justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave('organization')}
              className="btn"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Struktur'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Kontak & Sekretariat */}
      {activeTab === 'contact' && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between border-b border-(--border) pb-4">
            <div>
              <h2 className="text-lg font-bold text-(--text)">Kelola Informasi Kontak & Lokasi Sekretariat</h2>
              <p className="text-xs text-(--muted)">Ubah lokasi fisik, jam operasional, email, telepon, dan nomor WhatsApp.</p>
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave('contact')}
              className="btn"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Kontak'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-(--text) mb-1">Nama Kantor / Unit Layanan</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                  value={contact.officeName}
                  onChange={(e) => setContact({ ...contact, officeName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--text) mb-1">Lokasi Gedung & Lantai</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                  value={contact.buildingLocation}
                  onChange={(e) => setContact({ ...contact, buildingLocation: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-(--text) mb-1">Alamat Jalan</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                  value={contact.streetAddress}
                  onChange={(e) => setContact({ ...contact, streetAddress: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--text) mb-1">Kota / Kabupaten & Kode Pos</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                  value={contact.cityPostal}
                  onChange={(e) => setContact({ ...contact, cityPostal: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-(--text) mb-1">Email Resmi KEP</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--text) mb-1">Nomor Telepon / Fax</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--text) mb-1">Nomor WhatsApp Layanan</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                  value={contact.whatsapp}
                  onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-(--text) mb-1">Jam Layanan (Senin - Kamis)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                  value={contact.hoursWorkdays}
                  onChange={(e) => setContact({ ...contact, hoursWorkdays: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-(--text) mb-1">Jam Layanan (Jumat)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                  value={contact.hoursFriday}
                  onChange={(e) => setContact({ ...contact, hoursFriday: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-(--text) mb-1">Catatan Layanan Konsultasi</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border rounded-lg bg-(--surface) text-(--text) border-(--border)"
                value={contact.consultationNote}
                onChange={(e) => setContact({ ...contact, consultationNote: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-(--border) flex justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave('contact')}
              className="btn"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Kontak'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
