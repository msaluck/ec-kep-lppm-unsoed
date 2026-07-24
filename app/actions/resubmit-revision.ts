'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendAndLogNotification } from '@/lib/notify';
import { isUploadedFile, persistUpload } from '@/lib/documents';
import { addWorkingDays } from '@/lib/working-days';
import { REVISION_ROUND_DEADLINE_DAYS } from '@/lib/revision-policy';

type ResubmitRevisionResult = { success: true } | { success: false; error: string };

// Revisi I / Revisi II — researcher resubmits the revised Research
// Protocol after a REVISION_NEEDED decision. Moves the application to
// REVISION_1_SUBMITTED or REVISION_2_SUBMITTED (based on the round already
// set by decide-final-outcome.ts) and starts that round's re-review clock
// (10 working days for Revisi I, 5 for Revisi II) before it lands back on
// PENDING_FINAL_DECISION-equivalent handling in approve-application.ts /
// decide-final-outcome.ts.
export async function resubmitRevision(formData: FormData): Promise<ResubmitRevisionResult> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;

  if (!sessionUser?.id || sessionUser.role !== 'RESEARCHER') {
    return { success: false, error: 'Unauthorized: only the submitting researcher may resubmit a revision.' };
  }

  const applicationId = formData.get('applicationId');
  const responseNotes = formData.get('responseNotes');
  const revisedProtocol = formData.get('revisedProtocol');
  const supportingDocuments = formData.getAll('supportingDocuments');

  if (typeof applicationId !== 'string' || applicationId.length === 0) {
    return { success: false, error: 'Missing applicationId.' };
  }
  if (!isUploadedFile(revisedProtocol)) {
    return { success: false, error: 'Revised Research Protocol document is required.' };
  }

  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application) {
    return { success: false, error: 'Application not found.' };
  }
  if (application.researcherId !== sessionUser.id) {
    return { success: false, error: 'You may only resubmit your own application.' };
  }
  if (application.status !== 'REVISION_REQUIRED') {
    return {
      success: false,
      error: `Application is not awaiting a revision resubmission (current status: ${application.status}).`,
    };
  }

  const round = application.revisionRound; // set to 1 or 2 by decide-final-outcome.ts
  if (round < 1 || round > REVISION_ROUND_DEADLINE_DAYS.length) {
    return { success: false, error: `Unexpected revision round (${round}).` };
  }

  const uploads: Array<{ file: File; documentType: 'REVISION_RESPONSE' }> = [
    { file: revisedProtocol, documentType: 'REVISION_RESPONSE' },
  ];
  for (const entry of supportingDocuments) {
    if (isUploadedFile(entry)) uploads.push({ file: entry, documentType: 'REVISION_RESPONSE' });
  }

  const savedDocuments = await Promise.all(
    uploads.map(({ file, documentType }) => persistUpload(file, application.applicationNumber, documentType)),
  );

  const nextStatus = round === 1 ? 'REVISION_1_SUBMITTED' : 'REVISION_2_SUBMITTED';
  const finalDecisionDeadline = addWorkingDays(new Date(), REVISION_ROUND_DEADLINE_DAYS[round - 1]);

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: application.id },
      data: {
        status: nextStatus,
        resubmissionDeadline: null,
        finalDecisionDeadline,
        documents: {
          create: savedDocuments.map((doc) => ({
            ...doc,
            revisionRound: round,
            uploadedById: sessionUser.id as string,
          })),
        },
      },
    });

    await tx.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: 'REVISION_REQUIRED',
        toStatus: nextStatus,
        actorId: sessionUser.id,
        notes: typeof responseNotes === 'string' ? responseNotes : undefined,
        deadlineAt: finalDecisionDeadline,
      },
    });
  });

  if (application.chairmanId) {
    const chairman = await prisma.user.findUnique({ where: { id: application.chairmanId } });
    if (chairman) {
      await sendAndLogNotification({
        applicationId: application.id,
        userId: chairman.id,
        event: 'REVISION_SUBMITTED',
        to: chairman.email,
        subject: `Revisi ${round} Diterima - ${application.applicationNumber}`,
        text: `Peneliti telah mengirimkan dokumen Revisi ${round} untuk aplikasi ${application.applicationNumber} ("${application.title}"). Mohon keputusan akhir paling lambat ${finalDecisionDeadline.toLocaleDateString('id-ID')}.`,
      });
    }
  }

  revalidatePath(`/applications/${application.id}`);
  return { success: true };
}
