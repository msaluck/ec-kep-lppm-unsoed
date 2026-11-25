import { prisma } from '@/lib/prisma';

export type HomeContent = {
  heroTitle: string;
  heroSubtitle: string;
  announcementTitle: string;
  announcementText: string;
  announcementEnabled: boolean;
  announcementDate?: string;
  aboutBrief: string;
  notice: string;
};

export const DEFAULT_HOME_CONTENT: HomeContent = {
  heroTitle: 'Sistem Kaji Etik Penelitian (EC-KEP) LPPM Unsoed',
  heroSubtitle:
    'Layanan resmi pengajuan dan penelaahan protokol etik penelitian di lingkungan Universitas Jenderal Soedirman. Menjamin perlindungan martabat, hak, dan keselamatan subjek penelitian.',
  announcementTitle: 'Informasi Layanan Kaji Etik',
  announcementText:
    'Pengajuan telaah etik dibuka setiap hari kerja. Pastikan berkas Proposal Penelitian, Formulir Aplikasi, dan Pernyataan Bebas Konflik Kepentingan telah diisi lengkap sebelum diajukan.',
  announcementEnabled: true,
  announcementDate: 'Tahun Akademik Aktif',
  aboutBrief:
    'Komisi Etik Penelitian (KEP) LPPM Universitas Jenderal Soedirman bertugas mengevaluasi kelayakan etik usulan penelitian yang melibatkan subjek manusia, hewan coba, maupun data dan sampel biologis.',
  notice: 'Batas waktu verifikasi administrasi oleh sekretariat adalah 2 hari kerja setelah dokumen lengkap diajukan.',
};

export type ProfileContent = {
  leadText: string;
  vision: string;
  missions: string[];
  legalBases: Array<{ title: string; desc: string }>;
  duties: Array<{ title: string; desc: string }>;
};

export const DEFAULT_PROFILE_CONTENT: ProfileContent = {
  leadText:
    'Komisi Etik Penelitian (KEP) LPPM Universitas Jenderal Soedirman dibentuk sebagai wujud komitmen universitas dalam menjamin bahwa seluruh penelitian yang dilaksanakan oleh sivitas akademika maupun mitra memenuhi standar etika penelitian yang diakui secara nasional dan internasional.',
  vision:
    'Menjadi Komisi Etik Penelitian yang profesional, independen, transparan, dan terpercaya dalam mengawal integritas moral serta mutu ilmiah penelitian berlandaskan nilai-nilai kearifan lokal dan standar etik internasional.',
  missions: [
    'Menyelenggarakan penelaahan protokol etik penelitian secara objektif, transparan, dan akuntabel.',
    'Melindungi hak, keselamatan, dan kesejahteraan seluruh subjek penelitian (manusia, hewan percobaan, dan lingkungan).',
    'Meningkatkan pemahaman sivitas akademika mengenai prinsip-prinsip etika penelitian dan integritas ilmiah.',
    'Mendukung pencapaian visi riset Universitas Jenderal Soedirman yang berdaya saing global dan relevan bagi masyarakat pedesaan.',
  ],
  legalBases: [
    {
      title: 'Undang-Undang No. 17 Tahun 2023 tentang Kesehatan',
      desc: 'Landasan hukum utama perlindungan subjek manusia dalam penelitian biomedis dan kesehatan di Indonesia.',
    },
    {
      title: 'Deklarasi Helsinki WMA (World Medical Association)',
      desc: 'Pedoman etik internasional untuk penelitian medis yang melibatkan subjek manusia.',
    },
    {
      title: 'Pedoman CIOMS (Council for International Organizations of Medical Sciences)',
      desc: 'Panduan internasional untuk penelitian biomedis terkait kesehatan yang melibatkan manusia.',
    },
    {
      title: 'Peraturan Rektor Universitas Jenderal Soedirman',
      desc: 'Keputusan pendirian dan tata kelola Komisi Etik Penelitian di lingkungan LPPM Unsoed.',
    },
  ],
  duties: [
    {
      title: 'Penelaahan Protokol',
      desc: 'Mengevaluasi desain penelitian, manajemen risiko-manfaat, lembar persetujuan (informed consent), dan instrumen penelitian.',
    },
    {
      title: 'Penerbitan Ethical Clearance',
      desc: 'Menerbitkan Surat Keterangan Laik Etik (Ethical Clearance) atau Surat Bebas Etik (Exemption) bagi protokol yang memenuhi kriteria.',
    },
    {
      title: 'Pemantauan & Evaluasi',
      desc: 'Melakukan monitoring terhadap pelaksanaan penelitian yang telah disetujui guna memastikan kepatuhan terhadap protokol.',
    },
    {
      title: 'Edukasi & Konsultasi Etik',
      desc: 'Memberikan bimbingan, sosialisasi, dan konsultasi etik penelitian bagi peneliti, dosen, dan mahasiswa.',
    },
  ],
};

export type OrganizationContent = {
  advisor: { name: string; title: string; note?: string };
  chairman: { name: string; title: string; department?: string };
  viceChairman: { name: string; title: string; department?: string };
  secretary: { name: string; title: string; department?: string };
  saintekMembers: Array<{ name: string; title: string; expertise: string }>;
  soshumMembers: Array<{ name: string; title: string; expertise: string }>;
  secretariatStaff: Array<{ name: string; role: string; task: string }>;
};

export const DEFAULT_ORGANIZATION_CONTENT: OrganizationContent = {
  advisor: {
    name: 'Prof. Dr. Ir. Elly Tugiyanti, M.P., IPU.',
    title: 'Ketua LPPM Universitas Jenderal Soedirman',
    note: 'Penanggung Jawab Komisi Etik Penelitian',
  },
  chairman: {
    name: 'Dr. dr. Mukhlas Hamidy, M.Kes., Sp.P(K)',
    title: 'Ketua Komisi Etik Penelitian (KEP)',
    department: 'Fakultas Kedokteran Unsoed',
  },
  viceChairman: {
    name: 'Dr. Hendri Wasito, M.Sc., Apt.',
    title: 'Wakil Ketua Komisi Etik Penelitian (KEP)',
    department: 'Fakultas Farmasi Unsoed',
  },
  secretary: {
    name: 'Dr. Wisnu Widjanarko, S.Sos., M.Si.',
    title: 'Sekretaris Komisi Etik Penelitian (KEP)',
    department: 'Fakultas Ilmu Sosial dan Ilmu Politik Unsoed',
  },
  saintekMembers: [
    {
      name: 'dr. Yudhi Wibowo, M.Biomed.',
      title: 'Anggota Penelaah Panel SAINTEK',
      expertise: 'Biomedik & Farmakologi Klinis',
    },
    {
      name: 'Dr. Budi Santoso, S.Si., M.Si.',
      title: 'Anggota Penelaah Panel SAINTEK',
      expertise: 'Sains Hayati & Bioteknologi',
    },
    {
      name: 'Dr. drh. Widya Asmara, M.Si.',
      title: 'Anggota Penelaah Panel SAINTEK',
      expertise: 'Kesejahteraan Hewan Uji & Veteriner',
    },
  ],
  soshumMembers: [
    {
      name: 'Dr. Tri Wuryani, S.H., M.Hum.',
      title: 'Anggota Penelaah Panel SOSHUM',
      expertise: 'Hukum Kesehatan & Bioetika',
    },
    {
      name: 'Siti Nur Azizah, S.Psi., M.Psi., Psikolog',
      title: 'Anggota Penelaah Panel SOSHUM',
      expertise: 'Psikologi Sosial & Perilaku Partisipan',
    },
    {
      name: 'Dr. Ahmad Sabiq, M.A.',
      title: 'Anggota Penelaah Panel SOSHUM',
      expertise: 'Sosiologi & Komunitas Rentan',
    },
  ],
  secretariatStaff: [
    {
      name: 'Staf Administrasi & Verifikasi Berkas',
      role: 'Sekretariat KEP LPPM',
      task: 'Pemeriksaan kelengkapan administrasi pengajuan',
    },
    {
      name: 'Staf Dokumentasi & Surat Menyurat',
      role: 'Sekretariat KEP LPPM',
      task: 'Penerbitan surat izin, notulen, dan sertifikat laik etik',
    },
  ],
};

export type ContactContent = {
  officeName: string;
  buildingLocation: string;
  streetAddress: string;
  cityPostal: string;
  email: string;
  phone: string;
  whatsapp: string;
  hoursWorkdays: string;
  hoursFriday: string;
  consultationNote: string;
};

export const DEFAULT_CONTACT_CONTENT: ContactContent = {
  officeName: 'Sekretariat Komisi Etik Penelitian (KEP)',
  buildingLocation: 'Gedung LPPM Universitas Jenderal Soedirman Lantai 1',
  streetAddress: 'Jl. Prof. Dr. HR Boenyamin No. 708, Grendeng, Purwokerto Utara',
  cityPostal: 'Kabupaten Banyumas, Jawa Tengah 53122',
  email: 'kep.lppm@unsoed.ac.id',
  phone: '(0281) 625739',
  whatsapp: '+62 812-2550-9988',
  hoursWorkdays: 'Senin - Kamis: 08.00 - 15.30 WIB',
  hoursFriday: 'Jumat: 08.00 - 16.00 WIB (Istirahat 11.30 - 13.00 WIB)',
  consultationNote:
    'Layanan konsultasi tatap muka dapat dilakukan pada jam kerja dengan konfirmasi terlebih dahulu melalui WhatsApp Sekretariat KEP.',
};

export async function getSiteContent<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const record = await prisma.siteContent.findUnique({
      where: { key },
    });
    if (!record?.content) return defaultValue;
    const parsed = JSON.parse(record.content);
    return { ...defaultValue, ...parsed };
  } catch (err) {
    console.error(`Error reading site content for key "${key}":`, err);
    return defaultValue;
  }
}

export async function saveSiteContent(key: string, data: unknown, updatedBy?: string): Promise<void> {
  await prisma.siteContent.upsert({
    where: { key },
    create: {
      key,
      content: JSON.stringify(data),
      updatedBy,
    },
    update: {
      content: JSON.stringify(data),
      updatedBy,
    },
  });
}
