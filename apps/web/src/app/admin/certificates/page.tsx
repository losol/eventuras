import { Container } from '@eventuras/ui';
import Heading from '@eventuras/ui/Heading';
import Section from '@eventuras/ui/Section';
import createTranslation from 'next-translate/createTranslation';

import withAuthorization from '@/utils/auth/withAuthorization';

const CertificatesPage = async () => {
  const { t } = createTranslation();

  return (
    <>
      <Container>
        <Heading as="h1">{t('admin:certificates.page.title')}</Heading>
      </Container>
      <Section>
        <Container>
          <p>{t('admin:certificates.page.description')}</p>
        </Container>
      </Section>
    </>
  );
};

export default withAuthorization(CertificatesPage, 'Admin');
