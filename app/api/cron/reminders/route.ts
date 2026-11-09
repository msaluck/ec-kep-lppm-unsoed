import { NextResponse } from 'next/server';
import { runDeadlineReminders } from '@/lib/deadline-reminders';

// Vercel Cron entry point (see vercel.json) — there is no persistent server
// on Vercel to run scripts/send-deadline-reminders.ts against directly, so
// Vercel instead invokes this route on schedule. Vercel signs its own cron
// requests with `Authorization: Bearer ${CRON_SECRET}`; anyone else calling
// this URL without that header is rejected.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const result = await runDeadlineReminders();
  return NextResponse.json(result);
}
