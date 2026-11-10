import Link from 'next/link';

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-(--border) bg-(--surface) text-(--text) transition-colors mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Column 1: Info Institusi */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--accent) text-sm font-extrabold text-(--accent-contrast)">
                EC
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-base text-(--text)">
                  EC-KEP LPPM UNSOED
                </span>
                <span className="text-xs text-(--muted)">Komisi Etik Penelitian</span>
              </div>
            </div>
            <p className="text-sm text-(--muted) leading-relaxed max-w-md">
              Sistem Informasi Komisi Etik Penelitian (KEP) Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM)
              Universitas Jenderal Soedirman. Menyelenggarakan telaah etik penelitian manusia dan hewan secara akuntabel,
              objektif, dan berstandar nasional/internasional.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-(--muted)">
              <span className="rounded-full border border-(--border) bg-(--bg) px-2.5 py-1">Panel SAINTEK</span>
              <span className="rounded-full border border-(--border) bg-(--bg) px-2.5 py-1">Panel SOSHUM</span>
              <span className="rounded-full border border-(--border) bg-(--bg) px-2.5 py-1">Pedoman KEPPKN</span>
            </div>
          </div>

          {/* Column 2: Tautan Halaman */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-(--text) mb-3">Menu Utama</h3>
            <ul className="space-y-2 text-sm text-(--muted) list-none p-0 m-0">
              <li>
                <Link href="/" className="hover:text-(--accent) transition-colors no-underline">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/tentang/profil" className="hover:text-(--accent) transition-colors no-underline">
                  Profil KEP
                </Link>
              </li>
              <li>
                <Link href="/tentang/struktur-organisasi" className="hover:text-(--accent) transition-colors no-underline">
                  Struktur Organisasi
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="hover:text-(--accent) transition-colors no-underline">
                  Hubungi Kami
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-(--accent) transition-colors no-underline">
                  Masuk ke Portal
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-(--accent) transition-colors no-underline">
                  Pendaftaran Peneliti
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Kontak & Sekretariat */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-(--text) mb-3">Sekretariat KEP</h3>
            <address className="not-italic text-sm text-(--muted) space-y-2">
              <p className="leading-relaxed">
                Gedung LPPM Universitas Jenderal Soedirman<br />
                Jl. Prof. Dr. HR Boenyamin No. 708, Grendeng, Purwokerto Utara, Banyumas, Jawa Tengah 53122
              </p>
              <p>
                <span className="font-semibold text-(--text)">Email:</span>{' '}
                <a href="mailto:kep@unsoed.ac.id" className="hover:text-(--accent) no-underline text-(--muted)">
                  kep@unsoed.ac.id
                </a>
              </p>
              <p>
                <span className="font-semibold text-(--text)">Jam Layanan:</span><br />
                Senin - Jumat: 08.00 - 16.00 WIB
              </p>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-(--border) flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-(--muted)">
          <p>© {currentYear} Komisi Etik Penelitian LPPM Universitas Jenderal Soedirman. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <Link href="/tentang/profil" className="hover:text-(--accent) no-underline text-(--muted)">
              Dasar Regulasi
            </Link>
            <span>•</span>
            <Link href="/kontak" className="hover:text-(--accent) no-underline text-(--muted)">
              Bantuan & FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

