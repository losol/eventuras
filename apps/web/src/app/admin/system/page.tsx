import { Container, Heading, Section } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';
import { getV3OrganizationsByOrganizationIdSettings } from '@eventuras/event-sdk';
import { client } from '@eventuras/event-sdk/client.gen';

import Wrapper from '@/components/eventuras/Wrapper';
import withAuthorization from '@/utils/auth/withAuthorization';
import { getAccessToken } from '@/utils/getAccesstoken';

const AdminSystemPage = async () => {
  const t = await getTranslations();

  const token = await getAccessToken();

  client.setConfig({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const settings = await getV3OrganizationsByOrganizationIdSettings({
    path: {
      organizationId: 1,
    },
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
