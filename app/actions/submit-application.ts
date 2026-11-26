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

function normalizeUrl(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  let val = value.trim();
  if (!/^https?:\/\//i.test(val)) {
    val = `https://${val}`;
  }
  try {
    const url = new URL(val);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
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

// Milestone 1 — Researcher submits an application with required documents
// (via direct file upload and/or cloud storage links). Sets the Milestone 2
// secretariat-review deadline (2 working days) at creation time.
export async function submitApplication(formData: FormData): Promise<SubmitApplicationResult> {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user;

    if (!sessionUser?.id || sessionUser.role !== 'RESEARCHER') {
      return { success: false, error: 'Unauthorized: only a registered researcher may submit an application.' };
    }

    const title = formData.get('title');
    const researchType = formData.get('researchType');
    const panelType = formData.get('panelType');
    const proposerName = formData.get('proposerName');
    const institution = formData.get('institution');

    if (typeof title !== 'string' || title.trim().length === 0) {
      return { success: false, error: 'Judul penelitian/usulan wajib diisi.' };
    }
    if (panelType !== 'SAINTEK' && panelType !== 'SOSHUM') {
      return { success: false, error: 'Jenis panel wajib dipilih.' };
    }
    if (typeof proposerName !== 'string' || proposerName.trim().length === 0) {
      return { success: false, error: 'Nama Pengusul/Ketua Peneliti wajib diisi.' };
    }
    if (typeof institution !== 'string' || institution.trim().length === 0) {
      return { success: false, error: 'Universitas/Institusi wajib diisi.' };
    }

    // Uploaded files
    const proposalFile = (formData.get('proposal') || formData.get('researchProtocol')) as FormDataEntryValue | null;
    const saintekFormFile = (formData.get('saintekForm') || formData.get('applicationForm')) as FormDataEntryValue | null;
    const soshumFormFile = (formData.get('soshumForm') || formData.get('applicationForm')) as FormDataEntryValue | null;
    const leaderStatementFile = (formData.get('leaderStatement') || formData.get('leaderStatementFile')) as FormDataEntryValue | null;
    const conflictOfInterestFile = (formData.get('conflictOfInterest') || formData.get('conflictOfInterestFile')) as FormDataEntryValue | null;
    const informedConsentFile = (formData.get('informedConsent') || formData.get('informedConsentFile')) as FormDataEntryValue | null;
    const researchInstrumentFile = (formData.get('researchInstrument') || formData.get('researchInstrumentFile')) as FormDataEntryValue | null;
    const supportingDocuments = formData.getAll('supportingDocuments');

    // Cloud URL links (optional if files are uploaded)
    const proposalUrl = normalizeUrl(formData.get('proposalUrl'));
    const saintekFormUrl = normalizeUrl(formData.get('saintekFormUrl'));
    const soshumFormUrl = normalizeUrl(formData.get('soshumFormUrl'));
    const leaderStatementUrl = normalizeUrl(formData.get('leaderStatementUrl'));
    const conflictOfInterestUrl = normalizeUrl(formData.get('conflictOfInterestUrl'));
    const informedConsentUrl = normalizeUrl(formData.get('informedConsentUrl'));
    const researchInstrumentUrl = normalizeUrl(formData.get('researchInstrumentUrl'));
    const supportingDocumentUrl = normalizeUrl(formData.get('supportingDocumentUrl'));

    // Validate requirement completeness (must have uploaded file OR valid link)
    if (!isUploadedFile(proposalFile) && !proposalUrl) {
      return { success: false, error: 'Proposal Penelitian wajib diunggah atau dicantumkan tautannya.' };
    }

    if (panelType === 'SAINTEK') {
      if (!isUploadedFile(saintekFormFile) && !saintekFormUrl) {
        return { success: false, error: 'Formulir Aplikasi Saintek (Word) wajib diunggah atau dicantumkan tautannya.' };
      }
    } else {
      if (!isUploadedFile(soshumFormFile) && !soshumFormUrl) {
        return { success: false, error: 'Formulir Aplikasi Telaah Etik (Word) wajib diunggah atau dicantumkan tautannya.' };
      }
    }

    if (!isUploadedFile(leaderStatementFile) && !leaderStatementUrl) {
      return { success: false, error: 'Formulir Pernyataan Ketua Peneliti wajib diunggah atau dicantumkan tautannya.' };
    }

    if (!isUploadedFile(conflictOfInterestFile) && !conflictOfInterestUrl) {
      return { success: false, error: 'Formulir Pernyataan Konflik Kepentingan wajib diunggah atau dicantumkan tautannya.' };
    }

    if (panelType === 'SOSHUM') {
      if (!isUploadedFile(researchInstrumentFile) && !researchInstrumentUrl) {
        return { success: false, error: 'Instrumen Penelitian wajib diunggah atau dicantumkan tautannya.' };
      }
    }

    const uploads: Array<{ file: File; documentType: DocumentType; targetFieldKey: string }> = [];

    if (isUploadedFile(proposalFile)) {
      uploads.push({ file: proposalFile, documentType: 'RESEARCH_PROTOCOL', targetFieldKey: 'proposalUrl' });
    }
    if (panelType === 'SAINTEK' && isUploadedFile(saintekFormFile)) {
      uploads.push({ file: saintekFormFile, documentType: 'APPLICATION_FORM', targetFieldKey: 'saintekFormUrl' });
    }
    if (panelType === 'SOSHUM' && isUploadedFile(soshumFormFile)) {
      uploads.push({ file: soshumFormFile, documentType: 'APPLICATION_FORM', targetFieldKey: 'soshumFormUrl' });
    }
    if (isUploadedFile(leaderStatementFile)) {
      uploads.push({ file: leaderStatementFile, documentType: 'LEADER_STATEMENT', targetFieldKey: 'leaderStatementUrl' });
    }
    if (isUploadedFile(conflictOfInterestFile)) {
      uploads.push({ file: conflictOfInterestFile, documentType: 'CONFLICT_OF_INTEREST', targetFieldKey: 'conflictOfInterestUrl' });
    }
    if (isUploadedFile(informedConsentFile)) {
      uploads.push({ file: informedConsentFile, documentType: 'INFORMED_CONSENT', targetFieldKey: 'informedConsentUrl' });
    }
    if (panelType === 'SOSHUM' && isUploadedFile(researchInstrumentFile)) {
      uploads.push({ file: researchInstrumentFile, documentType: 'RESEARCH_INSTRUMENT', targetFieldKey: 'researchInstrumentUrl' });
    }
    for (const entry of supportingDocuments) {
      if (isUploadedFile(entry)) {
        uploads.push({ file: entry, documentType: 'SUPPORTING_DOCUMENT', targetFieldKey: 'supportingDocumentUrl' });
      }
    }

    const secretariatDeadline = addWorkingDays(new Date(), SECRETARIAT_CHECK_DEADLINE_DAYS);

    for (let attempt = 0; attempt <= MAX_RETRIES_ON_NUMBER_COLLISION; attempt += 1) {
      const applicationNumber = generateApplicationNumber();

      try {
        const savedDocuments = await Promise.all(
          uploads.map(async ({ file, documentType, targetFieldKey }) => {
            const persisted = await persistUpload(file, applicationNumber, documentType);
            return {
              ...persisted,
              targetFieldKey,
            };
          }),
        );

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
              proposerName: proposerName.trim(),
              institution: institution.trim(),
              proposalUrl,
              saintekFormUrl: panelType === 'SAINTEK' ? saintekFormUrl : null,
              soshumFormUrl: panelType === 'SOSHUM' ? soshumFormUrl : null,
              leaderStatementUrl,
              conflictOfInterestUrl,
              informedConsentUrl,
              researchInstrumentUrl: panelType === 'SOSHUM' ? researchInstrumentUrl : null,
              supportingDocumentUrl,
            },
          });

          const createdDocs = await Promise.all(
            savedDocuments.map((doc) =>
              tx.document.create({
                data: {
                  applicationId: created.id,
                  documentType: doc.documentType,
                  fileName: doc.fileName,
                  filePath: doc.filePath,
                  fileSize: doc.fileSize,
                  mimeType: doc.mimeType,
                  uploadedById: sessionUser.id as string,
                },
              }),
            ),
          );

          // If any URL field was not manually provided, link it to the uploaded document
          const updates: Partial<Record<PanelUrlField | 'supportingDocumentUrl', string>> = {};
          for (let i = 0; i < savedDocuments.length; i++) {
            const item = savedDocuments[i];
            const doc = createdDocs[i];
            const fieldKey = item.targetFieldKey as PanelUrlField | 'supportingDocumentUrl';
            if (fieldKey && !created[fieldKey as keyof typeof created] && !updates[fieldKey]) {
              const docUrl = item.filePath.startsWith('http://') || item.filePath.startsWith('https://')
                ? item.filePath
                : `/api/documents/${doc.id}`;
              updates[fieldKey] = docUrl;
            }
          }

          if (Object.keys(updates).length > 0) {
            await tx.application.update({
              where: { id: created.id },
              data: updates,
            });
          }

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

        // Safe recipient email lookup
        const recipientEmail =
          session?.user?.email ||
          (await prisma.user.findUnique({ where: { id: sessionUser.id }, select: { email: true } }))?.email;

        if (recipientEmail) {
          await sendAndLogNotification({
            applicationId: application.id,
            userId: sessionUser.id as string,
            event: 'APPLICATION_SUBMITTED',
            to: recipientEmail,
            subject: `Aplikasi Diterima - ${applicationNumber}`,
            text: `Aplikasi Anda "${title.trim()}" (${applicationNumber}) telah diterima dan akan diperiksa kelengkapannya oleh Sekretariat KEP paling lambat ${secretariatDeadline.toLocaleDateString('id-ID')}.`,
          }).catch((notifyErr) => {
            console.error('Notification send error (non-fatal):', notifyErr);
          });
        }

        revalidatePath('/applications');

        return { success: true, applicationId: application.id, applicationNumber };
      } catch (err) {
        const isUniqueCollision = err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
        if (isUniqueCollision && attempt < MAX_RETRIES_ON_NUMBER_COLLISION) {
          continue; // regenerate applicationNumber and retry
        }
        console.error('submitApplication attempt error:', err);
        return {
          success: false,
          error:
            err instanceof Error
              ? `Gagal menyimpan aplikasi: ${err.message}`
              : 'Gagal menyimpan aplikasi. Silakan periksa koneksi dan coba lagi.',
        };
      }
    }

    return { success: false, error: 'Failed to allocate a unique application number. Please try again.' };
  } catch (outerErr) {
    console.error('submitApplication top-level fatal error:', outerErr);
    return {
      success: false,
      error:
        outerErr instanceof Error
          ? `Gagal memproses pengajuan: ${outerErr.message}`
          : 'Terjadi kendala saat memproses pengajuan. Silakan periksa kembali berkas Anda dan coba lagi.',
    };
  }
}
