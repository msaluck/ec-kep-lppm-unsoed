'use server';

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const UpdateProfileInput = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(255),
  institution: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
});

type UpdateProfileResult = { success: true } | { success: false; error: string };

export async function updateProfile(input: z.infer<typeof UpdateProfileInput>): Promise<UpdateProfileResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized.' };
  }

  const parsed = UpdateProfileInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  revalidatePath('/profile');
  return { success: true };
}
