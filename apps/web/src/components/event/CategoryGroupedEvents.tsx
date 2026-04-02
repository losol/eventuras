import { getTranslations } from 'next-intl/server';

import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Grid } from '@eventuras/ratio-ui/layout/Grid';

import EventCard from '@/components/event/EventCard';
import { EventDto } from '@/lib/eventuras-sdk';

interface CategoryGroupedEventsProps {
  events: EventDto[];
}

function groupByCategory(events: EventDto[]): Map<string, EventDto[]> {
  const groups = new Map<string, EventDto[]>();
  for (const event of events) {
    const category = event.category ?? '';
    const group = groups.get(category);
    if (group) {
      group.push(event);
    } else {
      groups.set(category, [event]);
    }
  }
  return groups;
}

export const CategoryGroupedEvents = async ({ events }: CategoryGroupedEventsProps) => {
  const groups = groupByCategory(events);
  const hasCategories = groups.size > 1 || (groups.size === 1 && !groups.has(''));

  if (!hasCategories) {
    return (
      <Grid>
        {events.map(eventinfo => (
          <EventCard key={eventinfo.id} eventinfo={eventinfo} />
        ))}
      </Grid>
    );
  }

  const t = await getTranslations();

  return (
    <div className="space-y-8">
      {Array.from(groups.entries()).map(([category, categoryEvents]) => (
        <div key={category || '__uncategorized'}>
          <Heading as="h3" padding="pb-3">
            {category || t('common.events.otherCategory')}
          </Heading>
          <Grid>
            {categoryEvents.map(eventinfo => (
              <EventCard key={eventinfo.id} eventinfo={eventinfo} />
            ))}
          </Grid>
        </div>
      ))}
    </div>
  );
};
