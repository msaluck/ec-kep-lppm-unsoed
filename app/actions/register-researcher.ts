'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const SALT_ROUNDS = 10;

const RegisterResearcherInput = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(255),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(255),
  institution: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
});

type RegisterResearcherResult = { success: true } | { success: false; error: string };

// Self-registration for the Researcher role only — Secretariat, Chairman,
// and Reviewer accounts are provisioned directly in the database, since
// those roles are appointed positions within LPPM, not open signups.
export async function registerResearcher(
  input: z.infer<typeof RegisterResearcherInput>,
): Promise<RegisterResearcherResult> {
  const parsed = RegisterResearcherInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const { name, email, password, institution, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: 'This email is already registered. Please sign in instead.' };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'RESEARCHER',
      institution,
      phone,
    },
  });

  return { success: true };
}
