'use server';

import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendAndLogNotification } from '@/lib/notify';
import { isUploadedFile, persistUpload } from '@/lib/documents';
import { addWorkingDays } from '@/lib/working-days';
import { generateApplicationNumber } from '@/lib/application-number';
import type { DocumentType } from '@prisma/client';

const SECRETARIAT_CHECK_DEADLINE_DAYS = 2;
const MAX_RETRIES_ON_NUMBER_COLLISION = 2;

type SubmitApplicationResult =
  | { success: true; applicationId: string; applicationNumber: string }
  | { success: false; error: string };

function isHttpUrl(value: FormDataEntryValue | null): value is string {
  if (typeof value !== 'string' || value.trim().length === 0) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

type PanelUrlField =
  | 'saintekFormUrl'
  | 'soshumFormUrl'
  | 'proposalUrl'
  | 'leaderStatementUrl'
  | 'conflictOfInterestUrl'
  | 'informedConsentUrl'
  | 'researchInstrumentUrl';

// SAINTEK and SOSHUM share most panel fields (proposer, institution,
// proposal, leader statement, conflict-of-interest, optional supporting
// doc) but each also has document links the other doesn't - SAINTEK's own
// application form vs. SOSHUM's application form + informed consent +
// research instrument. This table drives which links are required per panel.
const REQUIRED_URL_FIELDS_BY_PANEL: Record<'SAINTEK' | 'SOSHUM', Array<[PanelUrlField, string]>> = {
  SAINTEK: [
    ['saintekFormUrl', 'Formulir Aplikasi Saintek'],
    ['proposalUrl', 'Proposal Penelitian'],
    ['leaderStatementUrl', 'Formulir Pernyataan Ketua Peneliti/Kegiatan Ilmiah'],
    ['conflictOfInterestUrl', 'Formulir Pernyataan Konflik Kepentingan'],
  ],
  SOSHUM: [
    ['soshumFormUrl', 'Formulir Aplikasi Telaah Etik'],
    ['proposalUrl', 'Proposal Penelitian'],
    ['leaderStatementUrl', 'Formulir Pernyataan Ketua Peneliti/Kegiatan Ilmiah'],
    ['conflictOfInterestUrl', 'Formulir Pernyataan Konflik Kepentingan'],
    ['informedConsentUrl', 'Lembar Informed Consent'],
    ['researchInstrumentUrl', 'Instrumen Penelitian'],
  ],
};

// Milestone 1 — Researcher submits an application with the Research
// Protocol (required) and optional supporting documents. Sets the
// Milestone 2 secretariat-review deadline (2 working days) at creation
// time so the Secretariat's queue is enforceable from the start.
export async function submitApplication(formData: FormData): Promise<SubmitApplicationResult> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;

  if (!sessionUser?.id || sessionUser.role !== 'RESEARCHER') {
    return { success: false, error: 'Unauthorized: only a registered researcher may submit an application.' };
  }

  const title = formData.get('title');
  const researchType = formData.get('researchType');
  const researchProtocol = formData.get('researchProtocol');
  const informedConsent = formData.get('informedConsent');
  const cvResearcher = formData.get('cvResearcher');
  const supportingDocuments = formData.getAll('supportingDocuments');

  if (typeof title !== 'string' || title.trim().length === 0) {
    return { success: false, error: 'Research title is required.' };
  }
  if (!isUploadedFile(researchProtocol)) {
    return { success: false, error: 'Research Protocol (PP) document is required.' };
  }

  const panelType = formData.get('panelType');
  if (panelType !== 'SAINTEK' && panelType !== 'SOSHUM') {
    return { success: false, error: 'Panel type is required.' };
  }

  const proposerName = formData.get('proposerName');
  const institution = formData.get('institution');
  if (typeof proposerName !== 'string' || proposerName.trim().length === 0) {
    return { success: false, error: 'Nama Pengusul/Ketua Peneliti/Kegiatan Ilmiah is required.' };
  }
  if (typeof institution !== 'string' || institution.trim().length === 0) {
    return { success: false, error: 'Universitas/Institusi is required.' };
  }

  const urlValues: Partial<Record<PanelUrlField, string>> = {};
  for (const [field, label] of REQUIRED_URL_FIELDS_BY_PANEL[panelType]) {
    const raw = formData.get(field);
    if (!isHttpUrl(raw)) {
      return { success: false, error: `A valid link for ${label} is required.` };
    }
    urlValues[field] = raw;
  }

  const supportingDocumentUrlRaw = formData.get('supportingDocumentUrl');
  if (
    typeof supportingDocumentUrlRaw === 'string' &&
    supportingDocumentUrlRaw.trim().length > 0 &&
    !isHttpUrl(supportingDocumentUrlRaw)
  ) {
    return { success: false, error: 'The supporting document link is not a valid URL.' };
  }

  const panelFields = {
    proposerName: proposerName.trim(),
    institution: institution.trim(),
    ...urlValues,
    supportingDocumentUrl: isHttpUrl(supportingDocumentUrlRaw) ? supportingDocumentUrlRaw : null,
  };

  const uploads: Array<{ file: File; documentType: DocumentType }> = [
    { file: researchProtocol, documentType: 'RESEARCH_PROTOCOL' },
  ];
  if (isUploadedFile(informedConsent)) uploads.push({ file: informedConsent, documentType: 'INFORMED_CONSENT' });
  if (isUploadedFile(cvResearcher)) uploads.push({ file: cvResearcher, documentType: 'CV_RESEARCHER' });
  for (const entry of supportingDocuments) {
    if (isUploadedFile(entry)) uploads.push({ file: entry, documentType: 'SUPPORTING_DOCUMENT' });
  }

  const secretariatDeadline = addWorkingDays(new Date(), SECRETARIAT_CHECK_DEADLINE_DAYS);

  for (let attempt = 0; attempt <= MAX_RETRIES_ON_NUMBER_COLLISION; attempt += 1) {
    const applicationNumber = generateApplicationNumber();

    const savedDocuments = await Promise.all(
      uploads.map(({ file, documentType }) => persistUpload(file, applicationNumber, documentType)),
    );

    try {
      const application = await prisma.$transaction(async (tx) => {
        const created = await tx.application.create({
          data: {
            applicationNumber,
            title: title.trim(),
            researchType: typeof researchType === 'string' ? researchType : null,
            status: 'SUBMITTED',
            researcherId: sessionUser.id as string,
            secretariatDeadline,
            panelType,
            ...panelFields,
            documents: {
              create: savedDocuments.map((doc) => ({
                ...doc,
                uploadedById: sessionUser.id as string,
              })),
            },
          },
        });

        await tx.applicationStatusHistory.create({
          data: {
            applicationId: created.id,
            toStatus: 'SUBMITTED',
            actorId: sessionUser.id as string,
            deadlineAt: secretariatDeadline,
          },
        });

        return created;
      });

      await sendAndLogNotification({
        applicationId: application.id,
        userId: sessionUser.id as string,
        event: 'APPLICATION_SUBMITTED',
        to: session!.user!.email as string,
        subject: `Aplikasi Diterima - ${applicationNumber}`,
        text: `Aplikasi Anda "${title.trim()}" (${applicationNumber}) telah diterima dan akan diperiksa kelengkapannya oleh Sekretariat KEP paling lambat ${secretariatDeadline.toLocaleDateString('id-ID')}.`,
      });

      revalidatePath('/applications');

      return { success: true, applicationId: application.id, applicationNumber };
    } catch (err) {
      const isUniqueCollision = err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
      if (isUniqueCollision && attempt < MAX_RETRIES_ON_NUMBER_COLLISION) {
        continue; // regenerate applicationNumber and retry
      }
      throw err;
    }
  }

  return { success: false, error: 'Failed to allocate a unique application number. Please try again.' };
}
