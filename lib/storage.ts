import path from 'node:path';
import fs from 'node:fs/promises';

// Local-disk-only storage — no S3/Supabase. Defaults to public/uploads for
// local dev; in production on CloudPanel this should be set to a path
// outside the web-served tree, e.g.
//   UPLOAD_DIR=/home/cloudpanel/htdocs/ec-kep.unsoed.ac.id/storage/uploads
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'public', 'uploads');

export function resolveUploadPath(...segments: string[]): string {
  return path.join(UPLOAD_DIR, ...segments);
}

export async function writeFileToDisk(relativePath: string, data: Buffer): Promise<string> {
  const absolutePath = resolveUploadPath(relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, data);
  return relativePath;
}
