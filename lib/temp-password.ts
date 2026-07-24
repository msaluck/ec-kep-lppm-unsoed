import { randomBytes } from 'node:crypto';

// Shared by create-user.ts and reset-user-password.ts - both need to hand
// an Admin a one-time password to relay to the account holder.
export function generateTempPassword(): string {
  return randomBytes(9).toString('base64url');
}
