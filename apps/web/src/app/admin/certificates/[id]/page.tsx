import { Container, Heading, Section } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/logger';
import { getTranslations } from 'next-intl/server';

import { getV3CertificatesById } from '@eventuras/event-sdk';
import Certificate from '../Certificate';
import { PDFCertificate } from '../PDFCertificate';

type CertificateInfoProps = {
  params: Promise<{
    id: number;
  }>;
};

export default async function CertificateDetailPage({ params }: Readonly<CertificateInfoProps>) {
  const { id } = await params;
  const t = await getTranslations();

  const response = await getV3CertificatesById({
    path: { id },
  });

  if (!response.data) {
    Logger.error(
      { namespace: 'CertificateDetailPage' },
      `Failed to fetch certificate with id ${id}, error: ${response.error}`
    );
    return <div>{t('admin.certificates.labels.notFound')}</div>;
  }

  return (
    <>
      <Section className="bg-white dark:bg-black   pb-8">
        <Container>
          <Heading as="h1">Order</Heading>
        </Container>
      </Section>
      <Section className="py-12">
        <Container>
          <Certificate certificate={response.data} />
          <PDFCertificate certificateId={id} />
        </Container>
      </Section>
    </>
  );
}
