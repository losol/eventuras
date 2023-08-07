'use client';

import { EventDto } from '@losol/eventuras';
import { Card } from 'components/content';
import Link from 'next/link';

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
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 lg:gap-3 xl:grid-cols-4 xl:gap-4">
      {events.map((event: EventDto) => (
        <SingleEvent
          key={event.id}
          id={event.id}
          title={event.title}
          description={event.description}
        />
      ))}
    </div>
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
