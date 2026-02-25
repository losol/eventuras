'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@eventuras/ratio-ui/core/Button';
import { Dialog } from '@eventuras/ratio-ui/layout/Dialog';
import { Form, HiddenInput, TextField } from '@eventuras/smartform';

import { EventCollectionCreateDto } from '@/lib/eventuras-sdk';

import { createCollection } from './actions';
const CollectionCreator: React.FC<{ organizationId: number }> = ({ organizationId }) => {
  const t = useTranslations();
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const handleCreateCollection = async (data: EventCollectionCreateDto) => {
    setIsSubmitting(true);
    try {
      const result = await createCollection(data);
      if (result.success && result.data?.collectionId) {
        setModalOpen(false);
        router.push(`/admin/collections/${result.data.collectionId}`);
        router.refresh();
      } else if (!result.success) {
        // Handle error - you might want to show a toast here
        console.error('Failed to create collection:', result.error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Button onClick={() => setModalOpen(!modalOpen)}>
        {t('admin.collection.labels.create')}
      </Button>
      <Dialog isOpen={modalOpen} onClose={() => setModalOpen(false)} title={'Add collection'}>
        <Form onSubmit={data => handleCreateCollection(data as EventCollectionCreateDto)}>
          <HiddenInput name="organizationId" value={organizationId.toString()} />
          <TextField name="name" label={t('common.labels.name')} />
          <Button type="submit" loading={isSubmitting}>
            {t('admin.collection.labels.create')}
          </Button>
        </Form>
      </Dialog>
    </>
  );
};
export default CollectionCreator;
