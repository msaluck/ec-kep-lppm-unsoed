import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components';

type ExemptionLetterEmailProps = {
  researcherName: string;
  applicationNumber: string;
  title: string;
};

export default function ExemptionLetterEmail({
  researcherName,
  applicationNumber,
  title,
}: ExemptionLetterEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Surat Keterangan Bebas Kaji Etik untuk aplikasi {applicationNumber} telah terbit</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f6f6f6', padding: '24px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px' }}>
          <Heading as="h2">Surat Keterangan Bebas Kaji Etik Diterbitkan</Heading>
          <Text>Yth. {researcherName},</Text>
          <Text>
            Kami informasikan bahwa aplikasi Anda dengan nomor <strong>{applicationNumber}</strong> untuk
            penelitian berjudul &ldquo;{title}&rdquo; telah diklasifikasikan sebagai <strong>EXEMPTED</strong> oleh
            Ketua/Sekretaris Komisi Etik Penelitian LPPM Universitas Jenderal Soedirman, dan dinyatakan dapat
            dilaksanakan tanpa memerlukan kajian etik lebih lanjut.
          </Text>
          <Text>Surat Keterangan Bebas Kaji Etik terlampir dalam email ini dalam format PDF.</Text>
          <Text>Terima kasih.</Text>
          <Text style={{ color: '#888', fontSize: '12px' }}>
            Sekretariat Komisi Etik Penelitian - LPPM Unsoed
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
