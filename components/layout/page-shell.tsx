import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/app-header';

export function PageShell({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="page-content">
        <div className="page-title-row">
          <h1>{title}</h1>
          {actions}
        </div>
        {children}
      </main>
    </>
  );
}
