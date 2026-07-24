import 'dotenv/config';
import type { Application, ApplicationStatus, User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendAndLogNotification } from '@/lib/notify';
import { getCurrentDeadline } from '@/lib/current-deadline';

// Remind when a deadline is overdue, due today, or due tomorrow. Meant to
// run once daily via a CloudPanel cron entry, e.g.:
//   0 7 * * * cd /home/cloudpanel/htdocs/<site> && npm run reminders >> storage/logs/reminders.log 2>&1
const DAYS_AHEAD_THRESHOLD = 1;

const REMINDER_STATUSES: ApplicationStatus[] = [
  'SUBMITTED',
  'FORWARDED_TO_CHAIRMAN',
  'EXPEDITED_ASSIGNED',
  'EXPEDITED_REVIEWING',
  'FULL_BOARD_SCHEDULING',
  'FULL_BOARD_MEETING',
  'PENDING_FINAL_DECISION',
  'REVISION_1_SUBMITTED',
  'REVISION_2_SUBMITTED',
  'REVISION_REQUIRED',
];

type Recipient = { id: string | null; email: string };

async function getRecipients(application: Application & { researcher: User }): Promise<Recipient[]> {
  switch (application.status) {
    case 'SUBMITTED':
      return (await prisma.user.findMany({ where: { role: 'SECRETARIAT', isActive: true } })).map(toRecipient);
    case 'FORWARDED_TO_CHAIRMAN':
    case 'PENDING_FINAL_DECISION':
    case 'REVISION_1_SUBMITTED':
    case 'REVISION_2_SUBMITTED':
      return (await prisma.user.findMany({ where: { role: 'CHAIRMAN', isActive: true } })).map(toRecipient);
    case 'EXPEDITED_ASSIGNED':
    case 'EXPEDITED_REVIEWING': {
      const pending = await prisma.reviewAssignment.findMany({
        where: { applicationId: application.id, vote: 'PENDING' },
        include: { reviewer: true },
      });
      return pending.map((assignment) => toRecipient(assignment.reviewer));
    }
    case 'FULL_BOARD_SCHEDULING':
    case 'FULL_BOARD_MEETING':
      return (
        await prisma.user.findMany({ where: { role: { in: ['CHAIRMAN', 'SECRETARIAT'] }, isActive: true } })
      ).map(toRecipient);
    case 'REVISION_REQUIRED':
      return [toRecipient(application.researcher)];
    default:
      return [];
  }
}

function toRecipient(user: User): Recipient {
  return { id: user.id, email: user.email };
}

function daysUntil(date: Date): number {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTarget = new Date(date);
  startOfTarget.setHours(0, 0, 0, 0);
  return Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86_400_000);
}

async function alreadyRemindedToday(applicationId: string): Promise<boolean> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const existing = await prisma.notificationLog.findFirst({
    where: { applicationId, event: 'DEADLINE_REMINDER', createdAt: { gte: startOfToday } },
  });
  return existing !== null;
}

async function main() {
  const applications = await prisma.application.findMany({
    where: { status: { in: REMINDER_STATUSES } },
    include: { researcher: true },
  });

  let sent = 0;
  let skippedNoDeadline = 0;
  let skippedNotDueYet = 0;
  let skippedAlreadyReminded = 0;

  for (const application of applications) {
    const deadlineInfo = getCurrentDeadline(application);
    if (!deadlineInfo?.deadline) {
      skippedNoDeadline += 1;
      continue;
    }

    if (daysUntil(deadlineInfo.deadline) > DAYS_AHEAD_THRESHOLD) {
      skippedNotDueYet += 1;
      continue;
    }

    if (await alreadyRemindedToday(application.id)) {
      skippedAlreadyReminded += 1;
      continue;
    }

    const recipients = await getRecipients(application);
    const overdue = daysUntil(deadlineInfo.deadline) < 0;
    const deadlineLabel = deadlineInfo.deadline.toLocaleDateString('id-ID');

    await Promise.all(
      recipients.map((recipient) =>
        sendAndLogNotification({
          applicationId: application.id,
          userId: recipient.id,
          event: 'DEADLINE_REMINDER',
          to: recipient.email,
          subject: `${overdue ? '[Lewat Batas] ' : '[Pengingat] '}${deadlineInfo.label} - ${application.applicationNumber}`,
          text: `${deadlineInfo.label} untuk aplikasi ${application.applicationNumber} ("${application.title}") ${
            overdue ? 'telah lewat batas waktu' : 'akan jatuh tempo'
          } pada ${deadlineLabel}.`,
        }),
      ),
    );

    sent += 1;
  }

  console.log(
    `Deadline reminders: ${sent} sent, ${skippedNotDueYet} not due yet, ${skippedAlreadyReminded} already reminded today, ${skippedNoDeadline} without an active deadline.`,
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
