'use server';

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { finalizeApprovalWithDocument } from '@/lib/finalize-approval';
import { generateExemptionLetterPdf } from '@/lib/pdf/exemption-letter';
import ExemptionLetterEmail from '@/emails/ExemptionLetterEmail';

const ApproveExemptionInput = z.object({
  applicationId: z.string().min(1),
  decisionNotes: z.string().max(2000).optional(),
});

type ApproveExemptionResult = { success: true; documentId: string } | { success: false; error: string };

// Milestone 3a (Exempted track) — Chairman approval of the exemption
// letter. Skips the Tim Penelaah / Rapat Pleno review entirely and goes
// straight to APPROVED. Generates the Exemption Letter PDF and hands off
// to finalizeApprovalWithDocument for the shared persistence/notify
// sequence (see lib/finalize-approval.ts, also used by approve-application.ts).
export async function approveExemption(
  input: z.infer<typeof ApproveExemptionInput>,
): Promise<ApproveExemptionResult> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;

  if (!sessionUser?.id || sessionUser.role !== 'CHAIRMAN') {
    return { success: false, error: 'Unauthorized: only the Chairman/Secretary may approve an exemption.' };
  }

  const parsed = ApproveExemptionInput.safeParse(input);
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
  if (application.track !== 'EXEMPTED' || application.status !== 'EXEMPTED_PROCESSING') {
    return {
      success: false,
      error: `Application is not awaiting exemption approval (current status: ${application.status}).`,
    };
  }

  const chairmanName = session!.user!.name ?? 'Ketua KEP';
  const pdfBuffer = await generateExemptionLetterPdf({
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
    documentType: 'EXEMPTION_LETTER',
    pdfBuffer,
    fileNamePrefix: 'exemption-letter',
    emailSubject: `Surat Keterangan Bebas Kaji Etik - ${application.applicationNumber}`,
    emailAttachmentName: `Exemption-Letter-${application.applicationNumber}.pdf`,
    emailReact: ExemptionLetterEmail({
      researcherName: application.researcher.name,
      applicationNumber: application.applicationNumber,
      title: application.title,
    }),
  });

  revalidatePath(`/applications/${application.id}`);

  return { success: true, documentId: document.id };
}
