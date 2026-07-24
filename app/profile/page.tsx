import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { ProfileForm } from '@/components/profile/profile-form';
import { ChangePasswordForm } from '@/components/profile/change-password-form';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    redirect('/login');
  }

  return (
    <PageShell title="Profil Saya">
      <ProfileForm
        initialName={user.name}
        initialInstitution={user.institution ?? ''}
        initialPhone={user.phone ?? ''}
      />
      <ChangePasswordForm />
    </PageShell>
  );
}
