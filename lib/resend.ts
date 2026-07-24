import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Verified sending domain/address configured in the Resend dashboard.
export const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? 'KEP LPPM Unsoed <noreply@kep-lppm.unsoed.ac.id>';
