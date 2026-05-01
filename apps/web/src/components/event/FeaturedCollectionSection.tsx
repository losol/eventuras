import { MarkdownContent } from '@eventuras/markdown';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { CategoryGroupedEvents } from '@/components/event/CategoryGroupedEvents';
import { EventCollectionDto, EventDto } from '@/lib/eventuras-sdk';

interface FeaturedCollectionSectionProps {
  collection: EventCollectionDto;
  events: EventDto[];
}

export const FeaturedCollectionSection: React.FC<FeaturedCollectionSectionProps> = ({
  collection,
  events,
}) => {
  return (
    <Section paddingY="lg">
      {collection.featuredImageUrl && (
        <Card className="min-h-[33vh] mx-auto" backgroundImageUrl={collection.featuredImageUrl} />
      )}
      <Container>
        <Heading as="h2" paddingTop="sm" paddingBottom="xs">
          <Link href={`/collections/${collection.id}/${collection.slug}`}>{collection.name}</Link>
        </Heading>
        {collection.description && <MarkdownContent markdown={collection.description} />}
        {events.length > 0 && (
          <div className="mt-6">
            <CategoryGroupedEvents events={events} />
          </div>
        )}
        <div className="mt-4">
          <Link
            href={`/collections/${collection.id}/${collection.slug}`}
            variant="button-secondary"
          >
            Se alle kurs i {collection.name}
          </Link>
        </div>
      </Container>
    </Section>
  );
};
