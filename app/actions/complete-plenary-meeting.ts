'use server';

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendAndLogNotification } from '@/lib/notify';
import { addWorkingDays } from '@/lib/working-days';

const FINAL_DECISION_DEADLINE_DAYS = 5; // Milestone 5 clock, started once the plenary meeting concludes

const CompletePlenaryMeetingInput = z.object({
  applicationId: z.string().min(1),
  minutesNotes: z.string().max(5000).optional(),
});

type CompletePlenaryMeetingResult = { success: true } | { success: false; error: string };

// Milestone 4 (Full Board track) — records the outcome of the plenary
// meeting (with researcher clarifications) and advances the application to
// PENDING_FINAL_DECISION, starting the Milestone 5 clock (5 working days)
// for the Chairman's final decision — the same status the Expedited track
// reaches once all reviewer votes are in.
export async function completePlenaryMeeting(
  input: z.infer<typeof CompletePlenaryMeetingInput>,
): Promise<CompletePlenaryMeetingResult> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;

  if (!sessionUser?.id || (sessionUser.role !== 'SECRETARIAT' && sessionUser.role !== 'CHAIRMAN')) {
    return { success: false, error: 'Unauthorized: only the Secretariat or Chairman may record the plenary outcome.' };
  }

  const parsed = CompletePlenaryMeetingInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input.' };
  }
  const { applicationId, minutesNotes } = parsed.data;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { chairman: { select: { id: true, name: true, email: true } }, plenaryMeeting: true },
  });
  if (!application) {
    return { success: false, error: 'Application not found.' };
  }
  if (application.status !== 'FULL_BOARD_MEETING') {
    return {
      success: false,
      error: `Application is not in an active plenary meeting (current status: ${application.status}).`,
    };
  }
  if (!application.plenaryMeeting) {
    return { success: false, error: 'No plenary meeting record exists for this application.' };
  }
  if (!application.chairman) {
    return { success: false, error: 'Application has no assigned Chairman to notify for the final decision.' };
  }

  const finalDecisionDeadline = addWorkingDays(new Date(), FINAL_DECISION_DEADLINE_DAYS);

  await prisma.$transaction([
    prisma.plenaryMeeting.update({
      where: { applicationId },
      data: { minutesNotes },
    }),
    prisma.application.update({
      where: { id: applicationId },
      data: { status: 'PENDING_FINAL_DECISION', finalDecisionDeadline },
    }),
    prisma.applicationStatusHistory.create({
      data: {
        applicationId,
        fromStatus: 'FULL_BOARD_MEETING',
        toStatus: 'PENDING_FINAL_DECISION',
        actorId: sessionUser.id,
        notes: minutesNotes,
        deadlineAt: finalDecisionDeadline,
      },
    }),
  ]);

  await sendAndLogNotification({
    applicationId,
    userId: application.chairman.id,
    event: 'REVIEW_COMPLETED',
    to: application.chairman.email,
    subject: `Rapat Pleno Selesai - ${application.applicationNumber}`,
    text: `Rapat Pleno untuk aplikasi ${application.applicationNumber} ("${application.title}") telah selesai. Mohon keputusan akhir paling lambat ${finalDecisionDeadline.toLocaleDateString('id-ID')}.`,
  });

  revalidatePath(`/applications/${applicationId}`);
  return { success: true };
}
