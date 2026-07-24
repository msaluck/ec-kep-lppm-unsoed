import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const ROLE_HOME_PATH: Record<string, string> = {
  RESEARCHER: '/applications',
  SECRETARIAT: '/secretariat/queue',
  CHAIRMAN: '/chairman/queue',
  REVIEWER: '/reviewer/assignments',
  ADMIN: '/admin/users',
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  redirect(ROLE_HOME_PATH[session.user.role] ?? '/login');
}
