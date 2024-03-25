import { Container } from '@eventuras/ui';
import Heading from '@eventuras/ui/Heading';
import Section from '@eventuras/ui/Section';
import { headers } from 'next/headers';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import Environment from '@/utils/Environment';

type EventInfoProps = {
  params: {
    id: number;
  };
};

const CertificatePdfPage: React.FC<EventInfoProps> = async ({ params }) => {
  const { t } = createTranslation();

  const token = headers().get('Authorization');

  const url = `${Environment.NEXT_PUBLIC_BACKEND_URL}/v3/certificates/${params.id}?format=PDF`;
  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/pdf',
      'Accept-Encoding': 'application/pdf',
      Authorization: token,
      'Eventuras-Org-Id': Environment.NEXT_PUBLIC_ORGANIZATION_ID,
      'Content-Type': 'application/json',
    },
    body: undefined,
  } as RequestInit;

  const blob = await fetch(url, options).then(res => res.blob());

  let blobUrl = '';
  if (blob.size > 0) {
    blobUrl = URL.createObjectURL(blob);
  }

  return (
    <Wrapper fluid>
      <Section className="bg-white dark:bg-black pb-8">
        <Container>
          <Heading as="h1">
            {t('common:certificate')} #{params.id}
          </Heading>
        </Container>
      </Section>
      <Section className="py-12">
        <Container>
          <iframe src={blobUrl} width="100%" height="600px" style={{ border: 'none' }}></iframe>
        </Container>
      </Section>
    </Wrapper>
  );
};

export default CertificatePdfPage;
