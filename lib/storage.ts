import path from 'node:path';
import fs from 'node:fs/promises';
import { put, del } from '@vercel/blob';

// Dual-mode storage: local disk for local dev / CloudPanel VPS (where the
// filesystem is persistent), Vercel Blob when deployed to Vercel (whose
// serverless functions have a read-only, ephemeral filesystem outside
// /tmp). Selected automatically by the presence of BLOB_READ_WRITE_TOKEN,
// which Vercel injects once a Blob store is connected to the project.
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

// Local-disk fallback root. Defaults to public/uploads for local dev; on
// the CloudPanel VPS this should be set to a path outside the web-served
// tree, e.g. UPLOAD_DIR=/home/cloudpanel/htdocs/<site>/storage/uploads
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'public', 'uploads');

function resolveUploadPath(relativePath: string): string {
  return path.join(UPLOAD_DIR, relativePath);
}

// Writes a file and returns the value to persist in Document.filePath:
// a Blob URL on Vercel, or the original relative path on local disk.
export async function writeFile(relativePath: string, data: Buffer, contentType: string): Promise<string> {
  if (useBlob) {
    const blob = await put(relativePath, data, { access: 'public', contentType, addRandomSuffix: true });
    return blob.url;
  }

  const absolutePath = resolveUploadPath(relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, data);
  return relativePath;
}

// Reads a file previously written by writeFile, given the value stored in
// Document.filePath (a Blob URL or a local relative path).
export async function readFile(storedPath: string): Promise<Buffer> {
  if (storedPath.startsWith('http://') || storedPath.startsWith('https://')) {
    const response = await fetch(storedPath);
    if (!response.ok) {
      throw new Error(`Blob fetch failed with status ${response.status}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  return fs.readFile(resolveUploadPath(storedPath));
}

// Deletes a file previously written by writeFile. Best-effort — callers
// treat "already gone" as a non-error, since the DB row is the source of
// truth either way.
export async function deleteFile(storedPath: string): Promise<void> {
  if (storedPath.startsWith('http://') || storedPath.startsWith('https://')) {
    await del(storedPath);
    return;
  }

  await fs.unlink(resolveUploadPath(storedPath));
}
