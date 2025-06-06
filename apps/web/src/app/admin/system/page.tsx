import { Container, Heading, Section } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';
import { getV3OrganizationsByOrganizationIdSettings } from '@eventuras/event-sdk';

import Wrapper from '@/components/eventuras/Wrapper';
import withAuthorization from '@/utils/auth/withAuthorization';
import { createClient } from '@/utils/apiClient';

const AdminSystemPage = async () => {
  const t = await getTranslations();

  const settings = await getV3OrganizationsByOrganizationIdSettings({
    path: {
      organizationId: 1,
    },
    client: await createClient(),
  });

  const powerOfficeSetting = settings.data?.find(s => s.name === 'POWER_OFFICE_APP_KEY');

  return (
    <Wrapper>
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
    </Wrapper>
  );
};

export default withAuthorization(AdminSystemPage, 'Admin');
