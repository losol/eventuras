import { Container } from '@eventuras/ui';
import Heading from '@eventuras/ui/Heading';
import Link from '@eventuras/ui/Link';
import createTranslation from 'next-translate/createTranslation';

import FixedContainer from '@/components/eventuras/navigation/FixedContainer';
import withAuthorization from '@/utils/auth/withAuthorization';
import Environment from '@/utils/Environment';

import AdminEventList from './AdminEventList';

const ORGANIZATION_ID: number = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID);
const AdminPage = () => {
  const { t } = createTranslation();
  return (
    <FixedContainer>
      <Container>
        <Heading as="h1">{t('admin:title')}</Heading>
        <section className="py-10">
          <Link
            href={`/admin/events/create`}
            variant="button-primary"
            data-test-id="add-event-button"
          >
            {t('admin:events.labes.create')}
          </Link>
        </section>
        <Heading as="h2">{t('common:events.sectiontitle')}</Heading>
        <AdminEventList organizationId={ORGANIZATION_ID} includePastEvents />
      </Container>
    </FixedContainer>
  );
};

export default withAuthorization(AdminPage, 'Admin');
