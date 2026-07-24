import { requireRole } from '@/lib/require-session';
import { PageShell } from '@/components/layout/page-shell';
import { CreateUserForm } from '@/components/admin/create-user-form';

export default async function NewUserPage() {
  await requireRole(['ADMIN']);

  return (
    <PageShell title="Tambah Pengguna">
      <CreateUserForm />
    </PageShell>
  );
}
