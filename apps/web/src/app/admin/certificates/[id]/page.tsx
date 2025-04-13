import { Container, Heading, Section } from '@eventuras/ui';
import { Logger } from '@eventuras/utils';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import { getAccessToken } from '@/utils/getAccesstoken';

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

  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: await getAccessToken(),
  });

  const certificate = await apiWrapper(() =>
    eventuras.certificates.getV3Certificates({
      id: id,
    })
  );

  if (!certificate.ok) {
    Logger.error(
      { namespace: 'Certifcatedetailpage' },
      `Failed to fetch certificate with id ${id}, error: ${certificate.error}`
    );
  }

  if (!certificate.ok) {
    return <div>{t('admin.certificates.labels.notFound')}</div>;
  }

  return (
    <Wrapper fluid>
      <Section className="bg-white dark:bg-black   pb-8">
        <Container>
          <Heading as="h1">Order</Heading>
        </Container>
      </Section>
      <Section className="py-12">
        <Container>
          <Certificate certificate={certificate.value!} />
          <PDFCertificate certificateId={id} />
        </Container>
      </Section>
    </Wrapper>
  );
}
