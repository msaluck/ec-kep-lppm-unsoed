import 'dotenv/config';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      passwordHash: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`\nFound ${users.length} user(s) in database:\n`);
  console.log('--------------------------------------------------------------------------------');
  console.log('Role'.padEnd(14) + 'Email'.padEnd(32) + 'Active'.padEnd(10) + 'Password Match (ChangeMe123!)');
  console.log('--------------------------------------------------------------------------------');

  for (const user of users) {
    const isDefaultPassword = await bcrypt.compare('ChangeMe123!', user.passwordHash);
    console.log(
      user.role.padEnd(14) +
      user.email.padEnd(32) +
      String(user.isActive).padEnd(10) +
      (isDefaultPassword ? 'YES (matches ChangeMe123!)' : 'NO (custom password)')
    );
  }
  console.log('--------------------------------------------------------------------------------\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
