import createTranslation from 'next-translate/createTranslation';

import { Container, Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import Section from '@/components/ui/Section';
import withAuthorization from '@/utils/auth/withAuthorization';

const CertificatesPage = async () => {
  const { t } = createTranslation();

  return (
    <Layout>
      <Container>
        <Heading as="h1">{t('admin:certificates.page.title')}</Heading>
      </Container>
      <Section>
        <Container>
          <p>{t('admin:certificates.page.description')}</p>
        </Container>
      </Section>
    </Layout>
  );
};

export default withAuthorization(CertificatesPage, 'Admin');
