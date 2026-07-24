import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import type { Role } from '@prisma/client';
import { authOptions } from '@/lib/auth';

// Server-component guard: redirects to /login if unauthenticated, or to /
// if authenticated but not one of the allowed roles for this page.
export async function requireRole(allowedRoles: Role[]): Promise<Session> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }
  if (!allowedRoles.includes(session.user.role)) {
    redirect('/');
  }

  return session;
}
