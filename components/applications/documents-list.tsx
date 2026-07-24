import { DeleteDocumentButton } from '@/components/applications/actions/delete-document-button';

type DocumentEntry = {
  id: string;
  documentType: string;
  fileName: string;
  uploadedAt: Date;
  revisionRound: number;
};

export function DocumentsList({ documents, deletable = false }: { documents: DocumentEntry[]; deletable?: boolean }) {
  if (documents.length === 0) return <p>Belum ada dokumen.</p>;

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Jenis Dokumen</th>
          <th>Nama Berkas</th>
          <th>Revisi</th>
          <th>Diunggah</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {documents.map((doc) => (
          <tr key={doc.id}>
            <td>{doc.documentType.replaceAll('_', ' ')}</td>
            <td>{doc.fileName}</td>
            <td>{doc.revisionRound || '-'}</td>
            <td>{doc.uploadedAt.toLocaleDateString('id-ID')}</td>
            <td>
              <a href={`/api/documents/${doc.id}`} target="_blank" rel="noreferrer">
                Unduh
              </a>
              {deletable && (
                <>
                  {' '}
                  <DeleteDocumentButton documentId={doc.id} />
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
