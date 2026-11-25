import { DeleteDocumentButton } from '@/components/applications/actions/delete-document-button';

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  RESEARCH_PROTOCOL: 'Proposal Penelitian',
  APPLICATION_FORM: 'Formulir Aplikasi',
  LEADER_STATEMENT: 'Formulir Pernyataan Ketua',
  CONFLICT_OF_INTEREST: 'Pernyataan Konflik Kepentingan',
  RESEARCH_INSTRUMENT: 'Instrumen Penelitian',
  INFORMED_CONSENT: 'Informed Consent',
  CV_RESEARCHER: 'CV Peneliti',
  SUPPORTING_DOCUMENT: 'Dokumen Pendukung',
  EXEMPTION_LETTER: 'Surat Keterangan Bebas Etik',
  ETHICAL_CLEARANCE_LETTER: 'Ethical Clearance (Keterangan Lolos Etik)',
  REVISION_RESPONSE: 'Perbaikan Proposal / Tanggapan Revisi',
  MEETING_MINUTES: 'Notulen Rapat',
  OTHER: 'Dokumen Lainnya',
};

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
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Jenis Dokumen</th>
            <th>Nama Berkas</th>
            <th>Revisi</th>
            <th>Diunggah</th>
            <th>
              <span className="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>{DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType.replaceAll('_', ' ')}</td>
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
    </div>
  );
}
