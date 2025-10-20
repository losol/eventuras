import { Container, Heading, Section } from '@eventuras/ratio-ui';
import { Unauthorized } from '@eventuras/ratio-ui/blocks/Unauthorized';
import { getTranslations } from 'next-intl/server';

import { checkAuthorization } from '@/utils/auth/checkAuthorization';
import FatalError from '@/components/FatalError';

import CollectionCreator from './CollectionCreator';
import CollectionsTable from './CollectionsTable';
import { getCollections } from './actions';

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminCollectionsPage({ searchParams }: PageProps) {
  // Check authorization
  const authResult = await checkAuthorization('Admin');
  if (!authResult.authorized) {
    return <Unauthorized />;
  }

  const t = await getTranslations();
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = 100;

  const response = await getCollections(page, pageSize);

  if (!response.ok || !response.data) {
    return (
      <Container>
          <Heading as="h1">{t('common.collections.page.title')}</Heading>
          <FatalError
            title="Failed to load collections"
            description={response.error || 'Unknown error'}
          />
        </Container>
    );
  }

  return (
    <Container>
        <Heading as="h1">{t('common.collections.page.title')}</Heading>
        <CollectionCreator />
      </Container>
      <Section>
        <Container>
          <CollectionsTable
            collections={response.data.data ?? []}
            currentPage={page}
            totalPages={response.data.pages ?? 0}
          />
        </Container>
      </Section>
  );
}
