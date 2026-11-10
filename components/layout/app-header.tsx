'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import type { Role } from '@prisma/client';

const NAV_LINKS: Record<Role, { href: string; label: string }[]> = {
  RESEARCHER: [
    { href: '/applications', label: 'Aplikasi Saya' },
    { href: '/applications/new', label: 'Ajukan Baru' },
  ],
  SECRETARIAT: [{ href: '/secretariat/queue', label: 'Antrean Kelengkapan' }],
  CHAIRMAN: [{ href: '/chairman/queue', label: 'Antrean Keputusan' }],
  REVIEWER: [{ href: '/reviewer/assignments', label: 'Penugasan Saya' }],
  ADMIN: [{ href: '/admin/users', label: 'Manajemen Pengguna' }],
};

export function AppHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) return null;

  const links = [...(NAV_LINKS[session.user.role] ?? []), { href: '/profile', label: 'Profil' }];

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link href="/" className="app-brand no-underline hover:opacity-85 transition-opacity" title="Ke Beranda Utama">
          EC-KEP LPPM Unsoed
        </Link>
        <nav className="app-nav">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={pathname === link.href ? 'active' : ''}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="app-user">
          <span>
            {session.user.name} <span className="role-tag">{session.user.role}</span>
          </span>
          <button type="button" onClick={() => signOut({ callbackUrl: '/login' })}>
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
}
