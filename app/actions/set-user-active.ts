'use server';

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const SetUserActiveInput = z.object({
  userId: z.string().min(1),
  isActive: z.boolean(),
});

type SetUserActiveResult = { success: true } | { success: false; error: string };

export async function setUserActive(input: z.infer<typeof SetUserActiveInput>): Promise<SetUserActiveResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized: only an Admin may activate/deactivate accounts.' };
  }

  const parsed = SetUserActiveInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input.' };
  }
  const { userId, isActive } = parsed.data;

  if (userId === session.user.id && !isActive) {
    return { success: false, error: 'You cannot deactivate your own account.' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { success: false, error: 'User not found.' };
  }

  await prisma.user.update({ where: { id: userId }, data: { isActive } });

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}
