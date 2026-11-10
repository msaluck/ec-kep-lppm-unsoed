'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const ROLE_DASHBOARD: Record<string, string> = {
  RESEARCHER: '/applications',
  SECRETARIAT: '/secretariat/queue',
  CHAIRMAN: '/chairman/queue',
  REVIEWER: '/reviewer/assignments',
  ADMIN: '/admin/users',
};

export function PublicHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);

  const dashboardHref = session?.user?.role ? (ROLE_DASHBOARD[session.user.role] ?? '/applications') : null;
  const isAboutActive = pathname.startsWith('/tentang');

  return (
    <header className="sticky top-0 z-50 border-b border-(--border) bg-(--surface)/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 no-underline group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--accent) text-base font-extrabold text-(--accent-contrast) shadow-sm group-hover:bg-(--accent-hover) transition-colors">
            EC
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-(--text) leading-tight group-hover:text-(--accent) transition-colors">
              EC-KEP LPPM
            </span>
            <span className="text-xs text-(--muted) font-medium">Universitas Jenderal Soedirman</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
          <Link
            href="/"
            className={`rounded-lg px-3 py-2 transition-colors ${
              pathname === '/'
                ? 'bg-(--accent-soft-bg) text-(--accent-soft-text)'
                : 'text-(--muted) hover:bg-(--surface-hover) hover:text-(--text)'
            }`}
          >
            Beranda
          </Link>

          {/* Dropdown Tentang Kami */}
          <div
            className="relative"
            onMouseEnter={() => setAboutDropdownOpen(true)}
            onMouseLeave={() => setAboutDropdownOpen(false)}
          >
            <button
              type="button"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors cursor-pointer ${
                isAboutActive
                  ? 'bg-(--accent-soft-bg) text-(--accent-soft-text)'
                  : 'text-(--muted) hover:bg-(--surface-hover) hover:text-(--text)'
              }`}
              onClick={() => setAboutDropdownOpen((prev) => !prev)}
              aria-expanded={aboutDropdownOpen}
            >
              Tentang Kami
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${aboutDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {aboutDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-(--border) bg-(--surface) p-1.5 shadow-lg shadow-black/5 animate-in fade-in slide-in-from-top-1">
                <Link
                  href="/tentang/profil"
                  onClick={() => setAboutDropdownOpen(false)}
                  className={`flex flex-col rounded-lg px-3 py-2 text-sm no-underline transition-colors ${
                    pathname === '/tentang/profil'
                      ? 'bg-(--accent-soft-bg) text-(--accent-soft-text)'
                      : 'text-(--text) hover:bg-(--surface-hover)'
                  }`}
                >
                  <span className="font-semibold">Profil KEP</span>
                  <span className="text-xs text-(--muted)">Visi, misi, dan dasar hukum</span>
                </Link>
                <Link
                  href="/tentang/struktur-organisasi"
                  onClick={() => setAboutDropdownOpen(false)}
                  className={`flex flex-col rounded-lg px-3 py-2 text-sm no-underline transition-colors mt-0.5 ${
                    pathname === '/tentang/struktur-organisasi'
                      ? 'bg-(--accent-soft-bg) text-(--accent-soft-text)'
                      : 'text-(--text) hover:bg-(--surface-hover)'
                  }`}
                >
                  <span className="font-semibold">Struktur Organisasi</span>
                  <span className="text-xs text-(--muted)">Susunan komisi & penelaah</span>
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/kontak"
            className={`rounded-lg px-3 py-2 transition-colors ${
              pathname === '/kontak'
                ? 'bg-(--accent-soft-bg) text-(--accent-soft-text)'
                : 'text-(--muted) hover:bg-(--surface-hover) hover:text-(--text)'
            }`}
          >
            Kontak
          </Link>
        </nav>

        {/* Desktop Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-3">
              {dashboardHref && (
                <Link
                  href={dashboardHref}
                  className="inline-flex items-center gap-2 rounded-lg bg-(--accent) px-3.5 py-2 text-sm font-semibold text-(--accent-contrast) no-underline hover:bg-(--accent-hover) transition-colors shadow-sm"
                >
                  Dashboard Saya
                  <span className="rounded bg-white/20 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
                    {session.user.role}
                  </span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="rounded-lg border border-(--border) bg-(--surface) px-3 py-2 text-sm font-medium text-(--text) hover:bg-(--surface-hover) transition-colors cursor-pointer"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-(--text) hover:bg-(--surface-hover) transition-colors no-underline"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-(--accent) px-4 py-2 text-sm font-semibold text-(--accent-contrast) hover:bg-(--accent-hover) transition-colors no-underline shadow-sm"
              >
                Daftar Peneliti
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-(--border) text-(--text) md:hidden hover:bg-(--surface-hover)"
          aria-label="Buka menu navigasi"
          aria-expanded={mobileMenuOpen}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-(--border) bg-(--surface) px-4 pt-3 pb-6 md:hidden animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-1 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2.5 ${
                pathname === '/' ? 'bg-(--accent-soft-bg) text-(--accent-soft-text) font-semibold' : 'text-(--text)'
              }`}
            >
              Beranda
            </Link>
            <div className="px-3 pt-2 pb-1 text-xs font-bold text-(--muted) uppercase tracking-wider">
              Tentang Kami
            </div>
            <Link
              href="/tentang/profil"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-5 py-2 ${
                pathname === '/tentang/profil'
                  ? 'bg-(--accent-soft-bg) text-(--accent-soft-text) font-semibold'
                  : 'text-(--text)'
              }`}
            >
              Profil KEP
            </Link>
            <Link
              href="/tentang/struktur-organisasi"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-5 py-2 ${
                pathname === '/tentang/struktur-organisasi'
                  ? 'bg-(--accent-soft-bg) text-(--accent-soft-text) font-semibold'
                  : 'text-(--text)'
              }`}
            >
              Struktur Organisasi
            </Link>
            <Link
              href="/kontak"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-2.5 ${
                pathname === '/kontak' ? 'bg-(--accent-soft-bg) text-(--accent-soft-text) font-semibold' : 'text-(--text)'
              }`}
            >
              Kontak
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-(--border) flex flex-col gap-2">
            {session?.user ? (
              <>
                {dashboardHref && (
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-lg bg-(--accent) px-4 py-2.5 text-sm font-semibold text-(--accent-contrast) no-underline text-center"
                  >
                    <span>Dashboard Saya</span>
                    <span className="rounded bg-white/20 px-2 py-0.5 text-xs uppercase">{session.user.role}</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="rounded-lg border border-(--border) bg-(--surface) px-4 py-2.5 text-sm font-semibold text-(--text) text-center cursor-pointer"
                >
                  Keluar ({session.user.name})
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg border border-(--border) px-4 py-2.5 text-center text-sm font-semibold text-(--text) no-underline hover:bg-(--surface-hover)"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-(--accent) px-4 py-2.5 text-center text-sm font-semibold text-(--accent-contrast) no-underline hover:bg-(--accent-hover)"
                >
                  Daftar Peneliti
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

