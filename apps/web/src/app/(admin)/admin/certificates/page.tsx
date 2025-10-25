import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';

const CertificatesPage = async () => {
  const t = await getTranslations();
  return (
    <>
      <Container>
        <Heading as="h1">{t('admin.certificates.page.title')}</Heading>
      </Container>
      <Section>
        <Container>
          <p>{t('admin.certificates.page.description')}</p>
        </Container>
      </Section>
    </>
  );
};

export default CertificatesPage;
