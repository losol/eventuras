import createTranslation from 'next-translate/createTranslation';

import { Container, Layout } from '@/components/ui';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import withAuthorization from '@/utils/auth/withAuthorization';
import Environment from '@/utils/Environment';

import AdminEventList from './AdminEventList';

const ORGANIZATION_ID: number = parseInt(Environment.NEXT_PUBLIC_ORGANIZATION_ID);
const AdminPage = () => {
  const { t } = createTranslation();
  return (
    <Layout>
      <Container>
        <Heading as="h1">{t('admin:title')}</Heading>
        <section className="py-10">
          <Link href={`/admin/events/create`} variant="button-primary">
            {t('admin:events.labes.create')}
          </Link>
        </section>
        <Heading as="h2">{t('common:events.sectiontitle')}</Heading>
        <AdminEventList organizationId={ORGANIZATION_ID} />
      </Container>
    </Layout>
  );
};

export default withAuthorization(AdminPage, 'Admin');
