;
import { Unauthorized } from '@eventuras/ratio-ui/blocks/Unauthorized';
import { getTranslations } from 'next-intl/server';
import { checkAuthorization } from '@/utils/auth/checkAuthorization';
import FatalError from '@/components/FatalError';
import RegistrationsTable from './RegistrationsTable';
import { getRegistrations } from './actions';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Section } from '@eventuras/ratio-ui/layout/Section';

;
;
;
type PageProps = {
  searchParams: Promise<{ page?: string }>;
};
export default async function AdminRegistrationsPage({ searchParams }: PageProps) {
  // Check authorization
  const authResult = await checkAuthorization('Admin');
  if (!authResult.authorized) {
    return <Unauthorized />;
  }
  const t = await getTranslations();
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = 50;
  const response = await getRegistrations(page, pageSize);
  if (!response.ok || !response.data) {
    return (
      <Section className="py-8">
          <Container>
            <Heading as="h1">{t('common.registrations.page.title')}</Heading>
            <FatalError
              title="Failed to load registrations"
              description={response.error || 'Unknown error'}
            />
          </Container>
        </Section>
    );
  }
  return (
    <>
    <Section className="py-8">
        <Container>
          <Heading as="h1">{t('common.registrations.page.title')}</Heading>
        </Container>
      </Section>
      <Section>
        <Container>
          <RegistrationsTable
            registrations={response.data.data ?? []}
            currentPage={page}
            totalPages={response.data.pages ?? 0}
          />
        </Container>
      </Section>
      </>
  );
}