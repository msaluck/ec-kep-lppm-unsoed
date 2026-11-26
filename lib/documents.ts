import path from 'node:path';
import type { DocumentType } from '@prisma/client';
import { writeFile } from '@/lib/storage';

export function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

type PersistedUpload = {
  documentType: DocumentType;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
};

// Shared by submit-application.ts (Milestone 1) and resubmit-revision.ts
// (Revisi I/II) — both write uploaded files to local disk under the
// application's own folder before creating their Document rows.
export async function persistUpload(
  file: File,
  applicationNumber: string,
  documentType: DocumentType,
): Promise<PersistedUpload> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || 'application/octet-stream';
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const relativePath = path.join(
      'applications',
      applicationNumber,
      `${documentType.toLowerCase()}-${Date.now()}-${sanitizedFileName}`,
    );
    const storedPath = await writeFile(relativePath, buffer, mimeType);

    return {
      documentType,
      fileName: file.name,
      filePath: storedPath,
      fileSize: buffer.byteLength,
      mimeType,
    };
  } catch (err) {
    console.error(`Failed to persist upload for ${file.name}:`, err);
    throw new Error(
      `Gagal menyimpan berkas "${file.name}": ${err instanceof Error ? err.message : 'Kendala penyimpanan'}`,
    );
  }
}
