import { Container, Heading } from '@eventuras/ui';
import { DATA_TEST_ID } from '@eventuras/utils';
import createTranslation from 'next-translate/createTranslation';

import Link from '@/components/Link';
import withAuthorization from '@/utils/auth/withAuthorization';
import Environment from '@/utils/Environment';

import Wrapper from '../../components/eventuras/Wrapper';
import AdminEventList from './events/AdminEventList';

const ORGANIZATION_ID: number = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID);
const AdminPage = () => {
  const { t } = createTranslation();
  return (
    <Wrapper>
      <Container>
        <Heading as="h1">{t('admin:title')}</Heading>
        <section className="py-10">
          <Link
            href={`/admin/events/create`}
            variant="button-primary"
            {...{ [DATA_TEST_ID]: 'add-event-button' }}
          >
            {t('admin:events.labes.create')}
          </Link>
          <Link href={`/admin/users/`} variant="button-primary">
            {t('admin:labels.users')}
          </Link>
          <Link href={`/admin/orders/`} variant="button-primary">
            {t('admin:labels.orders')}
          </Link>
          <Link href={`/admin/registrations/`} variant="button-primary">
            {t('admin:labels.registrations')}
          </Link>
          <Link href={`/admin/collections/`} variant="button-primary">
            {t('admin:labels.collections')}
          </Link>
        </section>

        <Heading as="h2">{t('common:events.sectiontitle')}</Heading>
        <Link href={`/admin/events`}>{t('common:labels.allEvents')}</Link>
        <AdminEventList organizationId={ORGANIZATION_ID} />
      </Container>
    </Wrapper>
  );
};

export default withAuthorization(AdminPage, 'Admin');
