import { getCurrentSession } from '@eventuras/fides-auth/session';
import { Container, Heading } from '@eventuras/ui';
import { redirect } from 'next/navigation';
import createTranslation from 'next-translate/createTranslation';

import Wrapper from '@/components/eventuras/Wrapper';
import { createEnrollmentsSDK } from '@/utils/api/EventurasApi';
import withAuthorization from '@/utils/auth/withAuthorization';
import Environment from '@/utils/Environment';

const AdminSettingsPage = async () => {
  const { t } = createTranslation();

  const session = await getCurrentSession();
  if (session === null) {
    return redirect('/login');
  }

  const enrollmentSdk = createEnrollmentsSDK({
    baseUrl: Environment.NEXT_PUBLIC_BACKEND_URL,
    authHeader: session?.tokens?.accessToken,
  });

  const settings =
    await enrollmentSdk.organizationSettings.getV3OrganizationsOrganizationIdSettings({
      organizationId: parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID, 10),
    });

  return (
    <Wrapper>
      <Container>
        <Heading as="h1">{t('admin:settings.page.title')}</Heading>
        <p>{JSON.stringify(session.user, null, 2)}</p>
      </Container>
    </Wrapper>
  );
};

export default withAuthorization(AdminSettingsPage, 'Admin');
