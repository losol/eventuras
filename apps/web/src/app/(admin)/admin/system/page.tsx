import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import { getV3OrganizationsByOrganizationIdSettings } from '@/lib/eventuras-sdk';

const AdminSystemPage = async () => {
  const t = await getTranslations();
  const settings = await getV3OrganizationsByOrganizationIdSettings({
    path: {
      organizationId: 1,
    },
  });
  const powerOfficeSetting = settings.data?.find(s => s.name === 'POWER_OFFICE_APP_KEY');
  return (
    <>
      <Section className="py-8">
        <Container>
          <Heading as="h1">{t('admin.system.page.title')}</Heading>
        </Container>
      </Section>
      <Section>
        <Container>
          <p>POWER_OFFICE_APP_KEY = {powerOfficeSetting?.value ?? 'Not found'}</p>
        </Container>
      </Section>
    </>
  );
};

export default AdminSystemPage;
