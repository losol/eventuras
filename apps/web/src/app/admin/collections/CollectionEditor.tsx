"use client";

import { EventCollectionDto } from '@eventuras/sdk';
import { CheckboxInput, CheckboxLabel, Form,TextInput } from '@eventuras/smartform';
import Button from '@eventuras/ui/Button';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { ApiState, apiWrapper, createSDK } from '@/utils/api/EventurasApi';
import Logger from '@/utils/Logger';
import slugify from '@/utils/slugify';

export type CollectionEditorProps = {
  eventCollection: EventCollectionDto;
};

const CollectionEditor = ({ eventCollection }: CollectionEditorProps) => {
  const [apiState, setApiState] = useState<ApiState>({ error: null, loading: false });
  const eventuras = createSDK({ inferUrl: { enabled: true, requiresToken: true } });
  const router = useRouter();

  const onSubmitForm = async (data: EventCollectionDto) => {
    setApiState({ error: null, loading: true });
    Logger.info({ namespace: 'CollectionEditor' }, 'Updating collection...');
    Logger.info({ namespace: 'EventEditor' }, data);

    // set slug
    const newSlug = slugify(
      [data.name, data.id].filter(Boolean).join('-')
    );
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

  return (
    <Form defaultValues={eventCollection} onSubmit={onSubmitForm} data-test-id="event-collection-edit-form">
      <TextInput name="name" label="Name" placeholder="Collection Name" required />
      <TextInput name="description" label="Description" placeholder="Collection Description" />
      <CheckboxInput name="featured">
        <CheckboxLabel>Featured</CheckboxLabel>
      </CheckboxInput>
      <TextInput name="featuredImageUrl" label="Featured Image URL" placeholder="Image URL" />
      <TextInput name="featuredImageCaption" label="Featured Image Caption" placeholder="Image Caption" />

      <Button type="submit">Submit</Button>
    </Form>
  );
};

export default CollectionEditor;
