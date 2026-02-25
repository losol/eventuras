import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { getOrganizationId } from '@/utils/organization';

import AdminEventList from './AdminEventList';

interface AdminPageProps {
  searchParams: Promise<{ page?: string }>;
}

const AdminPage = async ({ searchParams }: AdminPageProps) => {
  const t = await getTranslations();
  const params = await searchParams;
  const page = params.page ? Number.parseInt(params.page, 10) : 1;
  const organizationId = getOrganizationId();

  return (
    <Container>
      <Heading as="h1">{t('admin.title')}</Heading>
      <Section className="py-10">
        <Link href={`/admin/events/create`} variant="button-primary" testId="add-event-button">
          {t('admin.events.labes.create')}
        </Link>
      </Section>
      <Heading as="h2">{t('common.events.sectiontitle')}</Heading>
      <AdminEventList organizationId={organizationId} includePastEvents page={page} />
    </Container>
  );
};

export default AdminPage;
