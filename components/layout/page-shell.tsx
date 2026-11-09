import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/app-header';

export function PageShell({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <main id="main-content" tabIndex={-1} className="page-content focus:outline-none">
        <div className="page-title-row">
          <h1>{title}</h1>
          {actions}
        </div>
        {children}
      </main>
    </>
  );
}
