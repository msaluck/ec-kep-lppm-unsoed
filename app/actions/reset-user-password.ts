'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTempPassword } from '@/lib/temp-password';

const SALT_ROUNDS = 10;

const ResetUserPasswordInput = z.object({
  userId: z.string().min(1),
});

type ResetUserPasswordResult = { success: true; temporaryPassword: string } | { success: false; error: string };

// Admin-initiated reset - unlike change-password.ts, this bypasses the
// current password entirely since the whole point is the account holder
// has lost access to it.
export async function resetUserPassword(
  input: z.infer<typeof ResetUserPasswordInput>,
): Promise<ResetUserPasswordResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized: only an Admin may reset a password.' };
  }

  const parsed = ResetUserPasswordInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const user = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!user) {
    return { success: false, error: 'User not found.' };
  }

  const temporaryPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true, temporaryPassword };
}
