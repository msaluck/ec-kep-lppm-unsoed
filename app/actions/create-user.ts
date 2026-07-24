'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTempPassword } from '@/lib/temp-password';

const SALT_ROUNDS = 10;

const CreateUserInput = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  role: z.enum(['SECRETARIAT', 'CHAIRMAN', 'REVIEWER', 'ADMIN', 'RESEARCHER']),
  institution: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
});

type CreateUserResult = { success: true; temporaryPassword: string } | { success: false; error: string };

// Secretariat/Chairman/Reviewer are appointed positions with no self-signup
// flow (see app/actions/register-researcher.ts) - this is how an Admin
// actually onboards them. Returns the generated password once; it is
// never stored anywhere in retrievable form after this.
export async function createUser(input: z.infer<typeof CreateUserInput>): Promise<CreateUserResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized: only an Admin may create accounts.' };
  }

  const parsed = CreateUserInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const { name, email, role, institution, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: 'This email is already registered.' };
  }

  const temporaryPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, SALT_ROUNDS);

  await prisma.user.create({
    data: { name, email, role, institution, phone, passwordHash },
  });

  revalidatePath('/admin/users');
  return { success: true, temporaryPassword };
}
