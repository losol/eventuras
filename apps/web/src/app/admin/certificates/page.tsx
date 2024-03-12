import { Container } from '@eventuras/ui';
import Heading from '@eventuras/ui/Heading';
import Section from '@eventuras/ui/Section';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import withAuthorization from '@/utils/auth/withAuthorization';

const CertificatesPage = async () => {
  const { t } = createTranslation();

  return (
    <Wrapper>
      <Container>
        <Heading as="h1">{t('admin:certificates.page.title')}</Heading>
      </Container>
      <Section>
        <Container>
          <p>{t('admin:certificates.page.description')}</p>
        </Container>
      </Section>
    </Wrapper>
  );
};

export default withAuthorization(CertificatesPage, 'Admin');
