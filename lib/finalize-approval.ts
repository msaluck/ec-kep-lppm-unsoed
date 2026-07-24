import path from 'node:path';
import type { ReactElement } from 'react';
import type { Application, DocumentType, User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendAndLogNotification } from '@/lib/notify';
import { writeFileToDisk } from '@/lib/storage';

type FinalizeApprovalInput = {
  application: Application & { researcher: User };
  chairmanId: string;
  decisionNotes?: string;
  documentType: DocumentType;
  pdfBuffer: Buffer;
  fileNamePrefix: string;
  emailSubject: string;
  emailAttachmentName: string;
  emailReact: ReactElement;
};

// Shared by approve-application.ts (Ethical Clearance) and
// approve-exemption.ts (Exemption Letter) — both approval paths write a
// generated PDF to disk, then run the same Application/StatusHistory/
// Document transaction, then send the same best-effort notification.
export async function finalizeApprovalWithDocument(input: FinalizeApprovalInput) {
  const decidedAt = new Date();
  const relativePath = path.join(
    'applications',
    input.application.applicationNumber,
    `${input.fileNamePrefix}-${Date.now()}.pdf`,
  );
  await writeFileToDisk(relativePath, input.pdfBuffer);

  const document = await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: input.application.id },
      data: {
        status: 'APPROVED',
        decisionType: 'APPROVED',
        decisionNotes: input.decisionNotes,
        decidedAt,
        chairmanId: input.chairmanId,
      },
    });

    await tx.applicationStatusHistory.create({
      data: {
        applicationId: input.application.id,
        fromStatus: input.application.status,
        toStatus: 'APPROVED',
        actorId: input.chairmanId,
        notes: input.decisionNotes,
      },
    });

    return tx.document.create({
      data: {
        applicationId: input.application.id,
        documentType: input.documentType,
        fileName: path.basename(relativePath),
        filePath: relativePath,
        fileSize: input.pdfBuffer.byteLength,
        mimeType: 'application/pdf',
        revisionRound: input.application.revisionRound,
        uploadedById: input.chairmanId,
      },
    });
  });

  await sendAndLogNotification({
    applicationId: input.application.id,
    userId: input.application.researcherId,
    event: 'FINAL_DECISION_APPROVED',
    to: input.application.researcher.email,
    subject: input.emailSubject,
    react: input.emailReact,
    attachments: [{ filename: input.emailAttachmentName, content: input.pdfBuffer }],
  });

  return document;
}
