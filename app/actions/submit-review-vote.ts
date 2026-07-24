'use server';

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendAndLogNotification } from '@/lib/notify';
import { addWorkingDays } from '@/lib/working-days';

const FINAL_DECISION_DEADLINE_DAYS = 5; // Milestone 5 clock, started once all reviewers have voted

const SubmitReviewVoteInput = z.object({
  applicationId: z.string().min(1),
  vote: z.enum(['AGREE', 'DISAGREE']),
  comments: z.string().max(2000).optional(),
});

type SubmitReviewVoteResult = { success: true; reviewComplete: boolean } | { success: false; error: string };

// Milestone 4 (Expedited track) — a single reviewer casts Agree/Disagree.
// Once every assigned reviewer has voted, the application automatically
// advances to PENDING_FINAL_DECISION and starts the Milestone 5 clock
// (5 working days) for the Chairman's final decision.
export async function submitReviewVote(
  input: z.infer<typeof SubmitReviewVoteInput>,
): Promise<SubmitReviewVoteResult> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;

  if (!sessionUser?.id || sessionUser.role !== 'REVIEWER') {
    return { success: false, error: 'Unauthorized: only an assigned Review Team member may vote.' };
  }

  const parsed = SubmitReviewVoteInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input.' };
  }
  const { applicationId, vote, comments } = parsed.data;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { chairman: { select: { id: true, name: true, email: true } } },
  });
  if (!application) {
    return { success: false, error: 'Application not found.' };
  }
  if (application.status !== 'EXPEDITED_ASSIGNED' && application.status !== 'EXPEDITED_REVIEWING') {
    return {
      success: false,
      error: `Application is not currently open for review voting (current status: ${application.status}).`,
    };
  }

  const assignment = await prisma.reviewAssignment.findUnique({
    where: { applicationId_reviewerId: { applicationId, reviewerId: sessionUser.id } },
  });
  if (!assignment) {
    return { success: false, error: 'You are not an assigned reviewer for this application.' };
  }
  if (assignment.vote !== 'PENDING') {
    return { success: false, error: 'You have already submitted your vote for this application.' };
  }

  const now = new Date();
  let finalDecisionDeadline: Date | null = null;

  const reviewComplete = await prisma.$transaction(async (tx) => {
    await tx.reviewAssignment.update({
      where: { id: assignment.id },
      data: { vote, comments, votedAt: now },
    });

    if (application.status === 'EXPEDITED_ASSIGNED') {
      await tx.application.update({
        where: { id: application.id },
        data: { status: 'EXPEDITED_REVIEWING' },
      });
    }

    const remainingVotes = await tx.reviewAssignment.count({
      where: { applicationId, vote: 'PENDING' },
    });
    const allVoted = remainingVotes === 0;

    if (allVoted) {
      finalDecisionDeadline = addWorkingDays(now, FINAL_DECISION_DEADLINE_DAYS);
      await tx.application.update({
        where: { id: application.id },
        data: { status: 'PENDING_FINAL_DECISION', finalDecisionDeadline },
      });
      await tx.applicationStatusHistory.create({
        data: {
          applicationId,
          fromStatus: 'EXPEDITED_REVIEWING',
          toStatus: 'PENDING_FINAL_DECISION',
          actorId: sessionUser.id,
          notes: 'All reviewer votes received.',
          deadlineAt: finalDecisionDeadline,
        },
      });
    }

    return allVoted;
  });

  if (reviewComplete && application.chairman) {
    await sendAndLogNotification({
      applicationId,
      userId: application.chairman.id,
      event: 'REVIEW_COMPLETED',
      to: application.chairman.email,
      subject: `Telaah Selesai - ${application.applicationNumber}`,
      text: `Seluruh Tim Penelaah telah memberikan suara untuk aplikasi ${application.applicationNumber} ("${application.title}"). Mohon keputusan akhir paling lambat ${finalDecisionDeadline!.toLocaleDateString('id-ID')}.`,
    });
  }

  revalidatePath(`/applications/${applicationId}`);
  return { success: true, reviewComplete };
}
