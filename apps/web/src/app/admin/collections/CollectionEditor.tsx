'use client';

import { EventCollectionDto, EventDto } from '@eventuras/sdk';
import { CheckboxInput, CheckboxLabel, Form, TextInput } from '@eventuras/smartform';
import Button from '@eventuras/ui/Button';
import Section from '@eventuras/ui/Section';
import { IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { ApiState, apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Logger from '@/utils/Logger';
import slugify from '@/utils/slugify';

export type CollectionEditorProps = {
  eventCollection: EventCollectionDto;
};

const CollectionEditor = ({ eventCollection }: CollectionEditorProps) => {
  const [apiState, setApiState] = useState<ApiState>({ error: null, loading: false });
  const [eventListUpdateTrigger, setEventListUpdateTrigger] = useState(0);
  const [eventInfos, setEventInfos] = useState<EventDto[]>([]);
  const [addEventId, setAddEventId] = useState<number | null>(null);

  const eventuras = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const router = useRouter();

  useEffect(() => {
    const fetchEventInfos = async () => {
      setApiState({ error: null, loading: true });
      const result = await apiWrapper(() =>
        eventuras.events.getV3Events({
          collectionId: eventCollection.id!,
        })
      );

      if (result.ok) {
        setEventInfos(result.value?.data ?? []);
      } else {
        setApiState({ error: result.error, loading: false });
      }

      setApiState({ error: null, loading: false });
    };

    if (eventCollection?.id) {
      fetchEventInfos();
    }
  }, [eventCollection.id, eventListUpdateTrigger]);

  const onSubmitForm = async (data: EventCollectionDto) => {
    setApiState({ error: null, loading: true });
    Logger.info({ namespace: 'CollectionEditor' }, 'Updating collection...');
    Logger.info({ namespace: 'EventEditor' }, data);

    // set slug
    const newSlug = slugify([data.name, data.id].filter(Boolean).join('-'));
    data.slug = newSlug;

    const result = await apiWrapper(() =>
      eventuras.eventCollection.putV3Eventcollections({
        id: data.id!,
        requestBody: data,
      })
    );

    Logger.info({ namespace: 'eventeditor' }, result);

    setApiState({ error: null, loading: false });

    router.refresh();
  };

  const handleChangeAddEventId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const eventId = parseInt(e.target.value, 10);
    if (!isNaN(eventId)) {
      setAddEventId(eventId);
    } else {
      setAddEventId(null);
    }
  };

  const handleRemoveEvent = async (eventId: number) => {
    Logger.info({ namespace: 'CollectionEditor' }, `Removing event ${eventId} from collection`);
    setApiState({ error: null, loading: true });
    const result = await apiWrapper(() =>
      eventuras.eventCollectionMapping.deleteV3EventsCollections({
        eventId: eventId,
        collectionId: eventCollection.id!,
      })
    );

    if (result.ok) {
      setEventListUpdateTrigger(prev => prev + 1);
    }
    setApiState({ error: null, loading: false });
    router.refresh();
  };

  const handleAddEvent = async (eventId: number) => {
    Logger.info({ namespace: 'CollectionEditor' }, `Adding event ${eventId} to collection`);
    setApiState({ error: null, loading: true });
    const result = await apiWrapper(() =>
      eventuras.eventCollectionMapping.putV3EventsCollections({
        eventId: eventId,
        collectionId: eventCollection.id!,
      })
    );

    if (result.ok) {
      setEventListUpdateTrigger(prev => prev + 1);
    }
    setApiState({ error: null, loading: false });
    setAddEventId(null);
  };

  const handleAddEventClick = () => {
    if (addEventId !== null) {
      handleAddEvent(addEventId);
      router.refresh();
    } else {
      Logger.error({ namespace: 'CollectionEditor' }, 'Please enter a valid event ID');
    }
  };

  return (
    <>
      <Section>
        <Form
          defaultValues={eventCollection}
          onSubmit={onSubmitForm}
          data-test-id="event-collection-edit-form"
        >
          <TextInput name="name" label="Name" placeholder="Collection Name" required />
          <TextInput name="description" label="Description" placeholder="Collection Description" />
          <CheckboxInput name="featured">
            <CheckboxLabel>Featured</CheckboxLabel>
          </CheckboxInput>
          <TextInput name="featuredImageUrl" label="Featured Image URL" placeholder="Image URL" />
          <TextInput
            name="featuredImageCaption"
            label="Featured Image Caption"
            placeholder="Image Caption"
          />

          <Button type="submit">Submit</Button>
        </Form>
      </Section>
      <Section>
        <h2>Events</h2>

        {eventInfos.map(eventInfo => (
          <div key={eventInfo.id} className="flex justify-between items-center p-2">
            <span>{eventInfo.title}</span>
            <button onClick={() => handleRemoveEvent(eventInfo.id!)} aria-label="Delete event">
              <IconTrash size={24} />
            </button>
          </div>
        ))}
      </Section>
      <Section>
        <h2>Add Event to Collection</h2>
        <div className="flex gap-2 items-center">
          <label htmlFor="newEventId">Event ID:</label>
          <input
            id="newEventId"
            type="text"
            placeholder="Enter Event ID"
            value={addEventId !== null ? addEventId.toString() : ''}
            onChange={handleChangeAddEventId}
            className="border-2 border-gray-200 rounded dark:text-black"
          />
          <button onClick={handleAddEventClick}>Add Event</button>
        </div>
      </Section>
    </>
  );
};

export default CollectionEditor;
