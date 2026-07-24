import PDFDocument from 'pdfkit';

type EthicalClearanceInput = {
  applicationNumber: string;
  title: string;
  researcherName: string;
  researcherInstitution: string | null;
  chairmanName: string;
  decidedAt: Date;
};

// Renders the Ethical Clearance / Persetujuan Etik confirmation letter to
// an in-memory buffer. The caller is responsible for persisting it to disk
// (see writeFileToDisk in lib/storage.ts) so this stays unit-testable.
export function generateEthicalClearancePdf(input: EthicalClearanceInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 56 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc
      .fontSize(14)
      .text('KOMISI ETIK PENELITIAN (KEP)', { align: 'center' })
      .fontSize(11)
      .text('LPPM Universitas Jenderal Soedirman', { align: 'center' })
      .moveDown(1.5);

    doc
      .fontSize(13)
      .text('PERSETUJUAN ETIK (ETHICAL CLEARANCE)', { align: 'center', underline: true })
      .moveDown(1);

    doc
      .fontSize(11)
      .text(`Nomor Aplikasi : ${input.applicationNumber}`)
      .text(`Judul Penelitian : ${input.title}`)
      .text(`Peneliti Utama : ${input.researcherName}`)
      .text(`Institusi : ${input.researcherInstitution ?? '-'}`)
      .moveDown(1);

    doc
      .text(
        'Berdasarkan hasil kajian Komisi Etik Penelitian, dengan ini dinyatakan bahwa ' +
          'protokol penelitian tersebut di atas telah memenuhi persyaratan etik penelitian ' +
          'dan dinyatakan LAYAK ETIK (APPROVED) untuk dilaksanakan.',
        { align: 'justify' },
      )
      .moveDown(2);

    doc.text(`Purwokerto, ${input.decidedAt.toLocaleDateString('id-ID')}`, { align: 'right' });
    doc.text('Ketua Komisi Etik Penelitian,', { align: 'right' });
    doc.moveDown(3);
    doc.text(input.chairmanName, { align: 'right' });

    doc.end();
  });
}
