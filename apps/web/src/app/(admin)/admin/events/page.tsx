import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { publicEnv } from '@/config.client';

import AdminEventList from './AdminEventList';

interface AdminPageProps {
  searchParams: Promise<{ page?: string }>;
}

const AdminPage = async ({ searchParams }: AdminPageProps) => {
  const t = await getTranslations();
  const params = await searchParams;
  const page = params.page ? Number.parseInt(params.page, 10) : 1;

  return (
    <Container>
      <Heading as="h1">{t('admin.title')}</Heading>
      <section className="py-10">
        <Link href={`/admin/events/create`} variant="button-primary" testId="add-event-button">
          {t('admin.events.labes.create')}
        </Link>
      </section>
      <Heading as="h2">{t('common.events.sectiontitle')}</Heading>
      <AdminEventList
        organizationId={publicEnv.NEXT_PUBLIC_ORGANIZATION_ID}
        includePastEvents
        page={page}
      />
    </Container>
  );
};

export default AdminPage;
