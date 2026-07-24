import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD ?? 'ChangeMe123!';

const prisma = new PrismaClient();

// Secretariat, Chairman, and Reviewer accounts are appointed positions, not
// self-registered (see app/actions/register-researcher.ts) - this seeds one
// of each so the workflow can be exercised end-to-end on a fresh database.
// Every account uses the same default password; change it via each user's
// profile (or re-seed with SEED_DEFAULT_PASSWORD set) before going live.
const ACCOUNTS = [
  { name: 'Admin KEP', email: 'admin@lppm.unsoed.ac.id', role: 'ADMIN' as const },
  { name: 'Sekretariat KEP', email: 'sekretariat@lppm.unsoed.ac.id', role: 'SECRETARIAT' as const },
  { name: 'Ketua KEP', email: 'ketua@lppm.unsoed.ac.id', role: 'CHAIRMAN' as const },
  { name: 'Penelaah 1', email: 'penelaah1@lppm.unsoed.ac.id', role: 'REVIEWER' as const },
  { name: 'Penelaah 2', email: 'penelaah2@lppm.unsoed.ac.id', role: 'REVIEWER' as const },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  for (const account of ACCOUNTS) {
    await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: { ...account, passwordHash },
    });
    console.log(`Seeded ${account.role}: ${account.email}`);
  }

  console.log(`\nDefault password for all seeded accounts: ${DEFAULT_PASSWORD}`);
  console.log('Change these before going to production.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
