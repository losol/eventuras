import { Container, Heading } from '@eventuras/ratio-ui';
import { getTranslations } from 'next-intl/server';

import Wrapper from '@/components/eventuras/Wrapper';
import { Link } from '@eventuras/ratio-ui-next/Link';
import withAuthorization from '@/utils/auth/withAuthorization';
import { publicEnv } from '@/config.client';

import AdminEventList from './AdminEventList';

const ORGANIZATION_ID: number = parseInt(String(publicEnv.NEXT_PUBLIC_ORGANIZATION_ID) || '0');

const AdminPage = async () => {
  const t = await getTranslations();
  return (
    <Wrapper>
      <Container>
        <Heading as="h1">{t('admin.title')}</Heading>
        <section className="py-10">
          <Link
            href={`/admin/events/create`}
            variant="button-primary"
            testId="add-event-button"
          >
            {t('admin.events.labes.create')}
          </Link>
        </section>
        <Heading as="h2">{t('common.events.sectiontitle')}</Heading>
        <AdminEventList organizationId={ORGANIZATION_ID} includePastEvents />
      </Container>
    </Wrapper>
  );
};

export default withAuthorization(AdminPage, 'Admin');
