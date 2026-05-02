import { MarkdownContent } from '@eventuras/markdown';
import { Card } from '@eventuras/ratio-ui/core/Card';
import { Container } from '@eventuras/ratio-ui/layout/Container';
import { Grid } from '@eventuras/ratio-ui/layout/Grid';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { Link } from '@eventuras/ratio-ui-next/Link';

import { EventTile } from '@/components/event/EventTile';
import { EventCollectionDto, EventDto } from '@/lib/eventuras-sdk';

interface FeaturedCollectionSectionProps {
  collection: EventCollectionDto;
  events: EventDto[];
}

export const FeaturedCollectionSection: React.FC<FeaturedCollectionSectionProps> = ({
  collection,
  events,
}) => {
  const collectionHref = `/collections/${collection.id}/${collection.slug}`;

  return (
    <Section paddingY="lg">
      <Container>
        <Card color="primary" padding="sm" radius="xl" shadow="none">
          <Section.Header>
            <Section.Eyebrow>Aktuelt</Section.Eyebrow>
            <Section.Title>{collection.name}</Section.Title>
            <Section.Link as={Link} href={collectionHref}>
              Se hele samlingen
            </Section.Link>
            {collection.description && <MarkdownContent markdown={collection.description} />}
          </Section.Header>
          {events.length > 0 && (
            <Grid cols={{ sm: 2, md: 3, lg: 4 }}>
              {events.map(event => (
                <EventTile key={event.id} event={event} />
              ))}
            </Grid>
          )}
        </Card>
      </Container>
    </Section>
  );
};
