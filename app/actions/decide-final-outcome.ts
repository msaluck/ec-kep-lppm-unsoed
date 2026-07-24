'use server';

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendAndLogNotification } from '@/lib/notify';
import { addWorkingDays } from '@/lib/working-days';
import { REVISION_ROUND_DEADLINE_DAYS, MAX_REVISION_ROUNDS } from '@/lib/revision-policy';

const AWAITING_DECISION_STATUSES = ['PENDING_FINAL_DECISION', 'REVISION_1_SUBMITTED', 'REVISION_2_SUBMITTED'] as const;

const DecideFinalOutcomeInput = z.object({
  applicationId: z.string().min(1),
  decisionType: z.enum(['REVISION_NEEDED', 'REJECTED']),
  decisionNotes: z.string().min(1, 'Decision notes are required.').max(2000),
});

type DecideFinalOutcomeResult = { success: true } | { success: false; error: string };

// Milestone 5 — Chairman's final decision, the two non-approval branches.
// APPROVED is handled by approve-application.ts / approve-exemption.ts
// (those generate the confirmation PDF); this covers:
//   - REVISION_NEEDED (Saran perbaikan): capped at two rounds (Revisi I,
//     Revisi II) per the workflow — a third request must be resolved as
//     either REJECTED or APPROVED instead.
//   - REJECTED (Tidak disetujui): terminal.
export async function decideFinalOutcome(
  input: z.infer<typeof DecideFinalOutcomeInput>,
): Promise<DecideFinalOutcomeResult> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;

  if (!sessionUser?.id || sessionUser.role !== 'CHAIRMAN') {
    return { success: false, error: 'Unauthorized: only the Chairman/Secretary may issue a final decision.' };
  }

  const parsed = DecideFinalOutcomeInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const { applicationId, decisionType, decisionNotes } = parsed.data;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { researcher: true },
  });
  if (!application) {
    return { success: false, error: 'Application not found.' };
  }
  if (!AWAITING_DECISION_STATUSES.includes(application.status as (typeof AWAITING_DECISION_STATUSES)[number])) {
    return {
      success: false,
      error: `Application is not awaiting a final decision (current status: ${application.status}).`,
    };
  }

  const decidedAt = new Date();
  let nextStatus: 'REVISION_REQUIRED' | 'REJECTED';
  let nextRevisionRound = application.revisionRound;
  let resubmissionDeadline: Date | null = null;

  if (decisionType === 'REVISION_NEEDED') {
    nextRevisionRound = application.revisionRound + 1;
    if (nextRevisionRound > MAX_REVISION_ROUNDS) {
      return {
        success: false,
        error: `Maximum of ${MAX_REVISION_ROUNDS} revision rounds already used; this application must be Approved or Rejected.`,
      };
    }
    resubmissionDeadline = addWorkingDays(decidedAt, REVISION_ROUND_DEADLINE_DAYS[nextRevisionRound - 1]);
    nextStatus = 'REVISION_REQUIRED';
  } else {
    nextStatus = 'REJECTED';
  }

  await prisma.$transaction([
    prisma.application.update({
      where: { id: application.id },
      data: {
        status: nextStatus,
        decisionType,
        decisionNotes,
        decidedAt,
        chairmanId: sessionUser.id,
        revisionRound: nextRevisionRound,
        resubmissionDeadline,
      },
    }),
    prisma.applicationStatusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: application.status,
        toStatus: nextStatus,
        actorId: sessionUser.id,
        notes: decisionNotes,
        deadlineAt: resubmissionDeadline,
      },
    }),
  ]);

  await sendAndLogNotification({
    applicationId: application.id,
    userId: application.researcherId,
    event: decisionType === 'REVISION_NEEDED' ? 'FINAL_DECISION_REVISION' : 'FINAL_DECISION_REJECTED',
    to: application.researcher.email,
    subject:
      decisionType === 'REVISION_NEEDED'
        ? `Saran Perbaikan - ${application.applicationNumber}`
        : `Keputusan Akhir - ${application.applicationNumber}`,
    text:
      decisionType === 'REVISION_NEEDED'
        ? `Aplikasi Anda (${application.applicationNumber}) memerlukan perbaikan (Revisi ${nextRevisionRound}). Catatan: ${decisionNotes}\n\nMohon ajukan kembali dokumen yang telah diperbaiki paling lambat ${resubmissionDeadline!.toLocaleDateString('id-ID')}.`
        : `Mohon maaf, aplikasi Anda (${application.applicationNumber}) dinyatakan TIDAK DISETUJUI oleh Komisi Etik Penelitian.\n\nCatatan: ${decisionNotes}`,
  });

  revalidatePath(`/applications/${application.id}`);
  return { success: true };
}
