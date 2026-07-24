import path from 'node:path';
import type { DocumentType } from '@prisma/client';
import { writeFileToDisk } from '@/lib/storage';

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
  const buffer = Buffer.from(await file.arrayBuffer());
  const relativePath = path.join(
    'applications',
    applicationNumber,
    `${documentType.toLowerCase()}-${Date.now()}-${file.name}`,
  );
  await writeFileToDisk(relativePath, buffer);

  return {
    documentType,
    fileName: file.name,
    filePath: relativePath,
    fileSize: buffer.byteLength,
    mimeType: file.type || 'application/octet-stream',
  };
}
