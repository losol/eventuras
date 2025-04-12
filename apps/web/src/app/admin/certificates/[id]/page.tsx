import { Container, Heading, Section } from '@eventuras/ui';
import { Logger } from '@eventuras/utils';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';
import { getAccessToken } from '@/utils/getAccesstoken';
import { oauthConfig } from '@/utils/oauthConfig';

import Certificate from '../Certificate';
import { PDFCertificate } from '../PDFCertificate';

type EventInfoProps = {
  params: {
    id: number;
  };
};
const CertificateDetailPage: React.FC<EventInfoProps> = async ({ params }) => {
  const { t } = createTranslation();

  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: await getAccessToken(),
  });

  const certificate = await apiWrapper(() =>
    eventuras.certificates.getV3Certificates({
      id: params.id,
    })
  );

  if (!certificate.ok) {
    Logger.error(
      { namespace: 'EditEventinfo' },
      `Failed to fetch order id ${params.id}, error: ${certificate.error}`
    );
  }

  if (!certificate.ok) {
    return <div>{t('admin:certificates.labels.notFound')}</div>;
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
          <PDFCertificate certificateId={params.id} />
        </Container>
      </Section>
    </Wrapper>
  );
};

export default CertificateDetailPage;
