'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Logger } from '@eventuras/logger';
import { Button } from '@eventuras/ratio-ui/core/Button';
import { Loading } from '@eventuras/ratio-ui/core/Loading';
import { Trash2 } from '@eventuras/ratio-ui/icons';
import { Section } from '@eventuras/ratio-ui/layout/Section';
import { MarkdownInput } from '@eventuras/scribo';
import { CheckboxInput, CheckboxLabel, Form, TextField } from '@eventuras/smartform';
import { useToast } from '@eventuras/toast';

import EventLookup from '@/components/event/EventLookup';
import { EventCollectionDto, EventDto, getV3Events } from '@/lib/eventuras-sdk';

import { addEventToCollection, removeEventFromCollection, updateCollection } from './actions';

import '@eventuras/scribo/style.css';
export type CollectionEditorProps = {
  eventCollection: EventCollectionDto;
};
const CollectionEditor = ({ eventCollection }: CollectionEditorProps) => {
  const toast = useToast();
  const logger = Logger.create({
    namespace: 'web:admin:collections',
    context: { component: 'CollectionEditor' },
  });
  const [eventListUpdateTrigger, setEventListUpdateTrigger] = useState(0);
  const [eventInfos, setEventInfos] = useState<EventDto[]>([]);
  const [addEventId, setAddEventId] = useState<number | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);
  const [removingEventId, setRemovingEventId] = useState(-1);
  const router = useRouter();
  useEffect(() => {
    const fetchEventInfos = async () => {
      const response = await getV3Events({
        query: {
          CollectionId: eventCollection.id!,
        },
      });
      if (response.data?.data) {
        setEventInfos(response.data.data);
      }
    };
    if (eventCollection?.id) {
      fetchEventInfos();
    }
  }, [eventCollection.id, eventListUpdateTrigger]);
  const onSubmitForm = async (data: EventCollectionDto) => {
    logger.info('Updating collection...');
    setFormSubmitting(true);
    try {
      const result = await updateCollection(data);
      if (result.success) {
        toast.success(result.message || 'Collection successfully updated!');
        router.refresh();
      } else {
        toast.error(result.error.message || 'Something went wrong, try again later');
      }
    } finally {
      setFormSubmitting(false);
    }
  };
  const handleRemoveEvent = async (eventId: number) => {
    logger.info(`Removing event ${eventId} from collection`);
    setRemovingEventId(eventId);
    const result = await removeEventFromCollection(eventId, eventCollection.id!);
    if (result.success) {
      setEventListUpdateTrigger(prev => prev + 1);
      toast.success(result.message || 'Event successfully removed');
      setRemovingEventId(-1);
    } else {
      toast.error(result.error.message || 'Something went wrong, try again later');
      setRemovingEventId(-1);
    }
  };
  const handleAddEvent = async (eventId: number) => {
    logger.info(`Adding event ${eventId} to collection`);
    setAddingEvent(true);
    const result = await addEventToCollection(eventId, eventCollection.id!);
    if (result.success) {
      setEventListUpdateTrigger(prev => prev + 1);
      toast.success(result.message || 'Event successfully added');
    } else {
      toast.error(result.error.message || 'Something went wrong, try again later');
    }
    setAddingEvent(false);
    setAddEventId(null);
  };
  const handleAddEventClick = () => {
    if (addEventId !== null) {
      handleAddEvent(addEventId);
    } else {
      logger.error('Please enter a valid event ID');
    }
  };
  // Calculate date 3 months ago for event lookup constraints
  const minus3Months = new Date();
  minus3Months.setMonth(minus3Months.getMonth() - 3);
  return (
    <>
      <Section>
        <Form
          defaultValues={eventCollection}
          onSubmit={onSubmitForm}
          testId="event-collection-edit-form"
        >
          <TextField name="name" label="Name" placeholder="Collection Name" required />
          <MarkdownInput
            name="description"
            label="Description"
            placeholder="Collection Description"
          />
          <TextField name="slug" label="Slug" placeholder="Collection Slug" disabled />
          <CheckboxInput name="featured">
            <CheckboxLabel>Featured</CheckboxLabel>
          </CheckboxInput>
          <TextField name="featuredImageUrl" label="Featured Image URL" placeholder="Image URL" />
          <TextField
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
                <Trash2 size={24} />
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
              start: minus3Months.toISOString(),
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
