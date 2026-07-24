import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppSessionProvider } from '@/components/providers/session-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'EC-KEP LPPM Unsoed',
  description: 'Research Ethics Review and Approval System - LPPM Universitas Jenderal Soedirman',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AppSessionProvider>{children}</AppSessionProvider>
      </body>
    </html>
  );
}
