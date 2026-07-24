import type { ReactElement } from 'react';
import type { NotificationEvent } from '@prisma/client';
import { resend, RESEND_FROM } from '@/lib/resend';
import { prisma } from '@/lib/prisma';

type SendAndLogNotificationInput = {
  applicationId: string | null;
  userId: string | null;
  event: NotificationEvent;
  to: string;
  subject: string;
  text?: string;
  react?: ReactElement;
  attachments?: { filename: string; content: Buffer }[];
};

// Best-effort email send via Resend, always followed by a NotificationLog
// row (SENT or FAILED) so delivery failures are visible without ever
// failing the workflow action that triggered the notification.
export async function sendAndLogNotification(input: SendAndLogNotificationInput): Promise<void> {
  let status: 'SENT' | 'FAILED' = 'SENT';
  let resendMessageId: string | undefined;
  let errorMessage: string | undefined;

  try {
    // `react` XOR `text` is guaranteed by every call site below; Resend's
    // SDK types a single discriminated payload so a cast is needed here.
    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: input.to,
      subject: input.subject,
      text: input.text,
      react: input.react,
      attachments: input.attachments,
    } as Parameters<typeof resend.emails.send>[0]);

    if (error) throw new Error(error.message);
    resendMessageId = data?.id;
  } catch (err) {
    status = 'FAILED';
    errorMessage = err instanceof Error ? err.message : 'Unknown error sending email';
  }

  await prisma.notificationLog.create({
    data: {
      applicationId: input.applicationId,
      userId: input.userId,
      recipientEmail: input.to,
      event: input.event,
      subject: input.subject,
      status,
      resendMessageId,
      errorMessage,
      sentAt: status === 'SENT' ? new Date() : null,
    },
  });
}
