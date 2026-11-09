'use server';

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteFile } from '@/lib/storage';

const DeleteDocumentInput = z.object({
  documentId: z.string().min(1),
});

type DeleteDocumentResult = { success: true } | { success: false; error: string };

// Lets the owning researcher remove a document they uploaded by mistake,
// but only before the Secretariat has acted (status SUBMITTED) - once
// review has started, the document set is what was actually reviewed.
export async function deleteDocument(
  input: z.infer<typeof DeleteDocumentInput>,
): Promise<DeleteDocumentResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'RESEARCHER') {
    return { success: false, error: 'Unauthorized: only the submitting researcher may manage documents.' };
  }

  const parsed = DeleteDocumentInput.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const document = await prisma.document.findUnique({
    where: { id: parsed.data.documentId },
    include: { application: true },
  });
  if (!document) {
    return { success: false, error: 'Document not found.' };
  }
  if (document.application.researcherId !== session.user.id) {
    return { success: false, error: 'You may only manage documents on your own application.' };
  }
  if (document.application.status !== 'SUBMITTED') {
    return {
      success: false,
      error: 'Documents can only be changed while the application is awaiting the Secretariat\'s completeness check.',
    };
  }

  if (document.documentType === 'RESEARCH_PROTOCOL') {
    const protocolCount = await prisma.document.count({
      where: { applicationId: document.applicationId, documentType: 'RESEARCH_PROTOCOL' },
    });
    if (protocolCount <= 1) {
      return {
        success: false,
        error: 'Cannot delete the only Research Protocol on file - upload a replacement first.',
      };
    }
  }

  await prisma.document.delete({ where: { id: document.id } });

  try {
    await deleteFile(document.filePath);
  } catch {
    // File already missing from storage - the DB row is still the source of truth, nothing more to do.
  }

  revalidatePath(`/applications/${document.applicationId}`);
  return { success: true };
}
