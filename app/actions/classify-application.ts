'use server';

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendAndLogNotification } from '@/lib/notify';
import { addWorkingDays } from '@/lib/working-days';

const REVIEW_DEADLINE_DAYS = 10; // Milestone 4 cap, applies to Expedited and Full Board only

const ClassifyApplicationInput = z
  .object({
    applicationId: z.string().min(1),
    track: z.enum(['EXEMPTED', 'EXPEDITED', 'FULL_BOARD']),
    notes: z.string().max(2000).optional(),
    reviewerIds: z.array(z.string().min(1)).optional(),
  })
  .refine((data) => data.track !== 'EXPEDITED' || (data.reviewerIds?.length ?? 0) > 0, {
    message: 'At least one reviewer must be assigned for the Expedited track.',
    path: ['reviewerIds'],
  });

const TRACK_STATUS = {
  EXEMPTED: 'EXEMPTED_PROCESSING',
  EXPEDITED: 'EXPEDITED_ASSIGNED',
  FULL_BOARD: 'FULL_BOARD_SCHEDULING',
} as const;

type ClassifyApplicationResult = { success: true } | { success: false; error: string };

// Milestone 3 — Chairman/Secretary classifies a complete application into
// one of three streams (3 working-day deadline to reach this point).
//   - EXEMPTED: skips review, proceeds straight to exemption letter + chair
//     approval (handled by a separate approval action).
//   - EXPEDITED: assigns named reviewers who each vote Agree/Disagree.
//   - FULL_BOARD: queued for plenary meeting scheduling (separate action).
// Expedited and Full Board both start the Milestone 4 review clock
// (max 10 working days).
export async function classifyApplication(
  input: z.infer<typeof ClassifyApplicationInput>,
): Promise<ClassifyApplicationResult> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;

  if (!sessionUser?.id || sessionUser.role !== 'CHAIRMAN') {
    return { success: false, error: 'Unauthorized: only the Chairman/Secretary may classify an application.' };
  }

  const parsed = ClassifyApplicationInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const { applicationId, track, notes, reviewerIds } = parsed.data;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { researcher: true },
  });
  if (!application) {
    return { success: false, error: 'Application not found.' };
  }
  if (application.status !== 'FORWARDED_TO_CHAIRMAN') {
    return {
      success: false,
      error: `Application is not awaiting classification (current status: ${application.status}).`,
    };
  }

  let reviewers: { id: string; name: string; email: string }[] = [];
  if (track === 'EXPEDITED') {
    reviewers = await prisma.user.findMany({
      where: { id: { in: reviewerIds }, role: 'REVIEWER' },
      select: { id: true, name: true, email: true },
    });
    if (reviewers.length !== reviewerIds!.length) {
      return { success: false, error: 'One or more selected reviewers were not found.' };
    }
  }

  const now = new Date();
  const nextStatus = TRACK_STATUS[track];
  const reviewDeadline = track === 'EXEMPTED' ? null : addWorkingDays(now, REVIEW_DEADLINE_DAYS);

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: application.id },
      data: {
        status: nextStatus,
        track,
        chairmanId: sessionUser.id,
        classifiedAt: now,
        reviewDeadline,
      },
    });

    await tx.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: application.status,
        toStatus: nextStatus,
        actorId: sessionUser.id,
        notes,
        deadlineAt: reviewDeadline,
      },
    });

    if (track === 'EXPEDITED') {
      await tx.reviewAssignment.createMany({
        data: reviewers.map((reviewer) => ({
          applicationId: application.id,
          reviewerId: reviewer.id,
          deadline: reviewDeadline,
        })),
      });
    }
  });

  const researcherMessage = {
    EXEMPTED: `Aplikasi Anda (${application.applicationNumber}) diklasifikasikan sebagai EXEMPTED dan akan diproses melalui jalur surat keterangan bebas kaji etik.`,
    EXPEDITED: `Aplikasi Anda (${application.applicationNumber}) diklasifikasikan sebagai EXPEDITED dan sedang ditelaah oleh Tim Penelaah, paling lambat ${reviewDeadline!.toLocaleDateString('id-ID')}.`,
    FULL_BOARD: `Aplikasi Anda (${application.applicationNumber}) diklasifikasikan sebagai FULL BOARD dan akan dijadwalkan Rapat Pleno, paling lambat ${reviewDeadline!.toLocaleDateString('id-ID')}.`,
  }[track];

  await sendAndLogNotification({
    applicationId: application.id,
    userId: application.researcherId,
    event: 'CLASSIFIED',
    to: application.researcher.email,
    subject: `Klasifikasi Aplikasi - ${application.applicationNumber}`,
    text: researcherMessage,
  });

  if (track === 'EXPEDITED') {
    await Promise.all(
      reviewers.map((reviewer) =>
        sendAndLogNotification({
          applicationId: application.id,
          userId: reviewer.id,
          event: 'REVIEWER_ASSIGNED',
          to: reviewer.email,
          subject: `Penugasan Telaah - ${application.applicationNumber}`,
          text: `Anda ditugaskan sebagai Tim Penelaah untuk aplikasi ${application.applicationNumber} ("${application.title}"). Batas waktu telaah: ${reviewDeadline!.toLocaleDateString('id-ID')}.`,
        }),
      ),
    );
  }

  revalidatePath(`/applications/${application.id}`);
  return { success: true };
}
