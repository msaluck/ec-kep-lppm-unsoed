import type { Application, ApplicationStatus, User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendAndLogNotification } from '@/lib/notify';
import { getCurrentDeadline } from '@/lib/current-deadline';

// Remind when a deadline is overdue, due today, or due tomorrow. Shared by
// scripts/send-deadline-reminders.ts (CloudPanel cron / manual run) and
// app/api/cron/reminders/route.ts (Vercel Cron).
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

export type DeadlineReminderResult = {
  sent: number;
  skippedNotDueYet: number;
  skippedAlreadyReminded: number;
  skippedNoDeadline: number;
};

export async function runDeadlineReminders(): Promise<DeadlineReminderResult> {
  const applications = await prisma.application.findMany({
    where: { status: { in: REMINDER_STATUSES } },
    include: { researcher: true },
  });

  const result: DeadlineReminderResult = {
    sent: 0,
    skippedNotDueYet: 0,
    skippedAlreadyReminded: 0,
    skippedNoDeadline: 0,
  };

  for (const application of applications) {
    const deadlineInfo = getCurrentDeadline(application);
    if (!deadlineInfo?.deadline) {
      result.skippedNoDeadline += 1;
      continue;
    }

    if (daysUntil(deadlineInfo.deadline) > DAYS_AHEAD_THRESHOLD) {
      result.skippedNotDueYet += 1;
      continue;
    }

    if (await alreadyRemindedToday(application.id)) {
      result.skippedAlreadyReminded += 1;
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

    result.sent += 1;
  }

  return result;
}
