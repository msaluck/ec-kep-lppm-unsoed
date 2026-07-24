'use server';

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { finalizeApprovalWithDocument } from '@/lib/finalize-approval';
import { generateEthicalClearancePdf } from '@/lib/pdf/ethical-clearance';
import EthicalClearanceEmail from '@/emails/EthicalClearanceEmail';

const ApproveApplicationInput = z.object({
  applicationId: z.string().min(1),
  decisionNotes: z.string().max(2000).optional(),
});

type ApproveApplicationResult =
  | { success: true; documentId: string }
  | { success: false; error: string };

const AWAITING_DECISION_STATUSES = ['PENDING_FINAL_DECISION', 'REVISION_1_SUBMITTED', 'REVISION_2_SUBMITTED'] as const;

// Milestone 5 — Chairman's final decision (APPROVED branch, Expedited/Full
// Board tracks). Generates the Ethical Clearance PDF and hands off to
// finalizeApprovalWithDocument for the shared write-to-disk -> transaction
// -> notify sequence (see lib/finalize-approval.ts).
export async function approveApplication(input: z.infer<typeof ApproveApplicationInput>): Promise<ApproveApplicationResult> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;

  if (!sessionUser?.id || sessionUser.role !== 'CHAIRMAN') {
    return { success: false, error: 'Unauthorized: only the Chairman/Secretary may issue a final decision.' };
  }

  const parsed = ApproveApplicationInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input.' };
  }
  const { applicationId, decisionNotes } = parsed.data;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { researcher: true },
  });

  if (!application) {
    return { success: false, error: 'Application not found.' };
  }
  if (!AWAITING_DECISION_STATUSES.includes(application.status as (typeof AWAITING_DECISION_STATUSES)[number])) {
    return { success: false, error: `Application is not awaiting a final decision (current status: ${application.status}).` };
  }

  const chairmanName = session!.user!.name ?? 'Ketua KEP';
  const pdfBuffer = await generateEthicalClearancePdf({
    applicationNumber: application.applicationNumber,
    title: application.title,
    researcherName: application.researcher.name,
    researcherInstitution: application.researcher.institution,
    chairmanName,
    decidedAt: new Date(),
  });

  const document = await finalizeApprovalWithDocument({
    application,
    chairmanId: sessionUser.id,
    decisionNotes,
    documentType: 'ETHICAL_CLEARANCE_LETTER',
    pdfBuffer,
    fileNamePrefix: 'ethical-clearance',
    emailSubject: `Persetujuan Etik - ${application.applicationNumber}`,
    emailAttachmentName: `Ethical-Clearance-${application.applicationNumber}.pdf`,
    emailReact: EthicalClearanceEmail({
      researcherName: application.researcher.name,
      applicationNumber: application.applicationNumber,
      title: application.title,
    }),
  });

  revalidatePath(`/applications/${application.id}`);

  return { success: true, documentId: document.id };
}
