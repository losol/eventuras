import { Container } from '@eventuras/ui';
import Heading from '@eventuras/ui/Heading';
import Section from '@eventuras/ui/Section';
import { Logger } from '@eventuras/utils';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Environment from '@/utils/Environment';

import Certificate from '../Certificate';

type EventInfoProps = {
  params: {
    id: number;
  };
};
const CertificateDetailPage: React.FC<EventInfoProps> = async ({ params }) => {
  const { t } = createTranslation();

  const eventuras = createSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: headers().get('Authorization'),
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
        </Container>
      </Section>
    </Wrapper>
  );
};

export default CertificateDetailPage;
