import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

// Verified sending domain/address configured in the Resend dashboard.
export const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? 'KEP LPPM Unsoed <noreply@kep-lppm.unsoed.ac.id>';
