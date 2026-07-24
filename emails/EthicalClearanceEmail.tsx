import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components';

type EthicalClearanceEmailProps = {
  researcherName: string;
  applicationNumber: string;
  title: string;
};

export default function EthicalClearanceEmail({
  researcherName,
  applicationNumber,
  title,
}: EthicalClearanceEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Persetujuan Etik untuk aplikasi {applicationNumber} telah terbit</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f6f6f6', padding: '24px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px' }}>
          <Heading as="h2">Persetujuan Etik Diterbitkan</Heading>
          <Text>Yth. {researcherName},</Text>
          <Text>
            Kami informasikan bahwa aplikasi Anda dengan nomor <strong>{applicationNumber}</strong> untuk
            penelitian berjudul &ldquo;{title}&rdquo; telah dinyatakan <strong>LAYAK ETIK (APPROVED)</strong> oleh
            Komisi Etik Penelitian LPPM Universitas Jenderal Soedirman.
          </Text>
          <Text>Surat Persetujuan Etik terlampir dalam email ini dalam format PDF.</Text>
          <Text>Terima kasih.</Text>
          <Text style={{ color: '#888', fontSize: '12px' }}>
            Sekretariat Komisi Etik Penelitian - LPPM Unsoed
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
