import { Container, Heading, Section } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';

import withAuthorization from '@/utils/auth/withAuthorization';

const CertificatesPage = async () => {
  const t = await getTranslations();

  return (
    <Container>
        <Heading as="h1">{t('admin.certificates.page.title')}</Heading>
      </Container>
      <Section>
        <Container>
          <p>{t('admin.certificates.page.description')}</p>
        </Container>
      </Section>
  );
};

export default withAuthorization(CertificatesPage, 'Admin');
