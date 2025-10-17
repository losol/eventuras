'use client';

import { MarkdownInput } from '@eventuras/markdowninput';
import { EventCollectionDto, EventDto } from '@eventuras/sdk';
import { CheckboxInput, CheckboxLabel, Form, Input } from '@eventuras/smartform';
import { Button, Loading, Section } from '@eventuras/ratio-ui';
import { Logger } from '@eventuras/utils/src/Logger';
import { IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import EventLookup from '@/components/event/EventLookup';
import { useToast } from '@eventuras/toast';
import { apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import slugify from '@/utils/slugify';

export type CollectionEditorProps = {
  eventCollection: EventCollectionDto;
};

const CollectionEditor = ({ eventCollection }: CollectionEditorProps) => {
  const toast = useToast();

  const [eventListUpdateTrigger, setEventListUpdateTrigger] = useState(0);
  const [eventInfos, setEventInfos] = useState<EventDto[]>([]);
  const [addEventId, setAddEventId] = useState<number | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);
  const [removingEventId, setRemovingEventId] = useState(-1);

  const eventuras = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const router = useRouter();

  useEffect(() => {
    const fetchEventInfos = async () => {
      const result = await apiWrapper(() =>
        eventuras.events.getV3Events({
          collectionId: eventCollection.id!,
        })
      );

      if (result.ok) {
        setEventInfos(result.value?.data ?? []);
      }
    };

    if (eventCollection?.id) {
      fetchEventInfos();
    }
  }, [eventCollection.id, eventListUpdateTrigger]);

  const onSubmitForm = async (data: EventCollectionDto) => {
    Logger.info({ namespace: 'CollectionEditor' }, 'Updating collection...');
    Logger.info({ namespace: 'EventEditor' }, data);
    setFormSubmitting(true);
    // set slug
    const newSlug = slugify([data.name, data.id].filter(Boolean).join('-'));
    data.slug = newSlug;

    const result = await apiWrapper(() =>
      eventuras.eventCollection.putV3Eventcollections({
        id: data.id!,
        requestBody: data,
      })
    );

    if (result.ok) {
      toast.success('Collection successfully updated!');
    } else {
      toast.error('Something went wrong, try again later');
    }

    Logger.info({ namespace: 'eventeditor' }, result);

    setFormSubmitting(false);
    router.refresh();
  };

  const handleRemoveEvent = async (eventId: number) => {
    Logger.info({ namespace: 'CollectionEditor' }, `Removing event ${eventId} from collection`);
    setRemovingEventId(eventId);
    const result = await apiWrapper(() =>
      eventuras.eventCollectionMapping.deleteV3EventsCollections({
        eventId: eventId,
        collectionId: eventCollection.id!,
      })
    );

    if (result.ok) {
      setEventListUpdateTrigger(prev => prev + 1);
    }

    if (result.ok) {
      toast.success('Event successfully removed');
    } else {
      toast.error('Something went wrong, try again later');
    }
  };

  const handleAddEvent = async (eventId: number) => {
    Logger.info({ namespace: 'CollectionEditor' }, `Adding event ${eventId} to collection`);
    setRemovingEventId(-1);
    setAddingEvent(true);
    const result = await apiWrapper(() =>
      eventuras.eventCollectionMapping.putV3EventsCollections({
        eventId: eventId,
        collectionId: eventCollection.id!,
      })
    );

    if (result.ok) {
      setEventListUpdateTrigger(prev => prev + 1);
    }
    if (result.ok) {
      toast.success('Event Successfully Added');
    } else {
      toast.error('Something went wrong, try again later');
    }
    setAddingEvent(false);
    setAddEventId(null);
  };

  const handleAddEventClick = () => {
    if (addEventId !== null) {
      handleAddEvent(addEventId);
    } else {
      Logger.error({ namespace: 'CollectionEditor' }, 'Please enter a valid event ID');
    }
  };
  const minus3Months = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  return (
    <>
      <Section>
        <Form
          defaultValues={eventCollection}
          onSubmit={onSubmitForm}
          testId="event-collection-edit-form"
        >
          <Input name="name" label="Name" placeholder="Collection Name" required />
          <MarkdownInput
            name="description"
            label="Description"
            placeholder="Collection Description"
          />
          <Input name="slug" label="Slug" placeholder="Collection Slug" disabled />
          <CheckboxInput name="featured">
            <CheckboxLabel>Featured</CheckboxLabel>
          </CheckboxInput>
          <Input name="featuredImageUrl" label="Featured Image URL" placeholder="Image URL" />
          <Input
            name="featuredImageCaption"
            label="Featured Image Caption"
            placeholder="Image Caption"
          />

          <Button type="submit" loading={formSubmitting}>
            Submit
          </Button>
        </Form>
      </Section>
      <Section>
        <h2>Events</h2>

        {eventInfos.map(eventInfo => (
          <div key={eventInfo.id} className="flex justify-between items-center p-2">
            <span>{eventInfo.title}</span>

            {removingEventId === eventInfo.id ? (
              <Loading />
            ) : (
              <button onClick={() => handleRemoveEvent(eventInfo.id!)} aria-label="Delete event">
                <IconTrash size={24} />
              </button>
            )}
          </div>
        ))}
      </Section>
      <Section>
        <h2>Add Event to Collection</h2>
        <div className="flex gap-2 items-center">
          <label htmlFor="newEventId">Event ID:</label>
          <EventLookup
            id="newEventId"
            onEventSelected={item => {
              setAddEventId(item.id!);
            }}
            eventLookupConstraints={{
              start: {
                year: minus3Months.getFullYear(),
                month: minus3Months.getMonth(),
                day: minus3Months.getDate(),
              },
            }}
          />
          <Button
            disabled={addEventId === null}
            loading={addingEvent}
            onClick={handleAddEventClick}
          >
            Add Event
          </Button>
        </div>
      </Section>
    </>
  );
};

export default CollectionEditor;
