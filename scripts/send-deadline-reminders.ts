import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { runDeadlineReminders } from '@/lib/deadline-reminders';

// CLI entry point for local/manual runs and the CloudPanel cron entry:
//   0 7 * * * cd /home/cloudpanel/htdocs/<site> && npm run reminders >> storage/logs/reminders.log 2>&1
// On Vercel, app/api/cron/reminders/route.ts calls the same shared logic
// via Vercel Cron instead, since there is no persistent server to cron
// against.
async function main() {
  const result = await runDeadlineReminders();
  console.log(
    `Deadline reminders: ${result.sent} sent, ${result.skippedNotDueYet} not due yet, ${result.skippedAlreadyReminded} already reminded today, ${result.skippedNoDeadline} without an active deadline.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
