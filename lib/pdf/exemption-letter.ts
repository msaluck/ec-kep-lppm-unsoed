import PDFDocument from 'pdfkit';

type ExemptionLetterInput = {
  applicationNumber: string;
  title: string;
  researcherName: string;
  researcherInstitution: string | null;
  chairmanName: string;
  decidedAt: Date;
};

// Renders the Exemption Letter (Surat Keterangan Bebas Kaji Etik) for the
// Exempted track to an in-memory buffer, mirroring generateEthicalClearancePdf.
export function generateExemptionLetterPdf(input: ExemptionLetterInput): Promise<Buffer> {
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
      .text('SURAT KETERANGAN BEBAS KAJI ETIK', { align: 'center', underline: true })
      .fontSize(10)
      .text('(Exemption Letter)', { align: 'center' })
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
        'Berdasarkan hasil klasifikasi Ketua/Sekretaris Komisi Etik Penelitian, protokol penelitian ' +
          'tersebut di atas termasuk dalam kategori penelitian yang DIKECUALIKAN (EXEMPTED) dari ' +
          'kajian etik penuh, dan dinyatakan dapat dilaksanakan tanpa memerlukan telaah lebih lanjut ' +
          'dari Tim Penelaah maupun Rapat Pleno.',
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
