import { Container, Heading } from '@eventuras/ratio-ui';
import { DATA_TEST_ID } from '@eventuras/utils';
import { useTranslations } from 'next-intl';

import Wrapper from '@/components/eventuras/Wrapper';
import Link from '@/components/Link';
import withAuthorization from '@/utils/auth/withAuthorization';
import Environment from '@/utils/Environment';

import AdminEventList from './AdminEventList';

const ORGANIZATION_ID: number = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID);

const AdminPage = () => {
  const t = useTranslations();
  return (
    <Wrapper>
      <Container>
        <Heading as="h1">{t('admin.title')}</Heading>
        <section className="py-10">
          <Link
            href={`/admin/events/create`}
            variant="button-primary"
            {...{ [DATA_TEST_ID]: 'add-event-button' }}
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
