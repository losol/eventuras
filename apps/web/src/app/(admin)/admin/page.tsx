import { getTranslations } from 'next-intl/server';

import { ButtonGroup } from '@eventuras/ratio-ui/core/Button';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Box } from '@eventuras/ratio-ui/layout/Box';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { getOrganizationId } from '@/utils/organization';

import AdminEventList from './events/AdminEventList';

interface AdminPageProps {
  searchParams?: Promise<{ page?: string }>;
}
const AdminPage = async (props: AdminPageProps) => {
  const t = await getTranslations();
  const params = props.searchParams ? await props.searchParams : {};
  const page = params.page ? parseInt(params.page, 10) : 1;
  return (
    <Container>
      <Heading as="h1">{t('admin.title')}</Heading>
      <Section className="py-10">
        <ButtonGroup wrap gap="3">
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
        </ButtonGroup>
      </Section>
      <Section padding="py-10">
        <Heading as="h2">{t('common.events.sectiontitle')}</Heading>
        <Box margin="py-2">
          <Link href={`/admin/events`} variant="button-secondary" padding="my-4">
            {t('common.labels.allEvents')}
          </Link>
        </Box>
        <AdminEventList organizationId={getOrganizationId()} page={page} />
      </Section>
    </Container>
  );
};

export default AdminPage;
