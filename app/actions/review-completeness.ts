'use server';

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendAndLogNotification } from '@/lib/notify';
import { addWorkingDays } from '@/lib/working-days';

const CLASSIFICATION_DEADLINE_DAYS = 3; // Milestone 3 clock, started once berkas lengkap

const ReviewCompletenessInput = z.object({
  applicationId: z.string().min(1),
  decision: z.enum(['COMPLETE', 'INCOMPLETE']),
  notes: z.string().max(2000).optional(),
});

type ReviewCompletenessResult = { success: true } | { success: false; error: string };

// Milestone 2 — Secretariat completeness check (2 working-day deadline).
// COMPLETE forwards to the Chairman/Secretary and starts the Milestone 3
// classification clock; INCOMPLETE returns the application to the
// researcher for resubmission.
export async function reviewCompleteness(
  input: z.infer<typeof ReviewCompletenessInput>,
): Promise<ReviewCompletenessResult> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;

  if (!sessionUser?.id || sessionUser.role !== 'SECRETARIAT') {
    return { success: false, error: 'Unauthorized: only the Secretariat may perform the completeness check.' };
  }

  const parsed = ReviewCompletenessInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input.' };
  }
  const { applicationId, decision, notes } = parsed.data;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { researcher: true },
  });
  if (!application) {
    return { success: false, error: 'Application not found.' };
  }
  if (application.status !== 'SUBMITTED') {
    return {
      success: false,
      error: `Application is not awaiting a completeness check (current status: ${application.status}).`,
    };
  }

  const isComplete = decision === 'COMPLETE';
  const nextStatus = isComplete ? 'FORWARDED_TO_CHAIRMAN' : 'RETURNED_INCOMPLETE';
  const classificationDeadline = isComplete ? addWorkingDays(new Date(), CLASSIFICATION_DEADLINE_DAYS) : null;

  await prisma.$transaction([
    prisma.application.update({
      where: { id: application.id },
      data: {
        status: nextStatus,
        secretariatCheckedById: sessionUser.id,
        secretariatCheckedAt: new Date(),
        classificationDeadline,
      },
    }),
    prisma.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: application.status,
        toStatus: nextStatus,
        actorId: sessionUser.id,
        notes,
        deadlineAt: classificationDeadline,
      },
    }),
  ]);

  await sendAndLogNotification({
    applicationId: application.id,
    userId: application.researcherId,
    event: isComplete ? 'FORWARDED_TO_CHAIRMAN' : 'RETURNED_INCOMPLETE',
    to: application.researcher.email,
    subject: isComplete
      ? `Berkas Lengkap - ${application.applicationNumber}`
      : `Berkas Tidak Lengkap - ${application.applicationNumber}`,
    text: isComplete
      ? `Berkas aplikasi Anda (${application.applicationNumber}) dinyatakan lengkap dan diteruskan ke Ketua/Sekretaris KEP untuk klasifikasi paling lambat ${classificationDeadline!.toLocaleDateString('id-ID')}.`
      : `Berkas aplikasi Anda (${application.applicationNumber}) dinyatakan tidak lengkap oleh Sekretariat.\n\nCatatan: ${notes ?? '-'}\n\nSilakan lengkapi dokumen dan ajukan kembali.`,
  });

  revalidatePath(`/applications/${application.id}`);
  return { success: true };
}
