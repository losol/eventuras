import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';

import FatalError from '@/components/FatalError';

import { getCollections } from './actions';
import CollectionCreator from './CollectionCreator';
import CollectionsTable from './CollectionsTable';

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminCollectionsPage({ searchParams }: PageProps) {
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
    <>
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
    </>
  );
}
