import { EventDto } from '@losol/eventuras';
import { SimpleGrid } from '@mantine/core';
import { Card } from 'components/content';
import Link from 'next/link';

const BREAKPOINTS = [
  { maxWidth: 'md', cols: 3, spacing: 'md' },
  { maxWidth: 'sm', cols: 2, spacing: 'sm' },
  { maxWidth: 'xs', cols: 1, spacing: 'sm' },
];

function SingleEvent({ id, title, description }: SingleEventProps) {
  return (
    <Link href={`/events/${id}`}>
      <Card>
        <Card.Heading>{title}</Card.Heading>
        <Card.Text>{description ?? 'More info TBA'}</Card.Text>
      </Card>
    </Link>
  );
}

export default function EventsGrid({ events }: EventsGridProps) {
  if (events.length === 0) return <p className="font-normal">No Events</p>;

  return (
    <SimpleGrid cols={4} spacing="lg" breakpoints={BREAKPOINTS}>
      {events.map((event: EventDto) => (
        <SingleEvent
          key={event.id}
          id={event.id}
          title={event.title}
          description={event.description}
        />
      ))}
    </SimpleGrid>
  );
}

type SingleEventProps = {
  id: EventDto['id'];
  title: EventDto['title'];
  description?: EventDto['description'];
};

type EventsGridProps = {
  events: EventDto[];
};
