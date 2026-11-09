import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { AppSessionProvider } from '@/components/providers/session-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'EC-KEP LPPM Unsoed',
  description: 'Research Ethics Review and Approval System - LPPM Universitas Jenderal Soedirman',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body>
        <a href="#main-content" className="skip-link">
          Langsung ke konten utama
        </a>
        <AppSessionProvider>{children}</AppSessionProvider>
      </body>
    </html>
  );
}
