import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { appConfig } from '@/config.server';

import AdminEventList from './events/AdminEventList';

interface AdminPageProps {
  searchParams?: Promise<{ page?: string }>;
}
const AdminPage = async ({ searchParams }: AdminPageProps = {}) => {
  const t = await getTranslations();
  const params = searchParams ? await searchParams : {};
  const page = params.page ? parseInt(params.page, 10) : 1;
  return (
    <Container>
      <Heading as="h1">{t('admin.title')}</Heading>
      <section className="py-10">
        <Link href={`/admin/events/create`} variant="button-primary" testId="add-event-button">
          {t('admin.events.labes.create')}
        </Link>
        <Link href={`/admin/users/`} variant="button-primary">
          {t('admin.labels.users')}
        </Link>
        <Link href={`/admin/orders/`} variant="button-primary">
          {t('admin.labels.orders')}
        </Link>
        <Link href={`/admin/registrations/`} variant="button-primary">
          {t('admin.labels.registrations')}
        </Link>
        <Link href={`/admin/collections/`} variant="button-primary">
          {t('admin.labels.collections')}
        </Link>
      </section>
      <Heading as="h2">{t('common.events.sectiontitle')}</Heading>
      <Link href={`/admin/events`}>{t('common.labels.allEvents')}</Link>
      <AdminEventList
        organizationId={
          typeof appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID === 'number'
            ? appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID
            : parseInt(appConfig.env.NEXT_PUBLIC_ORGANIZATION_ID as string, 10)
        }
        page={page}
      />
    </Container>
  );
};

export default AdminPage;
