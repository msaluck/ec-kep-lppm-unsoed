import { requireRole } from '@/lib/require-session';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { NewApplicationForm } from '@/components/applications/new-application-form';

export default async function NewApplicationPage() {
  const session = await requireRole(['RESEARCHER']);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  return (
    <PageShell title="Ajukan Aplikasi Kaji Etik Baru">
      <NewApplicationForm
        proposerName={user.name}
        email={user.email}
        phone={user.phone ?? ''}
        institution={user.institution ?? ''}
      />
    </PageShell>
  );
}
