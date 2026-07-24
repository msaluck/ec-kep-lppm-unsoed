import { randomBytes } from 'node:crypto';

// Not sequential by design — a DB-count-based sequence would race under
// concurrent submissions. Collisions are astronomically unlikely (4 bytes),
// but callers should still retry once on a Prisma P2002 unique violation.
export function generateApplicationNumber(): string {
  const year = new Date().getFullYear();
  const code = randomBytes(4).toString('hex').toUpperCase();
  return `EC-KEP-${year}-${code}`;
}
