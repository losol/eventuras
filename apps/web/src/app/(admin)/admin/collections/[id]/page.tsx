;
import { Logger } from '@eventuras/logger';
import { getTranslations } from 'next-intl/server';
import { getV3EventcollectionsById } from '@eventuras/event-sdk';
import CollectionEditor from '../CollectionEditor';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Section } from '@eventuras/ratio-ui/layout/Section';

;
;
;
type EventCollectionProps = {
  params: Promise<{
    id: number;
  }>;
};
export default async function CollectionDetailPage({ params }: Readonly<EventCollectionProps>) {
  const { id } = await params;
  const t = await getTranslations();
  const response = await getV3EventcollectionsById({
    path: { id },
  });
  if (!response.data) {
    Logger.error(
      { namespace: 'collections' },
      `Failed to fetch collection ${id}, error: ${response.error}`
    );
    return <div>{t('common.event-not-found')}</div>;
  }
  return (
    <>
      <Section className="bg-white dark:bg-black   pb-8">
        <Container>
          <Heading as="h1">{response.data.name ?? ''}</Heading>
        </Container>
      </Section>
      <Section className="bg-white dark:bg-black   pb-8">
        <Container>
          <CollectionEditor eventCollection={response.data} />
        </Container>
      </Section>
    </>
  );
}