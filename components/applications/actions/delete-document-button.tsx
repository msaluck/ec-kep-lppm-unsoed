'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteDocument } from '@/app/actions/delete-document';

export function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm('Hapus dokumen ini?')) return;

    setError(null);
    setIsDeleting(true);
    const result = await deleteDocument({ documentId });
    setIsDeleting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <button type="button" className="btn danger" disabled={isDeleting} onClick={handleDelete}>
        {isDeleting ? '...' : 'Hapus'}
      </button>
      {error && <div className="alert error">{error}</div>}
    </>
  );
}
