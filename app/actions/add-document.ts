'use server';

import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isUploadedFile, persistUpload } from '@/lib/documents';

const AddDocumentDocumentType = z.enum(['RESEARCH_PROTOCOL', 'INFORMED_CONSENT', 'CV_RESEARCHER', 'SUPPORTING_DOCUMENT']);

type AddDocumentResult = { success: true } | { success: false; error: string };

// Lets the owning researcher add a replacement/additional document, but
// only before the Secretariat has acted (status SUBMITTED) - paired with
// delete-document.ts to cover "replace a wrong upload".
export async function addDocument(formData: FormData): Promise<AddDocumentResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'RESEARCHER') {
    return { success: false, error: 'Unauthorized: only the submitting researcher may manage documents.' };
  }

  const applicationId = formData.get('applicationId');
  const documentTypeRaw = formData.get('documentType');
  const file = formData.get('file');

  if (typeof applicationId !== 'string' || applicationId.length === 0) {
    return { success: false, error: 'Missing applicationId.' };
  }
  const parsedType = AddDocumentDocumentType.safeParse(documentTypeRaw);
  if (!parsedType.success) {
    return { success: false, error: 'Invalid document type.' };
  }
  if (!isUploadedFile(file)) {
    return { success: false, error: 'A file is required.' };
  }

  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application) {
    return { success: false, error: 'Application not found.' };
  }
  if (application.researcherId !== session.user.id) {
    return { success: false, error: 'You may only manage documents on your own application.' };
  }
  if (application.status !== 'SUBMITTED') {
    return {
      success: false,
      error: 'Documents can only be changed while the application is awaiting the Secretariat\'s completeness check.',
    };
  }

  const saved = await persistUpload(file, application.applicationNumber, parsedType.data);

  await prisma.document.create({
    data: {
      ...saved,
      applicationId: application.id,
      uploadedById: session.user.id,
    },
  });

  revalidatePath(`/applications/${application.id}`);
  return { success: true };
}
